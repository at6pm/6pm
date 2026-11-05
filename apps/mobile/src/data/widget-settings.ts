import type { SqlDatabase } from './table';

/**
 * The settings key holding how the widgets show money on this phone: whether amounts stay hidden
 * (•••) until the phone is unlocked. Kept on the phone only, never in the backup: it is about this
 * phone's Lock Screen and Home Screen.
 */
export const WIDGET_PRIVACY_KEY = 'widgetPrivacy';

export interface WidgetPrivacy {
  readonly hideAmounts: boolean;
}

const SHOWN: WidgetPrivacy = { hideAmounts: false };

export async function readWidgetPrivacy(db: SqlDatabase): Promise<WidgetPrivacy> {
  const rows = await db.getAllAsync<{ value: string }>('SELECT value FROM settings WHERE key = ?', [
    WIDGET_PRIVACY_KEY,
  ]);
  try {
    const parsed = JSON.parse(rows[0]?.value ?? 'null') as { hideAmounts?: unknown } | null;
    return { hideAmounts: parsed?.hideAmounts === true };
  } catch {
    return SHOWN;
  }
}

export async function writeWidgetPrivacy(
  db: SqlDatabase,
  privacy: WidgetPrivacy,
): Promise<WidgetPrivacy> {
  await db.runAsync('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)', [
    WIDGET_PRIVACY_KEY,
    JSON.stringify(privacy),
  ]);
  return privacy;
}
