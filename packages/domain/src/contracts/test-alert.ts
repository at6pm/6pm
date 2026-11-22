import { z } from 'zod';

/** The longest token a test alert carries: a UUID fits with room to spare. */
export const TEST_ALERT_TOKEN_MAX = 64;

/**
 * A test alert 6pm sent to itself, so the person can see the way a bank alert travels working
 * end to end before a real payment arrives: the listener, the reader, the inbox, the app. It is
 * never money. It has no amount, no payee and no source, so nothing that saves, counts or sends a
 * spend can take one: the app notes that it arrived, tells the screen that sent it, and removes
 * the file.
 */
export const inboxTestSchema = z.object({
  v: z.literal(1),
  id: z.uuid(),
  kind: z.literal('test'),
  /** When the phone read it. */
  at: z.string().min(20),
  /** What the app gave the alert as it posted it, so the screen that sent it knows its own. */
  token: z.string().min(1).max(TEST_ALERT_TOKEN_MAX),
});
export type InboxTest = z.infer<typeof inboxTestSchema>;

/** What reading a test alert returns: its inbox item, or null for one that carries no token. */
export const testAlertResultSchema = z.object({ item: inboxTestSchema.nullable() });
export type TestAlertResult = z.infer<typeof testAlertResultSchema>;
