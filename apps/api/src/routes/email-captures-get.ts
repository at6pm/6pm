import {
  EMAIL_CAPTURES_PAGE,
  EMAIL_MONEY_IN_PARAM,
  EMAIL_PLAN_PARAM,
  EMAIL_WHAT_KINDS,
  EMAIL_WHAT_PARAM,
  type EmailCapture,
} from '@6pm/domain';

import { ApiError } from '../errors';
import { rememberPlan } from '../receipt-email/read-spend';
import { openCapture, sealKeyOf } from '../receipt-email/seal';
import type { RouteDefinition } from '../route';

/**
 * The receipts waiting for this phone, oldest first, at most a page of them. Nothing is deleted
 * here: the phone saves them, then acknowledges. A row that no longer opens (the seal key was
 * replaced) can never be read, so it is deleted instead of being sent. The phone says whether it
 * has Max (`?plan=max|free`), which sets how much of its mail the model reads in a day, and
 * whether it places money that came in (`?in=1`): one that does not would count incoming money and
 * refunds as spending, so those are deleted instead of sent, as before they were read at all.
 * A phone that knows what a message is (`?what=1`) is handed failed charges, reversals and own
 * transfers too; any other is handed what it always was (`asBefore`).
 */
const WHAT_KINDS: ReadonlySet<string> = new Set(EMAIL_WHAT_KINDS);

/**
 * A capture as a phone that does not say `what=1` has always been handed it: a failed charge or an
 * own transfer was never kept, so none is handed; a reversal was money that came in.
 */
function asBefore(capture: EmailCapture): EmailCapture | null {
  if (capture.kind !== undefined && WHAT_KINDS.has(capture.kind)) return null;
  return capture.kind === 'reversal' ? { ...capture, kind: 'incoming' } : capture;
}

export const emailCapturesGetRoute: RouteDefinition = {
  method: 'GET',
  path: '/v1/email/captures',
  access: 'device',
  handle: async (c) => {
    const secret = sealKeyOf(c.env);
    if (secret === null) throw new ApiError('internal', 'Receipt email is not set up');
    const deviceHash = c.var.device.hash;
    const takesMoneyIn = c.req.query(EMAIL_MONEY_IN_PARAM) === '1';
    const knowsWhat = c.req.query(EMAIL_WHAT_PARAM) === '1';
    await rememberPlan(c.env.DB, deviceHash, c.req.query(EMAIL_PLAN_PARAM), new Date());
    const { results } = await c.env.DB.prepare(
      `SELECT id, sealed FROM email_captures WHERE device_hash = ?
       ORDER BY received_at, id LIMIT ?`,
    )
      .bind(deviceHash, EMAIL_CAPTURES_PAGE)
      .all<{ id: string; sealed: string }>();
    const captures: EmailCapture[] = [];
    // Rows that no longer open, and money in for a phone that would count it as spending.
    const broken: string[] = [];
    for (const row of results) {
      const opened = await openCapture(secret, deviceHash, row.id, row.sealed);
      const capture = opened && (knowsWhat ? opened : asBefore(opened));
      if (capture && (takesMoneyIn || capture.kind === undefined)) captures.push(capture);
      else broken.push(row.id);
    }
    if (broken.length > 0) {
      await c.env.DB.batch(
        broken.map((id) =>
          c.env.DB.prepare('DELETE FROM email_captures WHERE id = ? AND device_hash = ?').bind(
            id,
            deviceHash,
          ),
        ),
      );
    }
    c.header('Cache-Control', 'no-store');
    return c.json({ captures });
  },
};
