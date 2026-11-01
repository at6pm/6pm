import { androidTesterRequestSchema, type AndroidTesterResponse } from '@6pm/domain';

import { readBody, type RouteDefinition } from '../route';

/**
 * Puts a Google account on the list for the Android closed test on Google Play. The founder adds
 * each one to the test's testers by hand. Sending an email that is already listed changes nothing
 * and answers the same, so a retry or a second visit is safe; the answer never says whether the
 * email was new or anything about other signups.
 */
export const androidTestersRoute: RouteDefinition = {
  method: 'POST',
  path: '/v1/android-testers',
  access: 'public',
  handle: async (c) => {
    const { email, language } = await readBody(c, androidTesterRequestSchema);
    await c.env.DB.prepare(
      `INSERT INTO android_testers (email, language, created_at) VALUES (?1, ?2, ?3)
       ON CONFLICT (email) DO NOTHING`,
    )
      .bind(email, language, new Date().toISOString())
      .run();
    const body: AndroidTesterResponse = { listed: true };
    return c.json(body);
  },
};
