import { BANKS, findBank, WORLD_BANKS, type BankInfo } from '../vietqr/bank-catalogue';
import { WORLD_ALERT_APPS } from '../vietqr/world-alert-apps';
import { foldWords } from './spoken-spend';

/**
 * The names iOS shows for Vietnam's banking and wallet apps, as a notification names the app it
 * came from, by the catalogue id of the bank behind it. Folded (no accents, lower case). The
 * catalogue's own short names and ids are matched as well, so a bank missing here is still found
 * when its app is named after it.
 */
const APP_NAMES: Readonly<Record<string, readonly string[]>> = {
  MB: ['mb bank', 'mbbank', 'mb'],
  VCB: ['vcb digibank', 'vcb', 'vietcombank'],
  TCB: ['techcombank mobile', 'techcombank', 'tcb'],
  ACB: ['acb one', 'acb'],
  BIDV: ['bidv smartbanking', 'bidv smart banking', 'bidv'],
  ICB: ['vietinbank ipay', 'ipay', 'vietinbank'],
  VPB: ['vpbank neo', 'vpbank'],
  TPB: ['tpbank mobile', 'tpbank'],
  VBA: ['agribank plus', 'agribank e mobile banking', 'agribank'],
  STB: ['sacombank pay', 'sacombank'],
  HDB: ['hdbank'],
  VIB: ['myvib', 'my vib', 'vib'],
  OCB: ['ocb omni', 'ocb'],
  SHB: ['shb saha', 'saha', 'shb mobile', 'shb'],
  MSB: ['msb mbank', 'msb'],
  CAKE: ['cake by vpbank', 'cake'],
  TIMO: ['timo'],
  MOMO: ['vi momo', 'momo'],
  ZALOPAY: ['zalopay', 'zalo pay'],
  VTLMONEY: ['viettel money', 'viettelmoney', 'viettelpay'],
};

const BY_ID = new Map(BANKS.map((bank) => [bank.id, bank] as const));

/** Every name a bank answers to, folded, longest first so "mb bank" wins over "mb". */
const NAMES: readonly (readonly [name: string, bank: BankInfo])[] = [
  ...Object.entries(APP_NAMES).flatMap(([id, names]) => {
    const bank = BY_ID.get(id);
    return bank ? names.map((name) => [name, bank] as const) : [];
  }),
  ...BANKS.flatMap((bank) => {
    const names = [foldWords(bank.shortName).trim(), foldWords(bank.shortName).replace(/ /g, '')];
    if (bank.id.length >= 3) names.push(bank.id.toLowerCase());
    return names.map((name) => [name, bank] as const);
  }),
].sort(([a], [b]) => b.length - a.length);

/** The world's banks and wallets with an Android app the listener reads, by its package. */
const WORLD_BY_PACKAGE = new Map(
  Object.entries(WORLD_ALERT_APPS).flatMap(([id, pkg]) => {
    const bank = findBank(id);
    return bank ? [[pkg.toLowerCase(), bank] as const] : [];
  }),
);

/** The world's banks and wallets by their everyday name, folded ("chase", "revolut"). */
const WORLD_BY_NAME = new Map(
  WORLD_BANKS.map((bank) => [foldWords(bank.shortName).trim(), bank] as const),
);

/**
 * The bank or wallet an app is, from the name a notification gives it ("MB Bank", "VCB Digibank",
 * "MoMo") or its bundle id ("com.mbmobile"): the whole name, or the name a bank's app starts with.
 * Vietnam's banks are looked for first, so a short code they share with a bank elsewhere ("NAB",
 * "DBS", "UOB") stays theirs; a bank of another country is known only by its exact Android package
 * or its whole everyday name ("Chase", "Revolut"). Null for an app 6pm does not know.
 */
export function bankOfApp(app: string | null | undefined): BankInfo | null {
  const raw = (app ?? '').trim();
  if (raw === '') return null;
  const lower = raw.toLowerCase();
  const byPackage = BANKS.find(
    (bank) => bank.android !== null && bank.android.package.toLowerCase() === lower,
  );
  if (byPackage) return byPackage;
  const folded = foldWords(raw);
  for (const [name, bank] of NAMES) {
    if (folded === ` ${name} ` || folded.startsWith(` ${name} `)) return bank;
  }
  return WORLD_BY_PACKAGE.get(lower) ?? WORLD_BY_NAME.get(folded.trim()) ?? null;
}

/** Every Android package whose notifications are read as bank and wallet alerts: Vietnam's first. */
export function alertPackages(): readonly string[] {
  const vietnam = BANKS.flatMap((bank) => (bank.android ? [bank.android.package] : []));
  return [...new Set([...vietnam, ...Object.values(WORLD_ALERT_APPS)])];
}

/** The first bank or wallet named anywhere in some text, word for word ("TK VCB 0011…"). */
export function bankNamedIn(text: string): BankInfo | null {
  const folded = foldWords(text);
  let found: { readonly at: number; readonly bank: BankInfo } | null = null;
  for (const [name, bank] of NAMES) {
    const at = folded.indexOf(` ${name} `);
    if (at >= 0 && (found === null || at < found.at)) found = { at, bank };
  }
  return found?.bank ?? null;
}

/** Some text folded (`foldWords`) with every bank and wallet name taken out, word for word. */
export function withoutBankNames(text: string): string {
  let folded = foldWords(text);
  for (const [name] of NAMES) {
    while (folded.includes(` ${name} `)) folded = folded.replace(` ${name} `, ' ');
  }
  return folded;
}
