import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { View, type LayoutChangeEvent } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  FadeIn,
  ReduceMotion,
  useAnimatedStyle,
  useDerivedValue,
  useReducedMotion,
  useSharedValue,
  withSpring,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

import type { CategoryRow } from '@6pm/domain';
import { springs } from '@6pm/theme';

import { haptics } from '../../ui/haptics';
import { useTheme } from '../../ui/theme/theme';
import { SpendRowBackdrop } from '../today/spend-row-backdrop';
import { useRowSwipe } from '../today/row-swipe';

/** How long a finger rests on a row before it lifts to be dragged. */
const LIFT_MS = 380;
const LIFT_SCALE = 1.03;
const reduceMotion = ReduceMotion.System;
const NOTHING = () => undefined;

type Slots = Record<string, number>;

const slotsOf = (ids: readonly string[]): Slots => Object.fromEntries(ids.map((id, i) => [id, i]));

/** The order the slots say, top to bottom. */
function orderOf(slots: Slots): string[] {
  'worklet';
  return Object.keys(slots).sort((a, b) => (slots[a] ?? 0) - (slots[b] ?? 0));
}

/** Every other row between a lifted row's old slot and its new one moves one slot toward the gap. */
function moveTo(slots: Slots, id: string, to: number): Slots {
  'worklet';
  const from = slots[id] ?? to;
  if (from === to) return slots;
  const next: Slots = {};
  for (const key of Object.keys(slots)) {
    const at = slots[key] ?? 0;
    if (key === id) next[key] = to;
    else if (from < to && at > from && at <= to) next[key] = at - 1;
    else if (from > to && at < from && at >= to) next[key] = at + 1;
    else next[key] = at;
  }
  return next;
}

export interface SortableLabels {
  readonly delete: string;
  readonly moveUp: string;
  readonly moveDown: string;
  readonly hint: string;
}

/**
 * The Categories card's rows, each one swipeable and draggable, all on the UI thread. Swipe left
 * past −48 pt and it stays open on Delete, past −150 pt (or a quick flick) it goes, ticking at the
 * line, as a Today row does. Rest a finger on a row and it lifts (a little larger, a shadow under
 * it, a tick); drag it and the others make room, one slot at a time with a tick; let go and it
 * settles in its slot and the new order is saved. Rows sit in slots by transform, so nothing lays
 * out while they move. Reduce Motion: no lift, quick fades. VoiceOver has Delete, Move up and Move
 * down on every row.
 */
export function SortableCategories({
  categories,
  labelOf,
  renderFace,
  labels,
  onOpen,
  onDelete,
  onReorder,
  onDragging,
}: {
  readonly categories: readonly CategoryRow[];
  /** What VoiceOver reads for a row. */
  readonly labelOf: (category: CategoryRow) => string;
  readonly renderFace: (category: CategoryRow, first: boolean) => ReactNode;
  readonly labels: SortableLabels;
  readonly onOpen: (id: string) => void;
  readonly onDelete: (id: string) => void;
  readonly onReorder: (ids: readonly string[]) => void;
  /** A row is lifted: the sheet holds its scroll still until it is dropped. */
  readonly onDragging: (dragging: boolean) => void;
}) {
  const ids = useMemo(() => categories.map((c) => c.id), [categories]);
  const [height, setHeight] = useState<number | null>(null);
  const slots = useSharedValue<Slots>(slotsOf(ids));
  const lifted = useSharedValue<string | null>(null);
  const rowHeight = useSharedValue(0);
  const count = useSharedValue(ids.length);
  const reduce = useReducedMotion();

  // A new list from the store (a row deleted, made or moved) puts every row in its slot again.
  useEffect(() => {
    slots.set(slotsOf(ids));
    count.set(ids.length);
  }, [ids, slots, count]);

  const measure = useCallback(
    (e: LayoutChangeEvent) => {
      const h = Math.round(e.nativeEvent.layout.height * 2) / 2;
      if (h > 0 && h !== height) {
        rowHeight.set(h);
        setHeight(h);
      }
    },
    [height, rowHeight],
  );

  const card = useAnimatedStyle(() => {
    const h = count.get() * rowHeight.get();
    return { height: reduce ? withTiming(h, { duration: 150 }) : withSpring(h, springs.settle) };
  });

  const move = useCallback(
    (id: string, by: -1 | 1) => {
      const at = ids.indexOf(id);
      const to = at + by;
      if (at < 0 || to < 0 || to >= ids.length) return;
      const next = [...ids];
      next.splice(at, 1);
      next.splice(to, 0, id);
      haptics.tick();
      onReorder(next);
    },
    [ids, onReorder],
  );

  // Until a row has been measured, rows lie in the card as any list does; then each takes its slot.
  const placed = height !== null;
  return (
    <Animated.View style={placed ? card : undefined}>
      {categories.map((category, i) => (
        <SortableRow
          key={category.id}
          id={category.id}
          deletable={ids.length > 1}
          placed={placed}
          onLayout={i === 0 ? measure : undefined}
          slots={slots}
          lifted={lifted}
          rowHeight={rowHeight}
          count={count}
          reduce={reduce}
          label={labelOf(category)}
          labels={labels}
          onOpen={onOpen}
          onDelete={onDelete}
          onReorder={onReorder}
          onDragging={onDragging}
          onMove={move}
        >
          {renderFace(category, i === 0)}
        </SortableRow>
      ))}
    </Animated.View>
  );
}

function SortableRow({
  id,
  deletable,
  placed,
  onLayout,
  slots,
  lifted,
  rowHeight,
  count,
  reduce,
  label,
  labels,
  onOpen,
  onDelete,
  onReorder,
  onDragging,
  onMove,
  children,
}: {
  readonly id: string;
  readonly deletable: boolean;
  /** Measured: the row sits in its slot by transform. */
  readonly placed: boolean;
  readonly onLayout: ((e: LayoutChangeEvent) => void) | undefined;
  readonly slots: SharedValue<Slots>;
  readonly lifted: SharedValue<string | null>;
  readonly rowHeight: SharedValue<number>;
  readonly count: SharedValue<number>;
  readonly reduce: boolean;
  readonly label: string;
  readonly labels: SortableLabels;
  readonly onOpen: (id: string) => void;
  readonly onDelete: (id: string) => void;
  readonly onReorder: (ids: readonly string[]) => void;
  readonly onDragging: (dragging: boolean) => void;
  readonly onMove: (id: string, by: -1 | 1) => void;
  readonly children: ReactNode;
}) {
  const { palette } = useTheme();
  const {
    x,
    gesture: swipe,
    front,
    deleteAway,
  } = useRowSwipe(id, false, {
    onConfirm: NOTHING,
    onDelete,
    onOpen,
  });
  const top = useSharedValue(0);
  const startTop = useSharedValue(0);

  const drag = useMemo(
    () =>
      Gesture.Pan()
        .activateAfterLongPress(LIFT_MS)
        .onStart(() => {
          const at = (slots.get()[id] ?? 0) * rowHeight.get();
          startTop.set(at);
          top.set(at);
          lifted.set(id);
          scheduleOnRN(haptics.tap);
          scheduleOnRN(onDragging, true);
        })
        .onUpdate((e) => {
          const h = rowHeight.get();
          const last = Math.max(0, count.get() - 1);
          const y = Math.min(Math.max(startTop.get() + e.translationY, 0), last * h);
          top.set(y);
          const slot = Math.round(y / h);
          const current = slots.get();
          if (slot !== current[id]) {
            slots.set(moveTo(current, id, slot));
            scheduleOnRN(haptics.tick);
          }
        })
        .onFinalize(() => {
          if (lifted.get() !== id) return;
          const target = (slots.get()[id] ?? 0) * rowHeight.get();
          const order = orderOf(slots.get());
          top.set(
            reduce
              ? withTiming(target, { duration: 120 })
              : withSpring(target, { ...springs.settle, reduceMotion }, (finished) => {
                  if (finished && lifted.get() === id) lifted.set(null);
                }),
          );
          if (reduce) lifted.set(null);
          scheduleOnRN(onDragging, false);
          scheduleOnRN(onReorder, order);
        }),
    [id, slots, lifted, rowHeight, count, top, startTop, reduce, onDragging, onReorder],
  );
  // The last category can never be deleted: it only opens and lifts.
  const gesture = useMemo(
    () =>
      Gesture.Race(
        drag,
        deletable
          ? swipe
          : Gesture.Tap().onEnd((_e, success) => {
              if (success) scheduleOnRN(onOpen, id);
            }),
      ),
    [drag, swipe, deletable, onOpen, id],
  );

  const isLifted = useDerivedValue(() => lifted.get() === id);
  const place = useAnimatedStyle(() => {
    const slotTop = (slots.get()[id] ?? 0) * rowHeight.get();
    const y = isLifted.get()
      ? top.get()
      : reduce
        ? withTiming(slotTop, { duration: 150 })
        : withSpring(slotTop, springs.settle);
    const scale = isLifted.get() && !reduce ? LIFT_SCALE : 1;
    return {
      zIndex: isLifted.get() ? 2 : 0,
      transform: [{ translateY: y }, { scale: withSpring(scale, springs.settle) }],
    };
  });
  const shadow = useAnimatedStyle(() => ({
    opacity: withTiming(isLifted.get() ? 1 : 0, { duration: 160 }),
  }));

  return (
    <Animated.View
      entering={FadeIn.duration(250)}
      onLayout={onLayout}
      style={placed ? [{ position: 'absolute', left: 0, right: 0, top: 0 }, place] : undefined}
    >
      <Animated.View
        pointerEvents="none"
        style={[
          { position: 'absolute', inset: 0, borderRadius: 14, boxShadow: palette.cardShadow },
          shadow,
        ]}
      />
      <View style={{ overflow: 'hidden' }}>
        <SpendRowBackdrop
          x={x}
          confirmLabel=""
          deleteLabel={labels.delete}
          onDeletePress={deleteAway}
        />
        <GestureDetector gesture={gesture}>
          <Animated.View
            accessible
            accessibilityRole="button"
            accessibilityLabel={label}
            accessibilityHint={labels.hint}
            accessibilityActions={[
              { name: 'activate' },
              ...(deletable ? [{ name: 'delete', label: labels.delete }] : []),
              { name: 'moveUp', label: labels.moveUp },
              { name: 'moveDown', label: labels.moveDown },
            ]}
            onAccessibilityAction={(e) => {
              const action = e.nativeEvent.actionName;
              if (action === 'activate') onOpen(id);
              else if (action === 'delete' && deletable) deleteAway();
              else if (action === 'moveUp') onMove(id, -1);
              else if (action === 'moveDown') onMove(id, 1);
            }}
            style={front}
          >
            {children}
          </Animated.View>
        </GestureDetector>
      </View>
    </Animated.View>
  );
}
