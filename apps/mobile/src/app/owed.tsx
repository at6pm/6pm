import { OwedList } from '../features/owed/owed-list';
import { UndoHost } from '../ui/undo/undo-host';

/** Just above the home indicator: a sheet has no tab bar to clear. */
const UNDO_LIFT = 50;

/** Owed to you. Inside a sheet the app's own undo bar is covered, so it brings one of its own. */
export default function Owed() {
  return (
    <UndoHost lift={UNDO_LIFT}>
      <OwedList />
    </UndoHost>
  );
}
