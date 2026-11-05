import { z } from 'zod';

import { NOTIFICATION_KINDS, type NotificationKind } from '@6pm/domain';

import type { MoneyStore } from './money-store';
import type { SqlDatabase } from './table';

/**
 * The settings key of Settings › Your day › Notifications: a switch per kind and whether amounts
 * show on the lock screen. Kept on this phone only (`BACKUP_SETTING_KEYS` leaves it out): a
 * restored phone starts with every kind on and amounts hidden, as a new one does.
 */
export const NOTIFICATION_SETTINGS_KEY = 'notifications';

/**
 * What the scheduler remembers between rebuilds, on this phone only: when each way gone quiet was
 * last asked about (an instant), so it is asked at most once a week.
 */
export const NOTIFICATION_MEMORY_KEY = 'notificationMemory';

export interface NotificationSettings {
  readonly on: Readonly<Record<NotificationKind, boolean>>;
  /** Amounts in the words: off by default, so the lock screen shows none. */
  readonly amounts: boolean;
}

export const DEFAULT_NOTIFICATION_SETTINGS: NotificationSettings = {
  on: { close: true, payday: true, capture: true, reminders: true },
  amounts: false,
};

const settingsSchema = z.object({
  on: z.object(
    Object.fromEntries(NOTIFICATION_KINDS.map((kind) => [kind, z.boolean().optional()])),
  ),
  amounts: z.boolean().optional(),
});

const memorySchema = z.object({ quietTold: z.record(z.string(), z.string()).optional() });

export interface NotificationMemory {
  readonly quietTold: Readonly<Record<string, string>>;
}

async function readJson(db: SqlDatabase, key: string): Promise<unknown> {
  const rows = await db.getAllAsync<{ value: string }>('SELECT value FROM settings WHERE key = ?', [
    key,
  ]);
  try {
    return JSON.parse(rows[0]?.value ?? 'null') as unknown;
  } catch {
    return null;
  }
}

/** The switches as last set, every kind on and amounts hidden where nothing was ever set. */
export async function readNotificationSettings(db: SqlDatabase): Promise<NotificationSettings> {
  const parsed = settingsSchema.safeParse(await readJson(db, NOTIFICATION_SETTINGS_KEY));
  if (!parsed.success) return DEFAULT_NOTIFICATION_SETTINGS;
  const on = { ...DEFAULT_NOTIFICATION_SETTINGS.on };
  for (const kind of NOTIFICATION_KINDS) {
    const value = parsed.data.on[kind];
    if (typeof value === 'boolean') on[kind] = value;
  }
  return { on, amounts: parsed.data.amounts ?? DEFAULT_NOTIFICATION_SETTINGS.amounts };
}

/** Keeps the switches, in the store's turn. */
export async function writeNotificationSettings(
  store: Pick<MoneyStore, 'db' | 'exclusive'>,
  settings: NotificationSettings,
): Promise<void> {
  await store.exclusive(() =>
    store.db.runAsync('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)', [
      NOTIFICATION_SETTINGS_KEY,
      JSON.stringify(settings),
    ]),
  );
}

export async function readNotificationMemory(db: SqlDatabase): Promise<NotificationMemory> {
  const parsed = memorySchema.safeParse(await readJson(db, NOTIFICATION_MEMORY_KEY));
  return { quietTold: parsed.success ? (parsed.data.quietTold ?? {}) : {} };
}

export async function writeNotificationMemory(
  store: Pick<MoneyStore, 'db' | 'exclusive'>,
  memory: NotificationMemory,
): Promise<void> {
  await store.exclusive(() =>
    store.db.runAsync('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)', [
      NOTIFICATION_MEMORY_KEY,
      JSON.stringify(memory),
    ]),
  );
}
