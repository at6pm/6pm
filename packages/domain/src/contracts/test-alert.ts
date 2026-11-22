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

/**
 * The letters and digits a test alert's code is made of on the iPhone, where the code is printed
 * in the notification itself: none that read alike (no 0 or O, no 1 or I).
 */
export const TEST_ALERT_CODE_LETTERS = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
/** How long that code is: eight of those, far more than could turn up in words by chance. */
export const TEST_ALERT_CODE_LENGTH = 8;

/** A test alert's code from random bytes, one letter a byte (the alphabet divides 256 evenly). */
export function testAlertCodeOf(bytes: ArrayLike<number>): string {
  let code = '';
  for (let i = 0; i < TEST_ALERT_CODE_LENGTH; i++) {
    code += TEST_ALERT_CODE_LETTERS[(bytes[i] ?? 0) % TEST_ALERT_CODE_LETTERS.length];
  }
  return code;
}

/**
 * The notification's body on the iPhone: the test alert's words, then its code on a line of its
 * own. A Shortcut passes a notification's words and nothing else, so the code is printed in them,
 * where "Catch a bank alert" looks for it.
 */
export function testAlertBodyWithCode(words: string, code: string): string {
  return `${words}\n${code}`;
}

/** How long after the app sent a test alert the Shortcut may still hand it over as one. */
export const TEST_ALERT_FRESH_MS = 60_000;

/**
 * The test alert the app is waiting for, as it writes it to the App Group a moment before posting
 * the notification: the Shortcut's action takes a notification from 6pm for a test only when its
 * words carry this very token and this was written within `TEST_ALERT_FRESH_MS`.
 */
export const pendingTestAlertSchema = z.object({
  v: z.literal(1),
  /** At least eight letters or digits, so no everyday word can stand in for it. */
  token: z.string().regex(/^[0-9A-Za-z-]{8,64}$/),
  /** When the app sent it. */
  at: z.string().min(20),
});
export type PendingTestAlert = z.infer<typeof pendingTestAlertSchema>;
