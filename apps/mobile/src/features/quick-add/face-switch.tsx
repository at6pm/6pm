import { useEffect } from 'react';
import { Text, View } from 'react-native';
import Animated, {
  ReduceMotion,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import { springs } from '@6pm/theme';

import { useI18n } from '../../i18n/i18n';
import { haptics } from '../../ui/haptics';
import { PressScale } from '../../ui/primitives/press-scale';
import { useTheme } from '../../ui/theme/theme';
import { body } from '../../ui/type/fonts';
import { LIFTED_SHADOW, liftedFill } from '../settings/persona-segment';

/** Quick add's two faces: a spend, or money that came in. */
export type QuickFace = 'out' | 'in';

const FACES: readonly QuickFace[] = ['out', 'in'];
const INSET = 3;
/** The header's words grow with the text size only this far. */
const TEXT_MOST = 1.6;
const slide = { ...springs.pager, reduceMotion: ReduceMotion.System };

/**
 * "Spent · Got paid" in Quick add's header, in place of its title: the lifted thumb slides to the
 * face picked on the tab spring, with a light tap. Each side is as wide as its words need, and the
 * whole at least 190 pt.
 */
export function FaceSwitch({
  face,
  onFace,
}: {
  readonly face: QuickFace;
  readonly onFace: (face: QuickFace) => void;
}) {
  const { palette } = useTheme();
  const { t } = useI18n();
  const x = useSharedValue(0);
  const width = useSharedValue(0);
  const spots = useSharedValue<readonly { x: number; width: number }[]>([]);
  const index = FACES.indexOf(face);
  useEffect(() => {
    const spot = spots.get()[index];
    if (!spot) return;
    x.set(withSpring(spot.x, slide));
    width.set(withSpring(spot.width, slide));
  }, [index, spots, width, x]);
  const thumb = useAnimatedStyle(() => ({
    width: width.get(),
    opacity: width.get() > 0 ? 1 : 0,
    transform: [{ translateX: x.get() }],
  }));

  return (
    <View
      accessibilityRole="radiogroup"
      style={{
        flexDirection: 'row',
        minWidth: 190,
        padding: INSET,
        borderRadius: 13,
        backgroundColor: palette.chipBg,
      }}
    >
      <Animated.View
        pointerEvents="none"
        style={[
          {
            position: 'absolute',
            top: INSET,
            left: 0,
            height: 32,
            borderRadius: 10,
            backgroundColor: liftedFill(palette.dark),
            boxShadow: palette.dark ? 'none' : LIFTED_SHADOW,
          },
          thumb,
        ]}
      />
      {FACES.map((f, i) => {
        const on = f === face;
        return (
          <PressScale
            key={f}
            accessibilityRole="radio"
            accessibilityState={{ checked: on }}
            onLayout={(e) => {
              const { x: at, width: w } = e.nativeEvent.layout;
              const next = [...spots.get()];
              next[i] = { x: at, width: w };
              spots.set(next);
              // The thumb is placed at once on the face showing, before any slide.
              if (on) {
                x.set(at);
                width.set(w);
              }
            }}
            onPress={() => {
              if (on) return;
              haptics.tap();
              onFace(f);
            }}
            style={{
              flexGrow: 1,
              minWidth: 92,
              height: 32,
              paddingHorizontal: 12,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text
              numberOfLines={1}
              maxFontSizeMultiplier={TEXT_MOST}
              style={{ ...body(14, 600), color: on ? palette.ink : palette.inkSoft }}
            >
              {t(f === 'out' ? 'quick.face.out' : 'quick.face.in')}
            </Text>
          </PressScale>
        );
      })}
    </View>
  );
}
