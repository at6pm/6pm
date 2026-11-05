import { File, Paths } from 'expo-file-system';
import { z } from 'zod';

import { NOTIFICATION_KINDS } from '@6pm/domain';

import type { MoneyStore } from '../../data/money-store';
import {
  readNotificationSettings,
  writeNotificationSettings,
} from '../../data/notification-settings';
import { reloadNotificationSettings } from '../reminders/notification-prefs';
import { scheduledNotifications } from '../reminders/notification-schedule';

/** Settings › Notifications' switches, as a developer command sets them. */
export const notifyCommandSchema = z
  .object({
    amounts: z.boolean(),
    close: z.boolean(),
    payday: z.boolean(),
    capture: z.boolean(),
    reminders: z.boolean(),
  })
  .partial();

/** How long after a command the schedule is read back: the rebuild waits for changes to settle. */
const DUMP_AFTER_MS = 3000;

/** Sets the switches the command names, as Settings would. */
export async function applyNotifyCommand(
  store: MoneyStore,
  command: z.infer<typeof notifyCommandSchema>,
): Promise<void> {
  const known = await readNotificationSettings(store.db);
  const on = { ...known.on };
  for (const kind of NOTIFICATION_KINDS) {
    const value = command[kind];
    if (value !== undefined) on[kind] = value;
  }
  await writeNotificationSettings(store, { on, amounts: command.amounts ?? known.amounts });
  await reloadNotificationSettings(store.db);
}

/**
 * Writes what is scheduled into Documents as `notifications.json` (id, trigger and words), a
 * moment after the command, so a script can read back what the phone will send.
 */
export function dumpScheduledNotifications(): void {
  setTimeout(() => {
    void scheduledNotifications()
      .then((list) => {
        const file = new File(Paths.document, 'notifications.json');
        if (file.exists) file.delete();
        file.create();
        return file.write(JSON.stringify(list, null, 2));
      })
      .catch(() => undefined);
  }, DUMP_AFTER_MS);
}
