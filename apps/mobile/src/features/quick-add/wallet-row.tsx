import { useEffect, useRef } from 'react';
import { ScrollView, Text, View, type ScrollViewInstance } from 'react-native';
import Animated, {
  Easing,
  ReduceMotion,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { isFutureYouPot, type PotRow } from '@6pm/domain';
import { curves } from '@6pm/theme';

import { useI18n } from '../../i18n/i18n';
import { useMoneyFormat } from '../../money/use-money-format';
import { haptics } from '../../ui/haptics';
import { PressScale } from '../../ui/primitives/press-scale';
import { useTheme } from '../../ui/theme/theme';
import { body, tabular } from '../../ui/type/fonts';
import { MiniJar } from '../details/from-jar-row';
import { alpha } from '../pots/jar-colours';
import { JarGlyph } from '../pots/jar-outline';
import { jarName } from '../pots/jar-name';

const REVEAL_MS = 250;
/** The row's room above it: the body's gap, which the row takes only while open. */
const ROW_GAP = 14;
const reveal = Easing.bezier(...curves.enter);

/**
 * The jars a spend can come from, one tidy row: it opens (height and fade, 250 ms, the sheet
 * following) while "From a jar" in the header is on, each jar with what it holds, and the spend
 * comes out of the one picked. Off, it closes and the spend counts today as usual.
 */
export function FromRow({
  jars,
  saved,
  value,
  onChange,
}: {
  readonly jars: readonly PotRow[];
  readonly saved: Readonly<Record<string, number>>;
  /** The jar picked, or null for today. */
  readonly value: string | null;
  readonly onChange: (jarId: string | null) => void;
}) {
  const { palette } = useTheme();
  const { t } = useI18n();
  const money = useMoneyFormat();
  const scroll = useRef<ScrollViewInstance>(null);
  // A jar already picked as the sheet opens (a jar's "Spend from it") is scrolled into view, once.
  const shown = useRef(false);
  const on = value !== null;

  const open = useSharedValue(on ? 1 : 0);
  const height = useSharedValue(0);
  useEffect(() => {
    open.value = withTiming(on ? 1 : 0, {
      duration: REVEAL_MS,
      easing: reveal,
      reduceMotion: ReduceMotion.System,
    });
  }, [on, open]);
  const revealStyle = useAnimatedStyle(() => ({
    height: (height.value + ROW_GAP) * open.value,
    opacity: open.value,
  }));

  if (jars.length === 0) return null;

  const pick = (jarId: string) => {
    if (jarId === value) return;
    haptics.tick();
    onChange(jarId);
  };
  const chip = (lit: boolean) => ({
    height: 40,
    borderRadius: 12,
    backgroundColor: lit ? palette.btnBg : palette.chipBg,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 6,
  });

  return (
    <View style={{ marginTop: -14 }}>
      <Animated.View
        pointerEvents={on ? 'auto' : 'none'}
        accessibilityElementsHidden={!on}
        // Edge to edge, as the jars scroll past the sheet's sides.
        style={[{ overflow: 'hidden', marginHorizontal: -16 }, revealStyle]}
      >
        <View
          onLayout={(e) => {
            height.value = e.nativeEvent.layout.height;
          }}
          style={{ position: 'absolute', top: ROW_GAP, left: 0, right: 0 }}
        >
          <ScrollView
            ref={scroll}
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{ flexGrow: 0 }}
            contentContainerStyle={{ gap: 6, paddingHorizontal: 16 }}
          >
            {jars.map((jar) => {
              const lit = jar.id === value;
              return (
                <PressScale
                  key={jar.id}
                  accessibilityRole="button"
                  accessibilityLabel={`${jarName(jar, t)}, ${money.spoken(saved[jar.id] ?? 0)}`}
                  accessibilityState={{ selected: lit }}
                  onPress={() => pick(jar.id)}
                  onLayout={(e) => {
                    if (!lit || shown.current) return;
                    shown.current = true;
                    const { x, width } = e.nativeEvent.layout;
                    scroll.current?.scrollTo({ x: Math.max(0, x + width - 300), animated: false });
                  }}
                  style={{ ...chip(lit), paddingLeft: 7, paddingRight: 10 }}
                >
                  <MiniJar jar={jar} saved={saved[jar.id] ?? 0} width={16} height={21} />
                  <Text
                    numberOfLines={1}
                    style={{ ...body(13, 650), color: lit ? palette.btnFg : palette.ink }}
                  >
                    {jarName(jar, t)}
                  </Text>
                  <Text
                    numberOfLines={1}
                    style={{
                      ...body(12, 500),
                      ...tabular,
                      color: alpha(lit ? palette.btnFg : palette.ink, 0.62),
                    }}
                  >
                    {money.short(saved[jar.id] ?? 0)}
                  </Text>
                </PressScale>
              );
            })}
          </ScrollView>
        </View>
      </Animated.View>
    </View>
  );
}

/** The jar to take a spend from when "From a jar" is turned on: the first that holds it all. */
export function firstJarFor(
  jars: readonly PotRow[],
  saved: Readonly<Record<string, number>>,
  amount: number,
): string | null {
  return (
    jars.find((j) => (saved[j.id] ?? 0) >= amount && !isFutureYouPot(j))?.id ?? jars[0]?.id ?? null
  );
}

/**
 * "From a jar" in Quick add's header: a jar glyph in a round control, quiet when off, filled when
 * on. A light tap turns it; what it does is the caller's.
 */
export function FromJarSwitch({
  on,
  onToggle,
}: {
  readonly on: boolean;
  readonly onToggle: () => void;
}) {
  const { palette } = useTheme();
  const { t } = useI18n();
  return (
    <PressScale
      accessibilityRole="switch"
      accessibilityLabel={t('potsClose.fromJar')}
      accessibilityState={{ checked: on }}
      hitSlop={8}
      onPress={() => {
        haptics.tap();
        onToggle();
      }}
      style={{
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: on ? palette.btnBg : palette.chipBg,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <JarGlyph size={17} color={on ? palette.btnFg : palette.ink} full={on} />
    </PressScale>
  );
}
