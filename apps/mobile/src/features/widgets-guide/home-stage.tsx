import { useState } from 'react';
import { Text, View } from 'react-native';
import Animated, {
  Easing,
  FadeOut,
  Keyframe,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { curves, durations } from '@6pm/theme';

import { useI18n } from '../../i18n/i18n';
import { haptics } from '../../ui/haptics';
import { PressScale } from '../../ui/primitives/press-scale';
import { useTheme } from '../../ui/theme/theme';
import { body } from '../../ui/type/fonts';
import { HomeWidget, WIDGET_SIZE } from './home-widgets';
import type { WidgetPreview } from './preview-data';
import { Stage } from './stage';

/** The guide's choices: the three sizes, and the second large widget, My month. */
type Pick = 'small' | 'medium' | 'large' | 'month';
const SIZES: readonly Pick[] = ['small', 'medium', 'large', 'month'];
const LABEL = {
  small: 'widgetsGuide.home.small',
  medium: 'widgetsGuide.home.medium',
  large: 'widgetsGuide.home.large',
  month: 'widgetsGuide.home.month',
} as const;
const WHAT = {
  small: 'widgetsGuide.home.smallWhat',
  medium: 'widgetsGuide.home.mediumWhat',
  large: 'widgetsGuide.home.largeWhat',
  month: 'widgetsGuide.home.monthWhat',
} as const;
/** The Home Screen drawn tall enough for the large widget; the others share it with apps. */
const HEIGHT = 418;
const PAD = 24;
const SIDE = (402 - WIDGET_SIZE.medium.width) / 2;

/** A widget lands as one does on the Home Screen: up from a little smaller, on the house curve. */
const landing = new Keyframe({
  0: { opacity: 0, transform: [{ scale: 0.88 }] },
  100: { opacity: 1, transform: [{ scale: 1 }], easing: Easing.bezier(...curves.house) },
}).duration(durations.sheet);
const leaving = FadeOut.duration(140);

/** The Home Screen, with the size picked above it in place among the apps. */
export function HomeStage({
  preview,
  width,
}: {
  readonly preview: WidgetPreview;
  readonly width: number;
}) {
  const { t } = useI18n();
  const { palette } = useTheme();
  const [size, setSize] = useState<Pick>('medium');
  const still = useSharedValue(0.5);
  return (
    <View style={{ gap: 12 }}>
      <SizePicker size={size} onSize={setSize} />
      <Stage t={still} width={width} height={HEIGHT}>
        <Animated.View
          key={size}
          entering={landing}
          exiting={leaving}
          style={{ position: 'absolute', inset: 0, paddingTop: PAD, paddingHorizontal: SIDE }}
        >
          <Layout size={size} preview={preview} />
        </Animated.View>
      </Stage>
      <Animated.Text
        key={`what-${size}`}
        entering={landing}
        style={{ ...body(14, 500), color: palette.inkSoft, textAlign: 'center' }}
      >
        {t(WHAT[size])}
      </Animated.Text>
    </View>
  );
}

/** Where the widget sits among the apps: as iOS lays out each size on the grid. */
function Layout({ size, preview }: { readonly size: Pick; readonly preview: WidgetPreview }) {
  if (size === 'large') return <HomeWidget size="large" preview={preview} />;
  if (size === 'month') return <HomeWidget size="large" kind="month" preview={preview} />;
  return (
    <View style={{ gap: 28 }}>
      {size === 'small' ? (
        <>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <HomeWidget size="small" preview={preview} />
            <HomeWidget size="small" kind="jar" preview={preview} />
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <HomeWidget size="small" kind="streak" preview={preview} />
            <HomeWidget size="small" kind="week" preview={preview} />
          </View>
        </>
      ) : (
        <>
          <HomeWidget size="medium" preview={preview} />
          <HomeWidget size="medium" kind="receipt" preview={preview} />
        </>
      )}
    </View>
  );
}

/** Small · Medium · Large · My month, with a thumb that slides to the one picked. */
function SizePicker({
  size,
  onSize,
}: {
  readonly size: Pick;
  readonly onSize: (size: Pick) => void;
}) {
  const { t } = useI18n();
  const { palette } = useTheme();
  const [segment, setSegment] = useState(0);
  const at = useSharedValue(SIZES.indexOf(size));
  const thumb = useAnimatedStyle(() => ({
    width: segment,
    transform: [{ translateX: at.get() * segment }],
  }));
  return (
    <View
      accessibilityRole="tablist"
      onLayout={(e) => setSegment((e.nativeEvent.layout.width - 6) / SIZES.length)}
      style={{
        flexDirection: 'row',
        padding: 3,
        borderRadius: 99,
        backgroundColor: palette.chipBg,
        alignSelf: 'stretch',
      }}
    >
      <Animated.View
        style={[
          {
            position: 'absolute',
            top: 3,
            bottom: 3,
            left: 3,
            borderRadius: 99,
            backgroundColor: palette.btnBg,
          },
          thumb,
        ]}
      />
      {SIZES.map((s, k) => (
        <PressScale
          key={s}
          accessibilityRole="tab"
          accessibilityState={{ selected: s === size }}
          scaleTo={0.96}
          onPress={() => {
            if (s === size) return;
            haptics.tick();
            at.set(
              withTiming(k, { duration: durations.snap, easing: Easing.bezier(...curves.house) }),
            );
            onSize(s);
          }}
          style={{ flex: 1, height: 34, alignItems: 'center', justifyContent: 'center' }}
        >
          <Text
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.8}
            style={{ ...body(14, 650), color: s === size ? palette.btnFg : palette.ink }}
          >
            {t(LABEL[s])}
          </Text>
        </PressScale>
      ))}
    </View>
  );
}
