import { useEffect, useRef } from 'react';
import { Text, View } from 'react-native';
import Animated, {
  ReduceMotion,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import type { BankWork } from '@6pm/domain';
import { workInk } from '@6pm/theme';

import { PressScale } from '../../ui/primitives/press-scale';
import { mono } from '../../ui/type/fonts';

/**
 * The stamp-in curve: from 1.4 times its size down onto the paper in about .3 s, with a little
 * give. The stamp stays at its −7° tilt.
 */
const STAMP_IN = { duration: 300, dampingRatio: 0.62, reduceMotion: ReduceMotion.System } as const;
const FROM_SCALE = 1.4;

/**
 * What the stamp shows: `always` is inked (solid WORK), `sometimes` is offered (dashed WORK?),
 * `never` is the empty box where it would go.
 */
export type StampFace = BankWork;

/**
 * The WORK stamp as the canvas draws it, on paper or on a dark sheet. A face that changes lands
 * on the stamp-in curve; `onPress` makes it a control (one tap per change, the caller's haptic).
 */
export function WorkStamp({
  face,
  labels,
  surface = 'paper',
  small = false,
  onPress,
  accessibilityLabel,
}: {
  readonly face: StampFace;
  readonly labels: { readonly inked: string; readonly offered: string };
  readonly surface?: 'paper' | 'dark';
  /** The key under onboarding's slip draws it smaller. */
  readonly small?: boolean;
  readonly onPress?: () => void;
  readonly accessibilityLabel?: string;
}) {
  const ink = surface === 'paper' ? workInk.paper : workInk.onDark;
  const scale = useSharedValue(1);
  const was = useRef(face);
  useEffect(() => {
    if (was.current === face) return;
    was.current = face;
    if (face === 'never') return;
    scale.set(FROM_SCALE);
    scale.set(withSpring(1, STAMP_IN));
  }, [face, scale]);
  const press = useAnimatedStyle(() => ({
    transform: [{ rotate: '-7deg' }, { scale: scale.get() }],
  }));

  const font = small ? 10.5 : 12;
  const mark =
    face === 'never' ? (
      <View
        style={{
          width: small ? 50 : 58,
          height: small ? 21 : 25,
          borderRadius: 5,
          borderWidth: 1.5,
          borderColor: surface === 'paper' ? workInk.blankOnPaper : workInk.blankOnDark,
        }}
      />
    ) : (
      <Animated.View
        style={[
          {
            paddingVertical: small ? 2 : 3,
            paddingHorizontal: small ? 6 : 8,
            borderRadius: 5,
            borderWidth: face === 'always' ? (small ? 2 : 2.5) : 2,
            borderStyle: face === 'always' ? 'solid' : 'dashed',
            borderColor: ink,
            opacity: face === 'always' ? 0.9 : 0.7,
            ...(face === 'always' && surface === 'paper' ? { mixBlendMode: 'multiply' } : {}),
          },
          press,
        ]}
      >
        <Text
          numberOfLines={1}
          maxFontSizeMultiplier={1.2}
          style={{ ...mono(font, 600, 0.14), color: ink }}
        >
          {face === 'always' ? labels.inked : labels.offered}
        </Text>
      </Animated.View>
    );
  if (!onPress) return mark;
  return (
    <PressScale
      hitSlop={10}
      onPress={onPress}
      accessibilityRole="button"
      {...(accessibilityLabel ? { accessibilityLabel } : {})}
      accessibilityState={{ checked: face === 'always' }}
    >
      {mark}
    </PressScale>
  );
}
