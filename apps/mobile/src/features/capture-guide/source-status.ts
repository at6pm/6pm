import type { SpendRow, SpendSource } from '@6pm/domain';

/** The ways spending reaches 6pm by itself, in the order Settings lists them. */
export const CAPTURE_SOURCES = [
  'share',
  'email',
  'scan',
  'wallet',
  'alerts',
  'widgets',
  'siri',
  'backTap',
] as const;
export type CaptureSource = (typeof CAPTURE_SOURCES)[number];

/** The spend source each way leaves on what it catches; widgets open Scan and Quick add. */
const SPEND_SOURCE: Readonly<Record<CaptureSource, SpendSource | null>> = {
  share: 'shared',
  email: 'email',
  scan: 'qr',
  wallet: 'applePay',
  alerts: 'alert',
  widgets: null,
  siri: null,
  backTap: null,
};

/** The ways the phone cannot see set up, which count as on once they have caught something. */
const SEEN_ONCE: ReadonlySet<CaptureSource> = new Set(['wallet', 'email', 'alerts']);

export interface SourceStatus {
  readonly source: CaptureSource;
  readonly on: boolean;
  /** The newest spend this way caught, if any is in reach. */
  readonly last: SpendRow | null;
}

/**
 * Whether each way is on, from what the phone can know:
 *
 * - Share, Scan, the widgets, Siri and Back Tap ship with the app, so they are on.
 * - The Wallet and bank alert automations live in the Shortcuts app and iOS has no API to read
 *   automations, so each counts as on once something it caught has arrived.
 * - Receipt email works once the user forwards mail to the address, which the phone cannot see,
 *   so it counts as on once an emailed receipt has arrived.
 *
 * Scan reads VietQR, which only Vietnamese banks print: it is listed only for a đồng home.
 */
export function sourceStatuses(
  spends: readonly SpendRow[],
  homeCode = 'VND',
): readonly SourceStatus[] {
  const newest = new Map<SpendSource, SpendRow>();
  for (const spend of spends) {
    if (spend.status === 'deleted') continue;
    const seen = newest.get(spend.source);
    if (!seen || spend.at > seen.at) newest.set(spend.source, spend);
  }
  const listed = CAPTURE_SOURCES.filter((source) => source !== 'scan' || homeCode === 'VND');
  return listed.map((source) => {
    const spendSource = SPEND_SOURCE[source];
    const last = spendSource ? (newest.get(spendSource) ?? null) : null;
    const on = SEEN_ONCE.has(source) ? last !== null : true;
    return { source, on, last };
  });
}

/** "6 of 8 on". */
export function onCount(statuses: readonly SourceStatus[]): number {
  return statuses.filter((s) => s.on).length;
}

/** The guide a link or a Settings row asked for; Share to 6pm when it names none. */
export function captureSourceOf(param: string | readonly string[] | undefined): CaptureSource {
  const value = typeof param === 'string' || param === undefined ? param : param[0];
  return CAPTURE_SOURCES.find((s) => s === value) ?? 'share';
}
