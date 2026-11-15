import { useEffect, useRef } from 'react';
import { Text } from 'react-native';
import Animated, {
  ReduceMotion,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import { requestInk } from '@6pm/theme';

import { PressScale } from '../../ui/primitives/press-scale';
import { mono } from '../../ui/type/fonts';

/** The stamp-in: from 1.4 times its size down onto the paper in about .3 s, at its −7° tilt. */
const STAMP_IN = { duration: 300, dampingRatio: 0.62, reduceMotion: ReduceMotion.System } as const;

/**
 * The tax certificate's stamp: dashed "ARRIVED?" while it waits, inked with the day it came once
 * tapped (the stamp-in curve; the caller's success haptic). Tapped again it lifts. `faded` sinks an
 * inked line to 70% ink on the year's list, where it stays as the record.
 */
export function CertificateStamp({
  inked,
  label,
  onPress,
  small = false,
  accessibilityLabel,
}: {
  readonly inked: boolean;
  readonly label: string;
  readonly onPress?: () => void;
  readonly small?: boolean;
  readonly accessibilityLabel?: string;
}) {
  const scale = useSharedValue(1);
  const was = useRef(inked);
  useEffect(() => {
    if (was.current === inked) return;
    was.current = inked;
    if (!inked) return;
    scale.set(1.4);
    scale.set(withSpring(1, STAMP_IN));
  }, [inked, scale]);
  const press = useAnimatedStyle(() => ({
    transform: [{ rotate: '-7deg' }, { scale: scale.get() }],
  }));
  const stamp = (
    <Animated.View
      style={[
        {
          paddingVertical: small ? 2 : 3,
          paddingHorizontal: small ? 5 : 8,
          borderRadius: 5,
          borderWidth: small ? 1.5 : 2,
          borderStyle: inked ? 'solid' : 'dashed',
          borderColor: requestInk.certificate,
          opacity: inked ? 1 : 0.7,
        },
        press,
      ]}
    >
      <Text
        numberOfLines={1}
        style={{ ...mono(small ? 9.5 : 12, 600, 0.14), color: requestInk.certificate }}
      >
        {label}
      </Text>
    </Animated.View>
  );
  if (!onPress) return stamp;
  return (
    <PressScale
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ checked: inked }}
      hitSlop={10}
      onPress={onPress}
    >
      {stamp}
    </PressScale>
  );
}
