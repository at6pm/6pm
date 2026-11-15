import { useLocalSearchParams } from 'expo-router';

import { HeldBackSheet } from '../features/owed/held-back-sheet';
import { useSpendRow } from '../features/owed/use-spend-row';

/** Tax a client held back from a money in, and whether its certificate came. */
export default function HeldBack() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const spend = useSpendRow(id);
  if (!spend || spend.direction !== 'in') return null;
  return <HeldBackSheet spend={spend} />;
}
