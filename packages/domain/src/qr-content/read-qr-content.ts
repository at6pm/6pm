/** What an everyday QR code (not a payment) says, read for what Scan offers to do with it. */
export type QrContent =
  | { readonly kind: 'link'; readonly url: string; readonly host: string }
  | {
      readonly kind: 'wifi';
      readonly network: string;
      readonly password: string | null;
      readonly security: 'wpa' | 'wep' | 'open';
      readonly hidden: boolean;
    }
  | {
      /** MoMo's own payment link, which MoMo's app opens on its payment screen to confirm. */
      readonly kind: 'momoPayment';
      readonly url: string;
      readonly amount: number | null;
    }
  | { readonly kind: 'phone'; readonly number: string }
  | { readonly kind: 'sms'; readonly number: string; readonly body: string | null }
  | {
      readonly kind: 'email';
      readonly address: string;
      readonly subject: string | null;
      readonly body: string | null;
    }
  | {
      readonly kind: 'place';
      readonly latitude: number;
      readonly longitude: number;
      readonly label: string | null;
    }
  | {
      readonly kind: 'contact';
      readonly name: string | null;
      readonly organisation: string | null;
      readonly phones: readonly string[];
      readonly emails: readonly string[];
    }
  | { readonly kind: 'text'; readonly text: string };

const MAX_TEXT = 4000;
// Control characters other than tab and line breaks mean a misread, not words.
// eslint-disable-next-line no-control-regex
const CONTROL = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/;
const HTTP = /^(https?):\/\/([^\s/?#@]*@)?([^\s/?#:]+)(:\d{1,5})?([/?#]\S*)?$/i;
const WWW = /^www\.[^\s/?#]+\.[a-z]{2,}([/?#]\S*)?$/i;
const NUMBER = /^\+?[0-9][0-9 ().-]{2,19}$/;
const ADDRESS = /^[^\s@<>()]+@[^\s@<>()]+\.[^\s@<>()]{2,}$/;

/**
 * Reads a scanned code that is not a payment: a web link, Wi-Fi sign-in, phone number, text
 * message, email, place, contact card (vCard or MECARD) or plain text. Only `http` and `https`
 * make a link, so a code can never ask the phone to open another app's scheme. Null for an empty
 * or unreadable payload.
 */
export function readQrContent(input: string): QrContent | null {
  const raw = input.trim();
  if (raw === '' || raw.length > MAX_TEXT || CONTROL.test(raw)) return null;
  const lower = raw.toLowerCase();

  const link = readLink(raw);
  if (link) return link;
  if (lower.startsWith('momo://app?')) return readMomoPayment(raw) ?? text(raw);
  if (lower.startsWith('wifi:')) return readWifi(raw.slice(5)) ?? text(raw);
  if (lower.startsWith('tel:')) return phone(raw.slice(4)) ?? text(raw);
  if (lower.startsWith('smsto:') || lower.startsWith('sms:')) return readSms(raw) ?? text(raw);
  if (lower.startsWith('mailto:')) return readMailto(raw.slice(7)) ?? text(raw);
  if (lower.startsWith('matmsg:')) return readMatmsg(raw.slice(7)) ?? text(raw);
  if (lower.startsWith('geo:')) return readGeo(raw.slice(4)) ?? text(raw);
  if (lower.startsWith('begin:vcard')) return readVCard(raw) ?? text(raw);
  if (lower.startsWith('mecard:')) return readMeCard(raw.slice(7)) ?? text(raw);
  return text(raw);
}

function text(value: string): QrContent {
  return { kind: 'text', text: value };
}

function readLink(raw: string): QrContent | null {
  if (/\s/.test(raw)) return null;
  const match = HTTP.exec(raw);
  if (match?.[3]) return { kind: 'link', url: raw, host: match[3].toLowerCase() };
  if (WWW.test(raw)) {
    const host = raw.split(/[/?#]/)[0] ?? raw;
    return { kind: 'link', url: `https://${raw}`, host: host.toLowerCase() };
  }
  return null;
}

function decode(value: string): string {
  try {
    return decodeURIComponent(value.replace(/\+/g, ' '));
  } catch {
    return value;
  }
}

/** `a=1&b=two%20words` as a map; the first of a repeated key wins. */
function queryOf(query: string): Map<string, string> {
  const found = new Map<string, string>();
  for (const pair of query.split('&')) {
    const at = pair.indexOf('=');
    if (at <= 0) continue;
    const key = pair.slice(0, at).toLowerCase();
    if (!found.has(key)) found.set(key, decode(pair.slice(at + 1)));
  }
  return found;
}

/**
 * `momo://app?action=payWithApp&…`: the link a MoMo checkout shows as a QR, which MoMo's app takes
 * to its payment screen. It is the one app link 6pm opens, and only this action of it; any other
 * `momo://` link stays text.
 */
function readMomoPayment(raw: string): QrContent | null {
  if (/\s/.test(raw)) return null;
  const params = queryOf(raw.slice(raw.indexOf('?') + 1));
  if (params.get('action')?.toLowerCase() !== 'paywithapp') return null;
  const amount = Number(params.get('amount'));
  return {
    kind: 'momoPayment',
    url: raw,
    amount: Number.isInteger(amount) && amount > 0 ? amount : null,
  };
}

function phone(value: string): QrContent | null {
  const number = value.trim();
  return NUMBER.test(number) ? { kind: 'phone', number } : null;
}

/** Fields of `K:value;K:value;;`, where `\` escapes `;`, `,`, `:`, `"` and itself. */
function fields(body: string): Map<string, string> {
  const found = new Map<string, string>();
  let key = '';
  let value = '';
  let inKey = true;
  const finish = () => {
    if (key !== '' && !found.has(key.toUpperCase())) found.set(key.toUpperCase(), value);
    key = '';
    value = '';
    inKey = true;
  };
  for (let i = 0; i < body.length; i++) {
    const ch = body.charAt(i);
    if (ch === '\\' && i + 1 < body.length) {
      i++;
      if (inKey) key += body.charAt(i);
      else value += body.charAt(i);
    } else if (inKey && ch === ':') {
      inKey = false;
    } else if (ch === ';') {
      finish();
    } else if (inKey) {
      key += ch;
    } else {
      value += ch;
    }
  }
  finish();
  return found;
}

/** `WIFI:T:WPA;S:name;P:password;H:true;;` (the ZXing format every phone camera writes). */
function readWifi(body: string): QrContent | null {
  const f = fields(body);
  const network = f.get('S');
  if (!network) return null;
  const type = (f.get('T') ?? '').toUpperCase();
  const security = type === 'WEP' ? 'wep' : type === '' || type === 'NOPASS' ? 'open' : 'wpa';
  const password = f.get('P') || null;
  return {
    kind: 'wifi',
    network,
    password: security === 'open' ? null : password,
    security: password === null && security !== 'open' ? 'open' : security,
    hidden: (f.get('H') ?? '').toLowerCase() === 'true',
  };
}

function readSms(raw: string): QrContent | null {
  const rest = raw.slice(raw.indexOf(':') + 1);
  const isSmsTo = raw.toLowerCase().startsWith('smsto:');
  if (isSmsTo) {
    const at = rest.indexOf(':');
    const number = (at < 0 ? rest : rest.slice(0, at)).trim();
    const body = at < 0 ? '' : rest.slice(at + 1);
    return NUMBER.test(number) ? { kind: 'sms', number, body: body === '' ? null : body } : null;
  }
  const [to = '', query = ''] = rest.split('?');
  const number = decode(to).trim();
  if (!NUMBER.test(number)) return null;
  const body = queryOf(query).get('body');
  return { kind: 'sms', number, body: body === undefined || body === '' ? null : body };
}

function readMailto(rest: string): QrContent | null {
  const [to = '', query = ''] = rest.split('?');
  const address = decode(to).trim();
  if (!ADDRESS.test(address)) return null;
  const params = queryOf(query);
  return {
    kind: 'email',
    address,
    subject: params.get('subject') || null,
    body: params.get('body') || null,
  };
}

/** DoCoMo's `MATMSG:TO:a@b.com;SUB:subject;BODY:text;;`. */
function readMatmsg(body: string): QrContent | null {
  const f = fields(body);
  const address = (f.get('TO') ?? '').trim();
  if (!ADDRESS.test(address)) return null;
  return { kind: 'email', address, subject: f.get('SUB') || null, body: f.get('BODY') || null };
}

function readGeo(rest: string): QrContent | null {
  const [point = '', ...query] = rest.split('?');
  const [lat, lng] = point.split(';')[0]?.split(',') ?? [];
  const latitude = Number(lat);
  const longitude = Number(lng);
  if (lat === undefined || lng === undefined || lat.trim() === '' || lng.trim() === '') return null;
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null;
  if (Math.abs(latitude) > 90 || Math.abs(longitude) > 180) return null;
  const label = queryOf(query.join('?')).get('q');
  return { kind: 'place', latitude, longitude, label: label || null };
}

function unfold(raw: string): string[] {
  return raw
    .replace(/\r\n?/g, '\n')
    .replace(/\n[ \t]/g, '')
    .split('\n');
}

function readVCard(raw: string): QrContent | null {
  let name: string | null = null;
  let structured: string | null = null;
  let organisation: string | null = null;
  const phones: string[] = [];
  const emails: string[] = [];
  for (const line of unfold(raw)) {
    const colon = line.indexOf(':');
    if (colon < 0) continue;
    const property = (line.slice(0, colon).split(';')[0] ?? '').toUpperCase();
    const value = line.slice(colon + 1).trim();
    if (value === '') continue;
    if (property === 'FN') name = value;
    else if (property === 'N') {
      const [family = '', given = ''] = value.split(';');
      structured = `${given} ${family}`.trim() || null;
    } else if (property === 'ORG') organisation = value.split(';').join(' ').trim() || null;
    else if (property === 'TEL') phones.push(value);
    else if (property === 'EMAIL') emails.push(value);
  }
  const shown = name ?? structured;
  if (shown === null && phones.length === 0 && emails.length === 0) return null;
  return { kind: 'contact', name: shown, organisation, phones, emails };
}

/** DoCoMo's `MECARD:N:Family,Given;TEL:…;EMAIL:…;ORG:…;;` (a `,` in N splits the name). */
function readMeCard(body: string): QrContent | null {
  const phones: string[] = [];
  const emails: string[] = [];
  let name: string | null = null;
  let organisation: string | null = null;
  // Repeated keys (several TEL) matter here, so read the pairs directly.
  for (const pair of body.split(/(?<!\\);/)) {
    const colon = pair.indexOf(':');
    if (colon < 0) continue;
    const key = pair.slice(0, colon).toUpperCase();
    const value = pair
      .slice(colon + 1)
      .replace(/\\([;,:"\\])/g, '$1')
      .trim();
    if (value === '') continue;
    if (key === 'N') {
      const [family = '', given = ''] = value.split(',');
      name = `${given} ${family}`.trim() || null;
    } else if (key === 'TEL') phones.push(value);
    else if (key === 'EMAIL') emails.push(value);
    else if (key === 'ORG') organisation = value;
  }
  if (name === null && phones.length === 0 && emails.length === 0) return null;
  return { kind: 'contact', name, organisation, phones, emails };
}
