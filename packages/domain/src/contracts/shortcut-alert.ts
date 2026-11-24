import { z } from 'zod';

import { inboxHeardSchema, inboxUnreadSchema } from './heard';
import { inboxSpendSchema, lastAlertSchema } from './surfaces';
import { inboxTestSchema } from './test-alert';

/**
 * What the iPhone's Shortcut action is answered for one notification, its sender looked at before
 * a word of it is read. A bank's or wallet's reads as `BankAlertResult` does. 6pm's own test
 * alert leaves only `test`. Any other app's leaves nothing at all: no item, no words for a second
 * reading, and no `last`, so nothing anywhere says an alert came.
 */
export const shortcutAlertResultSchema = z.object({
  item: inboxSpendSchema.nullable(),
  last: lastAlertSchema.nullable(),
  heard: inboxHeardSchema.nullable().optional(),
  unread: inboxUnreadSchema.nullable().optional(),
  test: inboxTestSchema.nullable().optional(),
});
export type ShortcutAlertResult = z.infer<typeof shortcutAlertResultSchema>;
