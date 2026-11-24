import { z } from 'zod';

import {
  diffDays,
  FUNNEL_BATCH_MAX,
  FUNNEL_LAST_DAY,
  funnelEventSchema,
  funnelKey,
  funnelStepsFrom,
  localDateOf,
  type FunnelEvent,
} from '@6pm/domain';

import { catchesSince } from '../../data/first-catch';
import { createQueue } from '../../data/store-queue';
import type { SqlDatabase } from '../../data/table';

/**
 * Anonymous funnel counts, kept in the settings table (never in a backup, gone with Delete
 * everything): when this copy of the app first opened, the days it opened since, the steps waiting
 * to be sent and the keys of those already sent. What is sent is only the steps themselves (see
 * `funnelReportSchema`): no token, no install id, nothing from the money.
 *
 * Off when the person turns "Anonymous counts" off in Privacy, and in on-device mode, where
 * nothing about the phone is sent. Steps reached while off are settled on the phone and never sent,
 * even if counts are turned back on later.
 */
const STATE_KEY = 'funnel';
const OFF_KEY = 'funnel.off';
const AI_MODE_KEY = 'ai.mode';

const stateSchema = z.object({
  /** The instant this copy first opened; null for a copy set up before counts began. */
  since: z.string().nullable(),
  /** Days, counted from the first open, the app was opened on (first 30 days). */
  opens: z.array(z.number().int()),
  /** Steps noted by the screens (onboarding, Max) that have not gone yet. */
  queued: z.array(funnelEventSchema),
  /** Keys of steps sent or settled: each is sent at most once. */
  sent: z.array(z.string()),
});
type FunnelState = z.infer<typeof stateSchema>;

/** How a report fared: counted, refused for good (never retried), or to try again later. */
export type FunnelSendResult = 'counted' | 'refused' | 'later';

export interface FunnelDeps {
  readonly db: SqlDatabase;
  readonly send: (events: readonly FunnelEvent[]) => Promise<FunnelSendResult>;
  readonly now?: () => Date;
}

export interface Funnel {
  /** A step a screen reached; sent with the next report. Nothing is kept while counts are off. */
  note(event: FunnelEvent): Promise<void>;
  /** Works out what the phone's records reached and sends what has not gone yet. */
  report(): Promise<void>;
  /** Whether counts are on: the person's switch, and AI not kept on the phone. */
  isOn(): Promise<boolean>;
}

async function readValue(db: SqlDatabase, key: string): Promise<string | null> {
  const rows = await db.getAllAsync<{ value: string }>('SELECT value FROM settings WHERE key = ?', [
    key,
  ]);
  return rows[0]?.value ?? null;
}

async function writeValue(db: SqlDatabase, key: string, value: string): Promise<void> {
  await db.runAsync('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)', [key, value]);
}

async function readState(db: SqlDatabase): Promise<FunnelState | null> {
  const raw = await readValue(db, STATE_KEY);
  if (raw === null) return null;
  try {
    const parsed = stateSchema.safeParse(JSON.parse(raw));
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
}

const writeState = (db: SqlDatabase, state: FunnelState) =>
  writeValue(db, STATE_KEY, JSON.stringify(state));

/** The first time this phone's counts are read: a new copy, or one set up before they began. */
async function firstState(db: SqlDatabase, now: Date): Promise<FunnelState> {
  const planned = (await readValue(db, 'plan')) !== null;
  return planned
    ? { since: null, opens: [], queued: [], sent: [] }
    : {
        since: now.toISOString(),
        opens: [0],
        queued: [{ step: 'first_open' }],
        sent: [],
      };
}

/** Privacy's "Anonymous counts" switch: on unless the person turned it off. */
export async function readFunnelSwitch(db: SqlDatabase): Promise<boolean> {
  return (await readValue(db, OFF_KEY)) !== '1';
}

export function writeFunnelSwitch(db: SqlDatabase, on: boolean): Promise<void> {
  return writeValue(db, OFF_KEY, on ? '0' : '1');
}

export function createFunnel({ db, send, now = () => new Date() }: FunnelDeps): Funnel {
  const exclusive = createQueue();

  const isOn = async () =>
    (await readFunnelSwitch(db)) && (await readValue(db, AI_MODE_KEY)) !== 'device';

  const load = async (): Promise<FunnelState> => {
    const known = await readState(db);
    if (known) return known;
    const fresh = await firstState(db, now());
    await writeState(db, fresh);
    return fresh;
  };

  /** Every step the records show, for a copy that knows when it first opened. */
  const derived = async (state: FunnelState, today: string): Promise<FunnelEvent[]> => {
    if (state.since === null) return [];
    const since = localDateOf(new Date(state.since));
    const [catches, closes] = await Promise.all([
      catchesSince(db, state.since),
      db.getAllAsync<{ closed_at: string }>(
        'SELECT closed_at FROM closed_days WHERE closed_at >= ?',
        [state.since],
      ),
    ]);
    return funnelStepsFrom({
      since,
      today,
      opens: state.opens,
      catches,
      closes: closes.map((row) => localDateOf(new Date(row.closed_at))),
    });
  };

  return {
    isOn,

    note: (event) =>
      exclusive(async () => {
        if (!(await isOn())) return;
        const state = await load();
        const key = funnelKey(event);
        if (state.sent.includes(key) || state.queued.some((e) => funnelKey(e) === key)) return;
        await writeState(db, { ...state, queued: [...state.queued, event] });
      }),

    report: () =>
      exclusive(async () => {
        const at = now();
        const today = localDateOf(at);
        let state = await load();
        if (state.since !== null) {
          const n = diffDays(today, localDateOf(new Date(state.since)));
          if (n >= 0 && n <= FUNNEL_LAST_DAY && !state.opens.includes(n)) {
            state = { ...state, opens: [...state.opens, n] };
          }
        }
        const sent = new Set(state.sent);
        const waiting = new Map<string, FunnelEvent>();
        for (const event of [...state.queued, ...(await derived(state, today))]) {
          const key = funnelKey(event);
          if (!sent.has(key)) waiting.set(key, event);
        }

        const settle = async (keys: readonly string[]) => {
          for (const key of keys) sent.add(key);
          state = {
            ...state,
            sent: [...sent],
            queued: state.queued.filter((e) => !sent.has(funnelKey(e))),
          };
          await writeState(db, state);
        };

        // Off: what was reached is settled here and never leaves, now or later.
        if (!(await isOn())) return settle([...waiting.keys()]);

        await writeState(db, state);
        const entries = [...waiting];
        for (let i = 0; i < entries.length; i += FUNNEL_BATCH_MAX) {
          const batch = entries.slice(i, i + FUNNEL_BATCH_MAX);
          const result = await send(batch.map(([, event]) => event)).catch(
            (): FunnelSendResult => 'later',
          );
          if (result === 'later') return;
          await settle(batch.map(([key]) => key));
        }
      }),
  };
}
