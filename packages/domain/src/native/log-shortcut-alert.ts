import { alertSenderOf } from '../capture/alert-sender';
import type { BankAlertInput } from '../capture/bank-alert';
import type { ShortcutAlertResult } from '../contracts/shortcut-alert';
import type { SurfaceContext } from '../contracts/surfaces';
import { TEST_ALERT_FRESH_MS, type PendingTestAlert } from '../contracts/test-alert';
import { buildBankAlert } from './log-bank-alert';
import { buildTestAlert } from './log-test-alert';

/** Nothing read, nothing kept, nothing noted: as if the notification had never been passed on. */
const NOTHING: ShortcutAlertResult = { item: null, last: null };

/**
 * One notification the iPhone's Shortcuts automation passed on, sorted by who sent it before any
 * of it is read:
 *
 * - a bank or wallet 6pm knows by its app is read as a bank alert, as before;
 * - 6pm's own is taken only when it is the test alert the app is waiting for (`ownTestToken`),
 *   and then leaves an inbox item of the kind `test`, which is never money. Every other
 *   notification of 6pm's (the close reminder, "Caught your first one…") leaves nothing;
 * - an automation that names no app is read as before, there being no sender to check, except
 *   what 6pm said itself: its test alert (as a test when it carries the awaited token, else
 *   nothing) and its first-catch notice;
 * - any other app's leaves nothing, whatever its words say: a chat message that names a bank and
 *   an amount is not read, not kept for a second reading, and not noted as the last alert.
 */
export function buildShortcutAlert(
  input: BankAlertInput,
  own: readonly string[],
  pending: PendingTestAlert | null,
  context: SurfaceContext | null,
  now: Date,
  id: string,
): ShortcutAlertResult {
  const sender = alertSenderOf(input.app, own);
  if (sender === 'other') return NOTHING;
  if (sender === 'own' || sender === 'unnamed') {
    // With no app named, 6pm's own test is still known by its token, never read as money.
    const token = ownTestToken(input, pending, now);
    if (token !== null) return { ...NOTHING, test: buildTestAlert(token, now, id).item };
    if (sender === 'own' || saidBy6pm(input, context)) return NOTHING;
  }
  return buildBankAlert(input, context, now, id);
}

/**
 * Whether an alert passed with no app is one 6pm said itself: a test alert (every language's
 * title starts with "6pm ·"), stale or never awaited, or the first catch it told ("Caught your
 * first one: 50.000₫ · MB Bank…"), from the words the app left in the context.
 */
function saidBy6pm(input: BankAlertInput, context: SurfaceContext | null): boolean {
  if (OWN_TITLE.test(input.title ?? '')) return true;
  const body = (input.body ?? '').trim();
  const strings = context?.strings ?? {};
  return [strings['firstCatch'], strings['firstCatchNoName']].some(
    (template) => template !== undefined && fitsTemplate(body, template),
  );
}

const OWN_TITLE = /^\s*6pm\s*·/iu;

/** Whether some text is a template's words with anything in place of `{amount}` and `{name}`. */
function fitsTemplate(text: string, template: string): boolean {
  const parts = template.trim().split(/\{amount\}|\{name\}/u);
  if (parts.join('').trim() === '') return false;
  const escaped = parts.map((part) => part.replace(/[.*+?^${}()|[\]\\]/gu, '\\$&'));
  return new RegExp(`^${escaped.join('.*')}$`, 'su').test(text);
}

/**
 * The token of the test alert a notification from 6pm is, or null when it is not one. It is one
 * only when the app wrote that it is waiting (`pending`) no longer than `TEST_ALERT_FRESH_MS` ago
 * and the notification prints that very token, standing on its own. What the notification says
 * otherwise decides nothing: worded exactly like a test alert, it is still not one without the
 * token the app is waiting for.
 */
export function ownTestToken(
  input: BankAlertInput,
  pending: PendingTestAlert | null,
  now: Date,
): string | null {
  if (pending === null) return null;
  const sent = new Date(pending.at).getTime();
  const age = now.getTime() - sent;
  if (Number.isNaN(sent) || age < 0 || age > TEST_ALERT_FRESH_MS) return null;
  const words = [input.title, input.subtitle, input.body].map((part) => part ?? '').join('\n');
  let from = words.indexOf(pending.token);
  while (from >= 0) {
    const before = words[from - 1] ?? ' ';
    const after = words[from + pending.token.length] ?? ' ';
    if (!PART_OF_A_WORD.test(before) && !PART_OF_A_WORD.test(after)) return pending.token;
    from = words.indexOf(pending.token, from + 1);
  }
  return null;
}

const PART_OF_A_WORD = /[\p{L}\p{N}-]/u;
