import { z } from 'zod';

/**
 * A notification's own words, carried from the extensions to the app only while the capture log
 * is on (the surface context's `keepWords`): on a caught alert's inbox item, and for an alert that
 * moved no money, in an item of its own the app logs and saves nothing from.
 */

/** The longest piece of a notification kept for the capture log. */
export const HEARD_WORDS_MAX = 4000;

/** A notification's own words as the phone handed them in. */
export const heardWordsSchema = z.object({
  app: z.string().max(HEARD_WORDS_MAX),
  title: z.string().max(HEARD_WORDS_MAX),
  subtitle: z.string().max(HEARD_WORDS_MAX),
  body: z.string().max(HEARD_WORDS_MAX),
});
export type HeardWords = z.infer<typeof heardWordsSchema>;

/**
 * A bank alert that moved no money (a code, a failed payment, a promotion, one no template reads),
 * left for the capture log while it is on and only then. Nothing is saved from it but the log.
 */
export const inboxHeardSchema = z.object({
  v: z.literal(1),
  id: z.uuid(),
  kind: z.literal('heard'),
  at: z.string().min(20),
  bank: z.string().nullable(),
  skipped: z.enum(['code', 'failed', 'promo', 'balance', 'security', 'unread']),
  words: heardWordsSchema,
});
export type InboxHeard = z.infer<typeof inboxHeardSchema>;

/**
 * A bank alert the phone read no money from, though it prints a number: left for the app's second
 * reader with its own words, so a wording no template knows still has a chance. The app saves
 * nothing from it unless that reader finds money that moved, and never keeps its words.
 */
export const inboxUnreadSchema = z.object({
  v: z.literal(1),
  id: z.uuid(),
  kind: z.literal('unread'),
  /** When the phone read it. */
  at: z.string().min(20),
  /** When the phone was handed it (ISO 8601), when the automation passes it. */
  date: z.string().nullable(),
  bank: z.string().nullable(),
  alertWords: heardWordsSchema,
});
export type InboxUnread = z.infer<typeof inboxUnreadSchema>;
