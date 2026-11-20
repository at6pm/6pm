import { z } from 'zod';

import {
  alertReadAsk,
  spendOfUnreadAlert,
  withAlertReading,
  type AlertReadAsk,
  type AlertReading,
  type Currency,
  type InboxSpend,
  type InboxUnread,
  type SecondReadOutcome,
} from '@6pm/domain';

import type { AlertSecondRead, AlertSecondReads } from '../../data/inbox-import';
import type { ApiClient } from '../api/api-client';
import { ApiRequestError, type ApiFailure } from '../api/api-error';
import { readAiMode, type AiModeSettings } from '../privacy/ai-mode';

/** One attempt, kept short: the import waits for it, and a slow answer leaves the row as read. */
export const READ_ALERT_TIMEOUT_MS = 7_000;
/** The import waits this long for all its alerts together; one not answered by then stays as read. */
export const READ_ALERTS_WAIT_MS = 8_000;
/** How many alerts are asked about at once. */
const AT_ONCE = 6;
const MAX_CATEGORIES = 50;
const MAX_CATEGORY = 40;

/** Failures that would meet every alert of this import the same way. */
export const STOPS_ASKING: ReadonlySet<ApiFailure> = new Set([
  'network',
  'timeout',
  'unauthorized',
  'rate_limited',
  'forbidden',
]);

const readSchema = z.object({
  moved: z.enum(['out', 'in', 'none']),
  amount: z.number().int().min(0),
  merchant: z.string(),
  category: z.string(),
});

/** What the server says of one alert: its reading, and the category's name ("" for none). */
export type AlertReadAnswer = AlertReading & { readonly category: string };

/**
 * Asks the server to read one alert, as `alertReadAsk` prepared it: the first reading an import
 * waits for, and the late one for an alert that reading got no answer for.
 */
export function askAlertRead(
  deps: Pick<ReadAlertsDeps, 'request' | 'categories'>,
  asked: AlertReadAsk,
  home: Currency,
  timeoutMs: number,
): Promise<AlertReadAnswer> {
  return deps.request({
    method: 'POST',
    path: '/v1/read-alert',
    body: {
      app: asked.app,
      text: asked.text,
      amounts: asked.amounts.length,
      home: home.code,
      categories: deps
        .categories()
        .map((c) => c.name.trim())
        .filter((name) => name !== '' && name.length <= MAX_CATEGORY)
        .slice(0, MAX_CATEGORIES),
    },
    schema: readSchema,
    timeoutMs,
  });
}

/** Whether the second reading left a caught alert as the phone had read it. */
const readsTheSame = (phone: InboxSpend, second: InboxSpend) =>
  phone.direction === second.direction &&
  phone.amount === second.amount &&
  phone.foreign?.amount === second.foreign?.amount &&
  phone.foreign?.currency === second.foreign?.currency &&
  phone.merchant === second.merchant &&
  phone.categoryId === second.categoryId;

export interface ReadAlertsDeps {
  readonly request: ApiClient['request'];
  /** Where 6pm's AI runs: in on-device mode nothing is asked, and every row stays as the phone read it. */
  readonly settings: AiModeSettings;
  /** The category the user's rule files this merchant under, or null when no rule knows it. */
  readonly ruleCategory: (merchant: string) => Promise<string | null>;
  /** The user's categories now. */
  readonly categories: () => readonly { readonly id: string; readonly name: string }[];
  /** The currency the person counts in now. */
  readonly home: () => Currency;
  readonly now?: () => number;
}

/**
 * Has the server read the bank and wallet alerts an import brings in, a second time after the
 * phone: whether money moved and which way, which printed amount it was, who was paid, and the
 * category. What the server reads wins over what the phone read. The phone dots out long numbers
 * and marks each printed amount before anything is sent, and the server answers with a mark,
 * never an amount (`alertReadAsk`).
 *
 * In on-device mode nothing is sent: a caught row stays as the phone read it, and an alert the
 * phone could not read is let go. Offline, slow or refused, a caught row stays as read and an
 * unread alert is left without an answer, for the import to keep and ask about again. A failure
 * every alert would meet (no connection, the day's reads used up) stops the asking for this
 * import, so a dead connection is waited on once.
 *
 * The person's own rule for the name files a payment; else the server's category; else where the
 * phone filed it.
 *
 * Beside the answers it says what became of each alert it was given (`outcomes`): answered and
 * how, not asked and why, or failed and how. The capture log keeps that; nothing is decided by it.
 */
export function createReadAlerts(deps: ReadAlertsDeps) {
  const now = deps.now ?? Date.now;

  const filed = async (item: InboxSpend, category: string, was: string | null) => {
    if (item.direction === 'in') return item;
    const categories = deps.categories();
    const ruled = await deps.ruleCategory(item.merchant).catch(() => null);
    const chosen = category === '' ? undefined : categories.find((c) => c.name === category);
    return { ...item, categoryId: ruled ?? chosen?.id ?? was };
  };

  const ask = (asked: AlertReadAsk, home: Currency) =>
    askAlertRead(deps, asked, home, READ_ALERT_TIMEOUT_MS);

  return async (items: readonly (InboxSpend | InboxUnread)[]): Promise<AlertSecondReads> => {
    const answers = new Map<string, AlertSecondRead>();
    const outcomes = new Map<string, SecondReadOutcome>();
    const home = deps.home();
    if (readAiMode(deps.settings) === 'device') {
      for (const item of items) {
        if (item.kind === 'unread') answers.set(item.id, { kind: 'none' });
        if (item.alertWords) outcomes.set(item.id, 'device');
      }
      return { answers, outcomes };
    }
    const until = now() + READ_ALERTS_WAIT_MS;
    let down = false;

    const one = async (item: InboxSpend | InboxUnread) => {
      const words = item.alertWords;
      if (!words) return;
      const asked = alertReadAsk(words, home);
      if (asked === null) {
        // It prints no amount to point at: nothing could be saved from it.
        if (item.kind === 'unread') answers.set(item.id, { kind: 'none' });
        outcomes.set(item.id, 'no-amount');
        return;
      }
      if (down || now() >= until) {
        outcomes.set(item.id, down ? 'stopped' : 'late');
        return;
      }
      let read: AlertReadAnswer;
      try {
        read = await ask(asked, home);
      } catch (error) {
        // No connection, no time left or no more reads today stops the asking; a failure of this
        // one alert's reading (the model's answer, a refused text) leaves the others their turn.
        down ||= !(error instanceof ApiRequestError) || STOPS_ASKING.has(error.failure);
        outcomes.set(
          item.id,
          `failed:${error instanceof ApiRequestError ? error.failure : 'error'}`,
        );
        return;
      }
      if (item.kind === 'unread') {
        const spend = spendOfUnreadAlert(item, read, asked, home);
        answers.set(
          item.id,
          spend === null
            ? { kind: 'none' }
            : { kind: 'spend', item: await filed(spend, read.category, null) },
        );
        outcomes.set(item.id, spend === null ? 'none' : 'changed');
        return;
      }
      const reread = withAlertReading(item, read, asked, words, home);
      if (reread === item) {
        // It read no money that moved: the row the phone caught stays the person's to remove.
        outcomes.set(item.id, 'none');
        return;
      }
      const saved = await filed(reread, read.category, item.categoryId);
      answers.set(item.id, { kind: 'spend', item: saved });
      outcomes.set(item.id, readsTheSame(item, saved) ? 'same' : 'changed');
    };

    const waiting = [...items];
    const worker = async () => {
      for (let next = waiting.shift(); next !== undefined; next = waiting.shift()) {
        await one(next).catch(() => undefined);
      }
    };
    const all = Promise.all(Array.from({ length: Math.min(AT_ONCE, waiting.length) }, worker));
    let timer: ReturnType<typeof setTimeout> | undefined;
    await Promise.race([
      all,
      new Promise<void>((resolve) => {
        timer = setTimeout(resolve, READ_ALERTS_WAIT_MS);
      }),
    ]);
    clearTimeout(timer);
    // Whatever is still out is left unanswered: copies, so a late answer changes nothing.
    const said = new Map(outcomes);
    for (const item of items) if (item.alertWords && !said.has(item.id)) said.set(item.id, 'late');
    return { answers: new Map(answers), outcomes: said };
  };
}
