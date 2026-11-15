import { useLocalSearchParams } from 'expo-router';

import { DaySheet } from '../features/diary/day-sheet';
import { UndoHost } from '../ui/undo/undo-host';

/** Just above the home indicator: a sheet has no tab bar to clear. */
const UNDO_LIFT = 50;

/**
 * A filed day's records, opened from its Diary receipt (`/day?day=2026-11-14`). Inside a sheet
 * the app's own undo bar is covered, so a delete's undo shows in the sheet.
 */
export default function Day() {
  const { day } = useLocalSearchParams<{ day: string }>();
  return (
    <UndoHost lift={UNDO_LIFT}>
      <DaySheet day={day ?? ''} />
    </UndoHost>
  );
}
