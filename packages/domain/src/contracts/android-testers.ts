import { z } from 'zod';

import { languageSchema } from './wire';

/**
 * One signup for the Android closed test on Google Play, from the website. The email is the Google
 * account the person uses on the Play Store (usually a Gmail), which the founder adds to the test's
 * tester list by hand. Trimmed and lowercased here, so one account is one signup however it is
 * typed.
 */
export const androidTesterRequestSchema = z.object({
  email: z.string().trim().toLowerCase().pipe(z.email().max(254)),
  language: languageSchema,
});
export type AndroidTesterRequest = z.input<typeof androidTesterRequestSchema>;

/** The signup is on the tester list. Nothing about other signups is ever said. */
export const androidTesterResponseSchema = z.object({
  listed: z.literal(true),
});
export type AndroidTesterResponse = z.infer<typeof androidTesterResponseSchema>;
