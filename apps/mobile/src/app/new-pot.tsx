import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef } from 'react';

import { newJarLocked } from '@6pm/domain';

import { useMoney } from '../data/money-provider';
import { NewJarSheet } from '../features/pots/new-jar-sheet';
import { useEntitlement } from '../features/purchases/purchases-provider';

/**
 * New jar, or a jar's Edit (`?edit=<id>`). Ask opens it filled in from "tạo hũ du lịch 10tr": a
 * name, a target and a month. A new jar beyond the free ones opens the Max sheet instead.
 */
export default function NewPot() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    edit?: string;
    name?: string;
    goal?: string;
    by?: string;
  }>();
  const snap = useMoney();
  const { max } = useEntitlement();
  const editId = typeof params.edit === 'string' ? params.edit : null;
  const editing = editId === null ? null : (snap.pots.find((p) => p.id === editId) ?? null);
  const goal = Number(params.goal);
  const asked =
    editId === null && (typeof params.name === 'string' || Number.isFinite(goal))
      ? {
          name: typeof params.name === 'string' ? params.name.slice(0, 40) : '',
          goal: Number.isFinite(goal) && goal > 0 ? goal : 0,
          by: typeof params.by === 'string' && /^\d{4}-\d{2}$/.test(params.by) ? params.by : null,
        }
      : null;

  // Read once: a jar this sheet starts must not turn the sheet into the Max offer under it.
  const locked = useRef(editId === null && newJarLocked(snap.pots, max)).current;
  useEffect(() => {
    if (locked) router.replace({ pathname: '/max', params: { from: 'pots' } });
  }, [locked, router]);

  if (locked) return null;
  return <NewJarSheet editing={editing} asked={asked} />;
}
