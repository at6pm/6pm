import {
  receiptBankOf,
  SELF_RUNNING_SOURCES,
  wayHeartbeats,
  wayQuiet,
  type LocalDate,
  type SpendSource,
  type WayHeartbeats,
  type WayQuiet,
} from '@6pm/domain';

import type { CatchSeen } from '../../data/first-catch';
import type { CaptureSource } from './source-status';

/** The ways Settings gives a heartbeat, in the design's order. */
export const HEALTH_WAYS = ['scan', 'share', 'alerts', 'email', 'voice', 'wallet'] as const;
export type HealthWay = (typeof HEALTH_WAYS)[number];

const SOURCE: Readonly<Record<HealthWay, SpendSource>> = {
  scan: 'qr',
  share: 'shared',
  alerts: 'alert',
  email: 'email',
  voice: 'voice',
  wallet: 'applePay',
};

/** The guide each row opens; voice is set up as Siri's "Log in 6pm". */
export const HEALTH_GUIDE: Readonly<Record<HealthWay, CaptureSource>> = {
  scan: 'scan',
  share: 'share',
  alerts: 'alerts',
  email: 'email',
  voice: 'siri',
  wallet: 'wallet',
};

/** Where a way stands, for the words at the right of its row. */
export type HealthState =
  | { readonly kind: 'caught'; readonly at: string }
  | { readonly kind: 'quiet'; readonly quiet: WayQuiet }
  | { readonly kind: 'off' }
  | { readonly kind: 'notSetUp' }
  | { readonly kind: 'ready' };

export interface HealthRow {
  readonly way: HealthWay;
  /** Catches a day for the last 14 days, today last. */
  readonly beats: readonly number[];
  readonly state: HealthState;
  /** The bank the latest alert came from ("MB Bank"), for "Bank alerts · MB Bank". */
  readonly bank: string | null;
}

export interface HealthInput {
  readonly catches: readonly CatchSeen[];
  /** The money day: a catch after midnight lands on the day before, as everywhere else. */
  readonly today: LocalDate;
  /** The ways this phone has. */
  readonly ways: readonly HealthWay[];
  /** The last alert the shortcut or listener read, caught or skipped (its day and bank). */
  readonly lastAlert: {
    readonly day: LocalDate;
    readonly at: string;
    readonly bank: string | null;
  } | null;
  /** Ways switched off where the phone can see it: receipt email in on-device mode, Android's access. */
  readonly off: readonly HealthWay[];
}

/**
 * Each way's heartbeat and where it stands: its last catch; quiet when it runs by itself (bank
 * alerts, Wallet, email) and went quiet after a busy fortnight (an alert the shortcut read and
 * skipped says it still runs); not set up when such a way never caught anything; off when the
 * phone can see it is; ready for the ways that ship with the app.
 */
export function healthRows(
  input: HealthInput,
  strips: WayHeartbeats = stripsOf(input),
): readonly HealthRow[] {
  return input.ways.map((way): HealthRow => {
    const source = SOURCE[way];
    const own = input.catches.filter((c) => c.source === source);
    const days = own.map((c) => c.day);
    const last = own.reduce<CatchSeen | null>((a, c) => (a === null || c.at > a.at ? c : a), null);
    const alert = way === 'alerts' ? input.lastAlert : null;
    const bank =
      alert?.bank ??
      (way === 'alerts' && last ? (receiptBankOf(last.detail) ?? last.detail) : null);
    const selfRunning = SELF_RUNNING_SOURCES.includes(source);
    const quiet = selfRunning ? wayQuiet(days, input.today, alert?.day ?? null) : null;
    const seenAt =
      [last?.at, alert?.at]
        .filter((at): at is string => !!at)
        .sort()
        .pop() ?? null;
    const state: HealthState = input.off.includes(way)
      ? { kind: 'off' }
      : quiet
        ? { kind: 'quiet', quiet }
        : seenAt
          ? { kind: 'caught', at: seenAt }
          : selfRunning
            ? { kind: 'notSetUp' }
            : { kind: 'ready' };
    return { way, beats: strips.beats.get(source) ?? [], state, bank };
  });
}

function stripsOf(input: HealthInput): WayHeartbeats {
  return wayHeartbeats(
    input.catches,
    input.ways.map((way) => SOURCE[way]),
    input.today,
  );
}

/** Settings' section: its rows in the order it shows them, and what the strips hold together. */
export interface HealthSection {
  /** The ways that run, then (`setUp` false) the ways to set up, under a hairline. */
  readonly rows: readonly HealthRow[];
  /** Catches on every strip: "55 caught · 14 days". */
  readonly total: number;
  /** The first day on the strips. */
  readonly from: LocalDate;
}

/** Whether a row shows a strip, or a "Set up" button in its place. */
export function rowRuns(row: HealthRow): boolean {
  return row.state.kind !== 'notSetUp' && row.state.kind !== 'off';
}

/**
 * The section as Settings draws it: the ways that run ordered by their last catch, newest first,
 * a quiet way keeping its own place so its warning does not jump about, the ways never caught
 * from after them, and the ways not set up (or switched off) last.
 */
export function healthSection(input: HealthInput): HealthSection {
  const strips = stripsOf(input);
  const rows = healthRows(input, strips);
  const running = rows.filter(rowRuns);
  const lastOf = (row: HealthRow) => (row.state.kind === 'caught' ? row.state.at : '');
  const movers = running
    .filter((row) => row.state.kind !== 'quiet')
    .sort((a, b) => (lastOf(a) < lastOf(b) ? 1 : lastOf(a) > lastOf(b) ? -1 : 0));
  let next = 0;
  const ordered = running.map((row) =>
    row.state.kind === 'quiet' ? row : (movers[next++] ?? row),
  );
  return {
    rows: [...ordered, ...rows.filter((row) => !rowRuns(row))],
    total: strips.total,
    from: strips.from,
  };
}
