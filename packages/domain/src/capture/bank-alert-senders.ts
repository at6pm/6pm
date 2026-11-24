import { BANKS, findBank, WORLD_BANKS, type BankInfo } from '../vietqr/bank-catalogue';
import { WORLD_ALERT_APPS } from '../vietqr/world-alert-apps';
import { WORLD_APP_NAMES_ONLY, WORLD_IOS_APPS } from '../vietqr/world-ios-apps';
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

/**
 * The bundle ids of Vietnam's banking and wallet apps on the iPhone, by the catalogue id of the
 * bank behind them, as the published bank alert shortcut lists them: a Shortcuts automation may
 * name the app a notification came from by its bundle id rather than the name under its icon.
 */
const IOS_APPS: Readonly<Record<string, readonly string[]>> = {
  MB: ['com.mbmobile'],
  VCB: ['com.vcb.VCB'],
  TCB: ['vn.com.techcombank.bb.app'],
  ACB: ['mobileapp.acb.com.vn'],
  BIDV: ['com.bidv.smartbanking'],
  ICB: ['com.vietinbank.mobilebanking'],
  VPB: ['com.vnp.VpBankOnline'],
  TPB: ['com.fpt.tpb.emobile'],
  VBA: ['com.vnp.Agribank'],
  STB: ['com.sacombank.ewallet', 'com.sacombank.Sacombank'],
  HDB: ['com.vnpay.HDBank'],
  VIB: ['com.vib.myvib2prod'],
  OCB: ['vn.com.ocb.awe'],
  SHB: ['vn.com.shb.omni.appstore'],
  MSB: ['com.msb.mobileBanking'],
  CAKE: ['vn.com.be.cake'],
  TIMO: ['io.lifestyle.plusdigital'],
  MOMO: ['com.mservice.com.vn.MoMoTransfer'],
  VTLMONEY: ['com.viettel.viettelpay'],
};

/** Vietnam's banking and wallet apps by their iPhone bundle id, lower case. */
const BY_IOS_BUNDLE = new Map(
  Object.entries(IOS_APPS).flatMap(([id, bundles]) => {
    const bank = BY_ID.get(id);
    return bank ? bundles.map((bundle) => [bundle.toLowerCase(), bank] as const) : [];
  }),
);

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
 * An app's name as it is compared with the names iOS shows: compatibility-normalised, lower case,
 * with every run of anything but letters and digits made one space. Letters of every script are
 * kept, so "KB스타뱅킹" and "楽天ペイ" are names as much as "Chase" is.
 */
function appKey(name: string): string {
  return name
    .normalize('NFKC')
    .toLowerCase()
    .replace(/[^\p{L}\p{M}\p{N}]+/gu, ' ')
    .trim();
}

/** The world's banks and wallets by their iPhone bundle id, lower case; the first code wins. */
const WORLD_BY_IOS_BUNDLE = new Map<string, BankInfo>();
/** The world's banks and wallets by the names iOS shows for their apps (`appKey`). */
const WORLD_BY_IOS_NAME = new Map<string, BankInfo>();
for (const [id, app] of WORLD_IOS_APPS) {
  const bank = findBank(id);
  if (!bank) continue;
  const bundle = app.bundle.toLowerCase();
  if (!WORLD_BY_IOS_BUNDLE.has(bundle)) WORLD_BY_IOS_BUNDLE.set(bundle, bank);
  for (const name of app.names) WORLD_BY_IOS_NAME.set(appKey(name), bank);
}
for (const [id, names] of WORLD_APP_NAMES_ONLY) {
  const bank = findBank(id);
  if (bank) for (const name of names) WORLD_BY_IOS_NAME.set(appKey(name), bank);
}

/**
 * The world's names an app's name may start with ("Chase" for "Chase Mobile"), longest first: the
 * everyday names and the names iOS shows, four letters or more so a short one ("Up", "TD") is only
 * ever matched whole.
 */
const WORLD_NAMES: readonly (readonly [name: string, bank: BankInfo])[] = [
  ...[...WORLD_BY_IOS_NAME],
  ...WORLD_BANKS.map((bank) => [appKey(bank.shortName), bank] as const),
]
  .filter(([name]) => name.length >= 4)
  .sort(([a], [b]) => b.length - a.length);

/**
 * The bank or wallet an app is, from the name a notification gives it ("MB Bank", "VCB Digibank",
 * "MoMo", "KB스타뱅킹"), its Android package or its iPhone bundle id ("com.vcb.VCB", "com.chase").
 * Vietnam's banks are looked for first, so a short code they share with a bank elsewhere ("NAB",
 * "DBS", "UOB") stays theirs: a whole name of theirs, then a whole name an iPhone shows for a bank
 * elsewhere ("DBS digibank"), then the name a Vietnamese bank's app starts with, then a bank
 * elsewhere by its exact Android package, its whole everyday name ("Chase", "Revolut") or, last,
 * the name its app starts with ("Chase Mobile"). Null for an app 6pm does not know.
 */
export function bankOfApp(app: string | null | undefined): BankInfo | null {
  const raw = (app ?? '').trim();
  if (raw === '') return null;
  const lower = raw.toLowerCase();
  const byPackage = BANKS.find(
    (bank) => bank.android !== null && bank.android.package.toLowerCase() === lower,
  );
  if (byPackage) return byPackage;
  const byBundle = BY_IOS_BUNDLE.get(lower) ?? WORLD_BY_IOS_BUNDLE.get(lower);
  if (byBundle) return byBundle;
  const folded = foldWords(raw);
  for (const [name, bank] of NAMES) if (folded === ` ${name} `) return bank;
  const key = appKey(raw);
  const byIosName = WORLD_BY_IOS_NAME.get(key);
  if (byIosName) return byIosName;
  for (const [name, bank] of NAMES) if (folded.startsWith(` ${name} `)) return bank;
  const world = WORLD_BY_PACKAGE.get(lower) ?? WORLD_BY_NAME.get(folded.trim());
  if (world) return world;
  for (const [name, bank] of WORLD_NAMES) if (key.startsWith(`${name} `)) return bank;
  return null;
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
