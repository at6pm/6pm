import { useEffect } from 'react';
import { Pressable, Text, View } from 'react-native';
import Animated, {
  Easing,
  interpolateColor,
  ReduceMotion,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { curves, springs } from '@6pm/theme';

import { useMoneyFormat } from '../../money/use-money-format';
import { isSymbolName, Symbol } from '../../ui/icons/symbol';
import { PressScale } from '../../ui/primitives/press-scale';
import { useTheme } from '../../ui/theme/theme';
import { body, tabular } from '../../ui/type/fonts';
import type { BillView } from './plan-view';
import { billTile, type SplitColours } from './split-colours';

const ease = Easing.bezier(...curves.enter);
const TOGGLE_MS = 250;
const reduceMotion = ReduceMotion.System;

/** One bill in Plan's Bills panel: its tile, name and due line (tap to edit), amount and tick. */
export function BillRowView({
  view,
  first,
  sub,
  label,
  editLabel,
  colours,
  onToggle,
  onEdit,
}: {
  readonly view: BillView;
  readonly first: boolean;
  readonly sub: string;
  readonly label: string;
  readonly editLabel: string;
  readonly colours: SplitColours;
  readonly onToggle: () => void;
  readonly onEdit: () => void;
}) {
  const { palette } = useTheme();
  const money = useMoneyFormat();
  const paid = useSharedValue(view.paid ? 1 : 0);
  const pop = useSharedValue(1);
  const tile = billTile(view.bill.hue);
  useEffect(() => {
    paid.value = withTiming(view.paid ? 1 : 0, { duration: TOGGLE_MS, easing: ease, reduceMotion });
  }, [view.paid, paid]);
  const row = useAnimatedStyle(() => ({ opacity: 1 - 0.45 * paid.value }));
  const tileStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(paid.value, [0, 1], [tile, colours.paidTile]),
  }));
  const ring = useAnimatedStyle(() => ({
    borderColor: interpolateColor(paid.value, [0, 1], [palette.inkSoft, colours.tick]),
    backgroundColor: interpolateColor(paid.value, [0, 1], ['rgba(0,0,0,0)', colours.tick]),
    transform: [{ scale: pop.value }],
  }));
  const tick = useAnimatedStyle(() => ({ opacity: paid.value }));
  const { bill } = view;
  return (
    <Animated.View
      style={[
        {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 12,
          marginHorizontal: 14,
          paddingVertical: 9,
          borderTopWidth: first ? 0 : 0.5,
          borderColor: palette.hair,
        },
        row,
      ]}
    >
      <PressScale
        accessibilityRole="button"
        accessibilityLabel={editLabel}
        scaleTo={0.98}
        onPress={onEdit}
        style={{ flex: 1, minWidth: 0, flexDirection: 'row', alignItems: 'center', gap: 12 }}
      >
        <Animated.View
          style={[
            {
              width: 34,
              height: 34,
              borderRadius: 11,
              alignItems: 'center',
              justifyContent: 'center',
            },
            tileStyle,
          ]}
        >
          <Symbol
            name={isSymbolName(bill.icon) ? bill.icon : 'payments'}
            size={19}
            fill={1}
            color="#ffffff"
          />
        </Animated.View>
        <View style={{ flex: 1, minWidth: 0, gap: 1 }}>
          <Text numberOfLines={1} style={{ ...body(15, 600), color: palette.ink }}>
            {bill.name}
          </Text>
          <Text
            numberOfLines={1}
            style={{ ...body(12), color: view.paid ? palette.inkSoft : colours.due }}
          >
            {sub}
          </Text>
        </View>
        <Text style={{ ...body(14.5, 650), ...tabular, color: palette.ink }}>
          {money.short(bill.amount)}
        </Text>
      </PressScale>
      <Pressable
        accessibilityRole="checkbox"
        accessibilityState={{ checked: view.paid }}
        accessibilityLabel={label}
        hitSlop={8}
        onPress={() => {
          pop.value = withSequence(
            withTiming(0.86, { duration: 70, reduceMotion }),
            withSpring(1, { ...springs.pop, reduceMotion }),
          );
          onToggle();
        }}
      >
        <Animated.View
          style={[
            {
              width: 32,
              height: 32,
              borderRadius: 16,
              borderWidth: 1.5,
              alignItems: 'center',
              justifyContent: 'center',
            },
            ring,
          ]}
        >
          <Animated.View style={tick}>
            <Symbol name="check" size={19} color={colours.tickInk} />
          </Animated.View>
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
}
