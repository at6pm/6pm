import { Text, View } from 'react-native';
import Animated, { useAnimatedStyle, type SharedValue } from 'react-native-reanimated';

import { moneyInInk } from '@6pm/theme';

import { Symbol } from '../../ui/icons/symbol';
import { body, mono, tabular } from '../../ui/type/fonts';

/**
 * Where money lifted off the close's stack goes: a green glass pill over the header, saying what
 * Future you holds and will hold. It fades in and grows as the card rises (`lift` is the card's
 * drag, negative going up), so it is only ever seen while a card is on its way to it.
 */
export function FutureYouPill({
  label,
  from,
  to,
  lift,
  reach,
}: {
  readonly label: string;
  readonly from: string;
  readonly to: string;
  readonly lift: SharedValue<number>;
  /** How far up the card has to be for the pill to be all there. */
  readonly reach: number;
}) {
  const show = useAnimatedStyle(() => {
    const k = Math.min(1, Math.max(0, -lift.get() / reach));
    return { opacity: k, transform: [{ scale: 0.92 + 0.08 * k }] };
  });
  return (
    <Animated.View
      pointerEvents="none"
      style={[
        { position: 'absolute', top: 64, left: 0, right: 0, alignItems: 'center', zIndex: 20 },
        show,
      ]}
    >
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 12,
          paddingVertical: 8,
          paddingLeft: 8,
          paddingRight: 18,
          borderRadius: 99,
          backgroundColor: moneyInInk.pill,
          borderWidth: 1,
          borderColor: moneyInInk.pillEdge,
          boxShadow: `0 0 0 6px ${moneyInInk.pillHalo}, 0 14px 34px rgba(8,3,16,.35)`,
        }}
      >
        <View
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: moneyInInk.futureYou,
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,.5)',
          }}
        >
          <Symbol name="arrow_upward" size={22} color={moneyInInk.futureYouFg} />
        </View>
        <View style={{ gap: 1 }}>
          <Text style={{ ...mono(10.5, 400, 0.14), color: moneyInInk.pillLabel }}>{label}</Text>
          <Text style={{ ...body(16, 650, -0.01), ...tabular, color: moneyInInk.pillText }}>
            {from}
            <Text style={{ ...body(16, 500), opacity: 0.5 }}> → </Text>
            {to}
          </Text>
        </View>
      </View>
    </Animated.View>
  );
}
