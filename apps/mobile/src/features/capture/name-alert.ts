import { z } from 'zod';

import type { InboxSpend } from '@6pm/domain';

import { alertNameKey, type AlertName } from '../../data/alert-names';
import type { ApiClient } from '../api/api-client';
import { requireServerAi, type AiModeSettings } from '../privacy/ai-mode';

/** One attempt, kept short: the import waits for it, and a slow answer leaves the row as read. */
export const NAME_ALERT_TIMEOUT_MS = 7_000;

const digit = /\p{Nd}/u;
const digits = /\p{Nd}/gu;
const MAX_LINES = 60;
const MAX_LINE = 120;
const MAX_NAME = 80;
const MAX_CATEGORIES = 50;
const MAX_CATEGORY = 40;

const namedSchema = z.object({ merchant: z.string(), category: z.string() });

export interface NameAlertDeps {
  readonly request: ApiClient['request'];
  /** Where 6pm's AI runs: in on-device mode nothing is asked, and the row stays as the phone read it. */
  readonly settings: AiModeSettings;
  /** The category the user's rule files this merchant under, or null when no rule knows it. */
  readonly ruleCategory: (merchant: string) => Promise<string | null>;
  /** The user's categories now. */
  readonly categories: () => readonly { readonly id: string; readonly name: string }[];
  /** The names already given to alert wordings, kept on the phone. */
  readonly remembered: {
    get(key: string): Promise<AlertName | null>;
    put(key: string, name: AlertName): Promise<void>;
  };
}

/**
 * Names who a bank or wallet alert paid when the phone read the payment and no payee from it
 * (`receipt.payeeSure` false): the server reads the alert's words, every number taken out on the
 * phone before the item was written, and says who was paid, choosing among the user's categories.
 * No digit is ever sent. A wording named once is remembered on the phone and never asked about
 * again. Offline, slow or refused, and always in on-device mode, the row is saved as the phone
 * read it. The person's own rule for the name files it; else the server's category; else where
 * the phone filed it.
 */
export function createNameAlert(deps: NameAlertDeps) {
  return async (item: InboxSpend): Promise<InboxSpend> => {
    const receipt = item.receipt;
    if (item.source !== 'alert' || item.direction === 'in') return item;
    if (receipt?.payeeSure !== false) return item;

    const lines = receipt.namingLines
      .map((line) => line.trim().slice(0, MAX_LINE))
      .filter((line) => line !== '' && !digit.test(line))
      .slice(0, MAX_LINES);
    if (lines.length === 0) return item;
    const categories = deps
      .categories()
      .filter((c) => c.name.trim() !== '' && c.name.length <= MAX_CATEGORY && !digit.test(c.name))
      .slice(0, MAX_CATEGORIES);

    const key = alertNameKey(receipt.bank, lines);
    let named = await deps.remembered.get(key).catch(() => null);
    if (named === null) {
      if (categories.length === 0) return item;
      try {
        requireServerAi(deps.settings, 'name-alert');
        const answer = await deps.request({
          method: 'POST',
          path: '/v1/name-alert',
          body: {
            name: item.merchant.replace(digits, '').trim().slice(0, MAX_NAME),
            lines,
            categories: categories.map((c) => c.name),
          },
          schema: namedSchema,
          timeoutMs: NAME_ALERT_TIMEOUT_MS,
        });
        named = { merchant: answer.merchant.trim(), category: answer.category };
        await deps.remembered.put(key, named).catch(() => undefined);
      } catch {
        return item;
      }
    }

    if (named.merchant === '') return item;
    const ruled = await deps.ruleCategory(named.merchant).catch(() => null);
    const chosen = categories.find((c) => c.name === named.category);
    return {
      ...item,
      merchant: named.merchant,
      categoryId: ruled ?? chosen?.id ?? item.categoryId,
    };
  };
}
