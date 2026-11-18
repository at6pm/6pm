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
} from '@6pm/domain';

import type { AlertSecondRead } from '../../data/inbox-import';
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
const STOPS_ASKING: ReadonlySet<ApiFailure> = new Set([
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

  const ask = (asked: AlertReadAsk, home: Currency): Promise<AlertReading & { category: string }> =>
    deps.request({
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
      timeoutMs: READ_ALERT_TIMEOUT_MS,
    });

  return async (
    items: readonly (InboxSpend | InboxUnread)[],
  ): Promise<Map<string, AlertSecondRead>> => {
    const answers = new Map<string, AlertSecondRead>();
    const home = deps.home();
    if (readAiMode(deps.settings) === 'device') {
      for (const item of items) if (item.kind === 'unread') answers.set(item.id, { kind: 'none' });
      return answers;
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
        return;
      }
      if (down || now() >= until) return;
      let read: AlertReading & { category: string };
      try {
        read = await ask(asked, home);
      } catch (error) {
        // No connection, no time left or no more reads today stops the asking; a failure of this
        // one alert's reading (the model's answer, a refused text) leaves the others their turn.
        down ||= !(error instanceof ApiRequestError) || STOPS_ASKING.has(error.failure);
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
        return;
      }
      const reread = withAlertReading(item, read, asked, words, home);
      if (reread === item) return;
      answers.set(item.id, {
        kind: 'spend',
        item: await filed(reread, read.category, item.categoryId),
      });
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
    // Whatever is still out is left unanswered: a copy, so a late answer changes nothing.
    return new Map(answers);
  };
}
