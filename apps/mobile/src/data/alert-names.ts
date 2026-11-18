import { foldWords } from '@6pm/domain';

import type { SqlDatabase } from './table';

const KEY = 'capture.alertNames';
/** How many wordings the phone remembers a name for; the oldest goes first. */
export const ALERT_NAMES_MAX = 120;

/** Who an alert's wording was read as paying; an empty merchant when it names nobody. */
export interface AlertName {
  readonly merchant: string;
  /** The category's name as the server chose it among the person's own; null when it chose none. */
  readonly category: string | null;
}

type Kept = Readonly<Record<string, AlertName>>;

/**
 * What tells one alert wording from another: its bank and its words with every number out, folded.
 * Two payments at one shop word their alert the same once the numbers are gone.
 */
export function alertNameKey(bank: string | undefined, lines: readonly string[]): string {
  return [bank ?? '', ...lines].map((part) => foldWords(part).trim()).join('|');
}

async function read(db: SqlDatabase): Promise<Kept> {
  const rows = await db.getAllAsync<{ value: string }>('SELECT value FROM settings WHERE key = ?', [
    KEY,
  ]);
  try {
    const kept: unknown = JSON.parse(rows[0]?.value ?? '{}');
    return kept !== null && typeof kept === 'object' && !Array.isArray(kept) ? (kept as Kept) : {};
  } catch {
    return {};
  }
}

/**
 * The names the server gave alert wordings, remembered on this phone so each wording is asked
 * about once. Kept in the settings table, the newest `ALERT_NAMES_MAX`.
 */
export function alertNames(db: SqlDatabase) {
  return {
    async get(key: string): Promise<AlertName | null> {
      const found = (await read(db))[key];
      return found && typeof found.merchant === 'string'
        ? { merchant: found.merchant, category: found.category ?? null }
        : null;
    },
    async put(key: string, name: AlertName): Promise<void> {
      const entries = Object.entries(await read(db)).filter(([k]) => k !== key);
      entries.push([key, name]);
      await db.runAsync('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)', [
        KEY,
        JSON.stringify(Object.fromEntries(entries.slice(-ALERT_NAMES_MAX))),
      ]);
    },
  };
}
