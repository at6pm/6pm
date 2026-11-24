/**
 * Max codes: the places a Max offer is handed out from, and the links that carry one. The codes
 * themselves are the stores' (App Store offer codes, Google Play promo codes); 6pm only points at
 * them and remembers, on the phone, which place a person came from. Nothing here names a person.
 */

/**
 * Where a Max code came from: a place 6pm posts in, a friend's link, or `other` for a code typed
 * into the store's own redemption with no link before it.
 */
export const MAX_CHANNELS = [
  'threads',
  'youtube',
  'facebook',
  'tinhte',
  'friend',
  'other',
] as const;
export type MaxChannel = (typeof MAX_CHANNELS)[number];

/** The channels with a link of their own, `at6pm.app/r/<channel>`. */
export const MAX_LINK_CHANNELS = [
  'threads',
  'youtube',
  'facebook',
  'tinhte',
  'friend',
] as const satisfies readonly MaxChannel[];
export type MaxLinkChannel = (typeof MAX_LINK_CHANNELS)[number];

/** Reads a channel from a link, a route parameter or a kept value; anything else is null. */
export function parseMaxChannel(raw: unknown): MaxChannel | null {
  const value: unknown = Array.isArray(raw) ? raw[0] : raw;
  if (typeof value !== 'string') return null;
  const lower = value.trim().toLowerCase();
  return (MAX_CHANNELS as readonly string[]).includes(lower) ? (lower as MaxChannel) : null;
}

/**
 * A code as both stores accept it: letters and digits only, at most 64 (the App Store's custom
 * code limit), upper-cased, since neither store tells cases apart. Null for anything else.
 */
export function parseMaxCode(raw: unknown): string | null {
  const value: unknown = Array.isArray(raw) ? raw[0] : raw;
  if (typeof value !== 'string') return null;
  const code = value.trim().toUpperCase();
  return /^[A-Z0-9]{1,64}$/.test(code) ? code : null;
}

/**
 * The App Store's own redemption page for an offer code: it asks the person to get 6pm first if
 * they have not, then shows the offer with the code filled in. Without a code it opens empty.
 */
export function appStoreRedeemUrl(appleAppId: string, code: string | null): string {
  const base = `https://apps.apple.com/redeem?ctx=offercodes&id=${encodeURIComponent(appleAppId)}`;
  return code === null ? base : `${base}&code=${encodeURIComponent(code)}`;
}

/** The install referrer's source for a Max code link, so 6pm's own links are told from others. */
const REFERRER_SOURCE = 'at6pm';
const REFERRER_MEDIUM = 'max-code';

/**
 * The text Google Play hands back to the app after an install from a code link
 * (`utm_source=at6pm&utm_medium=max-code&utm_campaign=<channel>&utm_content=<code>`).
 */
export function maxCodeReferrer(channel: MaxLinkChannel, code: string | null): string {
  const parts = [
    `utm_source=${REFERRER_SOURCE}`,
    `utm_medium=${REFERRER_MEDIUM}`,
    `utm_campaign=${channel}`,
  ];
  if (code !== null) parts.push(`utm_content=${code}`);
  return parts.join('&');
}

/** 6pm's Google Play listing, carrying a code link's channel and code to the app once installed. */
export function playListingWithCode(
  packageName: string,
  channel: MaxLinkChannel,
  code: string | null,
): string {
  const referrer = encodeURIComponent(maxCodeReferrer(channel, code));
  return `https://play.google.com/store/apps/details?id=${encodeURIComponent(packageName)}&referrer=${referrer}`;
}

export interface MaxCodeArrival {
  readonly channel: MaxChannel;
  readonly code: string | null;
}

/**
 * What an install referrer says about a Max code link: the channel and the code, or null when the
 * install came some other way (organic, an ad, another site). Google Play may hand the referrer
 * back still encoded, or with its parts in another order.
 */
export function maxCodeFromReferrer(referrer: string | null | undefined): MaxCodeArrival | null {
  if (!referrer) return null;
  let text = referrer.trim();
  if (!text.includes('=') && text.includes('%3D')) {
    try {
      text = decodeURIComponent(text);
    } catch {
      return null;
    }
  }
  const fields = new Map<string, string>();
  for (const part of text.replace(/^\?/, '').split('&')) {
    const at = part.indexOf('=');
    if (at <= 0) continue;
    try {
      fields.set(part.slice(0, at), decodeURIComponent(part.slice(at + 1).replace(/\+/g, ' ')));
    } catch {
      return null;
    }
  }
  if (fields.get('utm_source') !== REFERRER_SOURCE) return null;
  if (fields.get('utm_medium') !== REFERRER_MEDIUM) return null;
  const channel = parseMaxChannel(fields.get('utm_campaign'));
  if (channel === null) return null;
  return { channel, code: parseMaxCode(fields.get('utm_content')) };
}

/**
 * The link inside 6pm that a code link hands over: `/app/r/<channel>?code=<code>` on the site's
 * host. iPhone and Android both open it in 6pm when it is installed (`/app/*` is the app's).
 */
export function maxCodeAppPath(channel: MaxLinkChannel, code: string | null): string {
  return code === null ? `/app/r/${channel}` : `/app/r/${channel}?code=${encodeURIComponent(code)}`;
}

/**
 * Reads a route inside the app (`/r/<channel>` or `/r/<channel>?code=<code>`, the site's `/app`
 * already taken off) as a code arrival; null for any other route.
 */
export function maxCodeFromRoute(route: string): MaxCodeArrival | null {
  const match = /^\/r\/([a-z]+)\/?(?:\?([^#]*))?(?:#.*)?$/i.exec(route);
  if (!match) return null;
  const channel = parseMaxChannel(match[1]);
  if (channel === null || channel === 'other') return null;
  let code: string | null = null;
  for (const part of (match[2] ?? '').split('&')) {
    if (!part.startsWith('code=')) continue;
    try {
      code = parseMaxCode(decodeURIComponent(part.slice(5)));
    } catch {
      code = null;
    }
  }
  return { channel, code };
}

/** How long a code link counts as where a purchase came from. */
export const MAX_CHANNEL_DAYS = 30;

/** A channel kept on the phone, with when it was kept. */
export interface KeptMaxChannel {
  readonly channel: MaxChannel;
  readonly at: string;
}

/**
 * The channel a purchase made `now` came from: the last one kept, if that was within
 * `MAX_CHANNEL_DAYS`. A kept time that cannot be read, or lies ahead (the clock moved back), counts
 * for nothing: a purchase with no channel is better than one with the wrong one.
 */
export function maxChannelAt(kept: KeptMaxChannel | null, now: Date): MaxChannel | null {
  if (kept === null) return null;
  const at = Date.parse(kept.at);
  if (Number.isNaN(at)) return null;
  const age = now.getTime() - at;
  if (age < 0 || age > MAX_CHANNEL_DAYS * 24 * 60 * 60 * 1000) return null;
  return kept.channel;
}
