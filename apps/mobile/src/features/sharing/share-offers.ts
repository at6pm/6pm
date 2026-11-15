import { useEffect, useState } from 'react';

import { useMoneyStore } from '../../data/money-provider';
import type { SqlDatabase } from '../../data/table';

/**
 * The settings key holding the moments a card was already offered at ("covered:2026-11-08",
 * "fifth:2026-10-30", "shop:2026-11-01", "work-year:2026"): each moment's chip is shown once.
 * Kept on the phone only.
 */
const OFFERED_KEY = 'shareMomentsOffered';
/** The most moments remembered; the oldest are let go (their days have passed). */
const KEEP = 200;

async function offeredMoments(db: SqlDatabase): Promise<string[]> {
  const rows = await db.getAllAsync<{ value: string }>('SELECT value FROM settings WHERE key = ?', [
    OFFERED_KEY,
  ]);
  try {
    const parsed: unknown = JSON.parse(rows[0]?.value ?? '[]');
    return Array.isArray(parsed) ? parsed.filter((m): m is string => typeof m === 'string') : [];
  } catch {
    return [];
  }
}

/**
 * Whether a card's chip is offered here: true while any of `moments` has not been offered before.
 * The moments are marked offered as the chip shows, so it stays for this visit and is not offered
 * again. Nothing (an empty list) offers nothing.
 */
export function useShareOffer(moments: readonly string[]): boolean {
  const store = useMoneyStore();
  const key = moments.join('|');
  const [offered, setOffered] = useState<string | null>(null);
  useEffect(() => {
    if (key === '') return undefined;
    let live = true;
    void (async () => {
      const wanted = key.split('|');
      const before = await offeredMoments(store.db);
      const fresh = wanted.filter((m) => !before.includes(m));
      if (fresh.length === 0 || !live) return;
      setOffered(key);
      await store.db.runAsync('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)', [
        OFFERED_KEY,
        JSON.stringify([...before, ...fresh].slice(-KEEP)),
      ]);
    })().catch(() => undefined);
    return () => {
      live = false;
    };
  }, [store, key]);
  return key !== '' && offered === key;
}
