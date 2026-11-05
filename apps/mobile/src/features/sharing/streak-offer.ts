import { useEffect, useState } from 'react';

import {
  addDays,
  closeRunTo,
  streakMilestoneOf,
  STREAK_CARD_MILESTONES,
  type LocalDate,
  type StreakMilestone,
} from '@6pm/domain';

import { readClosedBetween } from '../../data/diary-queries';
import { useMoneyStore } from '../../data/money-provider';
import type { SqlDatabase } from '../../data/table';

/**
 * The settings key holding the streak milestones already offered as a card: each of 7, 30 and
 * 100 is offered once. Kept on the phone only.
 */
const OFFERED_KEY = 'shareStreakOffered';
const LOOK_BACK = Math.max(...STREAK_CARD_MILESTONES) + 1;

async function offeredMilestones(db: SqlDatabase): Promise<number[]> {
  const rows = await db.getAllAsync<{ value: string }>('SELECT value FROM settings WHERE key = ?', [
    OFFERED_KEY,
  ]);
  try {
    const parsed: unknown = JSON.parse(rows[0]?.value ?? '[]');
    return Array.isArray(parsed) ? parsed.filter((n): n is number => typeof n === 'number') : [];
  } catch {
    return [];
  }
}

/**
 * The milestone the evening just closed reaches, when it is one (7, 30 or 100 evenings in a row)
 * not offered before: the close reveal then shows the streak and the Share chip. It is marked
 * offered the moment it is found, so it shows on this reveal only.
 */
export function useStreakOffer(day: LocalDate): StreakMilestone | null {
  const store = useMoneyStore();
  const [milestone, setMilestone] = useState<StreakMilestone | null>(null);
  useEffect(() => {
    let live = true;
    void (async () => {
      const rows = await readClosedBetween(store, addDays(day, -LOOK_BACK), day);
      // The evening on the reveal is filed when Done is tapped: it counts as closed already.
      const run = closeRunTo([...rows.map((r) => r.day), day], day);
      const reached = run ? streakMilestoneOf(run.days) : null;
      if (reached === null) return;
      const offered = await offeredMilestones(store.db);
      if (offered.includes(reached)) return;
      await store.db.runAsync('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)', [
        OFFERED_KEY,
        JSON.stringify([...offered, reached]),
      ]);
      if (live) setMilestone(reached);
    })().catch(() => undefined);
    return () => {
      live = false;
    };
  }, [store, day]);
  return milestone;
}
