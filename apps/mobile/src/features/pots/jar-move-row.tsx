import type { ReactNode } from 'react';
import { View } from 'react-native';
import { GestureDetector } from 'react-native-gesture-handler';
import Animated from 'react-native-reanimated';

import { useTheme } from '../../ui/theme/theme';
import { useRowSwipe } from '../today/row-swipe';
import { SpendRowBackdrop } from '../today/spend-row-backdrop';

const NOTHING = () => undefined;

/**
 * A line of a jar's moves that can be removed: swipe left past −48 pt and it stays open on Remove,
 * past −150 pt (or a quick flick) it goes; it gives like rubber past its stop and ticks at the
 * line, all on the UI thread, as a Today row does. VoiceOver removes it through its own action.
 */
export function JarMoveRow({
  id,
  label,
  removeLabel,
  onRemove,
  children,
}: {
  readonly id: string;
  /** What VoiceOver reads for the line. */
  readonly label: string;
  readonly removeLabel: string;
  readonly onRemove: () => void;
  readonly children: ReactNode;
}) {
  const { palette } = useTheme();
  const { x, gesture, front, deleteAway } = useRowSwipe(id, false, {
    onConfirm: NOTHING,
    onDelete: onRemove,
    onOpen: NOTHING,
  });
  return (
    <View style={{ overflow: 'hidden' }}>
      <SpendRowBackdrop
        x={x}
        confirmLabel=""
        deleteLabel={removeLabel}
        onDeletePress={deleteAway}
      />
      <GestureDetector gesture={gesture}>
        <Animated.View
          accessible
          accessibilityLabel={label}
          accessibilityActions={[{ name: 'delete', label: removeLabel }]}
          onAccessibilityAction={(e) => {
            if (e.nativeEvent.actionName === 'delete') deleteAway();
          }}
          style={[{ backgroundColor: palette.cell }, front]}
        >
          {children}
        </Animated.View>
      </GestureDetector>
    </View>
  );
}
