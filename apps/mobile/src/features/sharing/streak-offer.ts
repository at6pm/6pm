import { useEffect, useState } from 'react';

import {
  addDays,
  streakCardOffer,
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
 * The milestone the evening being closed reaches, when it is one (7, 30 or 100 evenings in a
 * row) not offered before. Read as the close opens, so the reveal has it on its first frame;
 * nothing is marked until the reveal shows it (`useMarkStreakOffered`).
 */
export function useStreakMilestone(day: LocalDate): StreakMilestone | null {
  const store = useMoneyStore();
  const [milestone, setMilestone] = useState<StreakMilestone | null>(null);
  useEffect(() => {
    let live = true;
    void (async () => {
      const [rows, offered] = await Promise.all([
        readClosedBetween(store, addDays(day, -LOOK_BACK), day),
        offeredMilestones(store.db),
      ]);
      // The evening being closed is filed when Done is tapped: it counts as closed already.
      const reached = streakCardOffer({ closedDays: rows.map((r) => r.day), day, offered });
      if (reached !== null && live) setMilestone(reached);
    })().catch(() => undefined);
    return () => {
      live = false;
    };
  }, [store, day]);
  return milestone;
}

/** Marks the milestone the reveal is showing as offered, so it shows on this reveal only. */
export function useMarkStreakOffered(milestone: StreakMilestone | null): void {
  const store = useMoneyStore();
  useEffect(() => {
    if (milestone === null) return;
    void (async () => {
      const offered = await offeredMilestones(store.db);
      if (offered.includes(milestone)) return;
      await store.db.runAsync('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)', [
        OFFERED_KEY,
        JSON.stringify([...offered, milestone]),
      ]);
    })().catch(() => undefined);
  }, [store, milestone]);
}
