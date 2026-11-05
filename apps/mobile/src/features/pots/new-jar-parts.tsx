import { useEffect, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import Animated, {
  Easing,
  FadeIn,
  FadeOut,
  ReduceMotion,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import type { JarPreset } from '@6pm/domain';
import { curves } from '@6pm/theme';

import { useI18n } from '../../i18n/i18n';
import { CategoryTile } from '../../ui/category-tile';
import { haptics } from '../../ui/haptics';
import { isSymbolName, Symbol } from '../../ui/icons/symbol';
import type { SymbolName } from '../../ui/icons/symbols.generated';
import { PressScale } from '../../ui/primitives/press-scale';
import { useTheme } from '../../ui/theme/theme';
import { body } from '../../ui/type/fonts';
import { Jar } from './jar';

const landEase = Easing.bezier(...curves.jarIn);
const slideEase = Easing.bezier(...curves.house);
/** A preset tile at rest: a faint wash over the sheet. */
const TILE_REST = 'rgba(255,255,255,0.05)';

/** The preset tiles: tapping one re-tints the jar and swaps the name and target. */
export function PresetTiles({
  presets,
  selected,
  nameOf,
  onPick,
}: {
  readonly presets: readonly JarPreset[];
  readonly selected: JarPreset['id'] | null;
  readonly nameOf: (p: JarPreset) => string;
  readonly onPick: (p: JarPreset) => void;
}) {
  const { palette } = useTheme();
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={{ marginHorizontal: -16, flexGrow: 0 }}
      contentContainerStyle={{ gap: 8, paddingHorizontal: 16, paddingVertical: 4 }}
    >
      {presets.map((p) => {
        const on = p.id === selected;
        return (
          <PressScale
            key={p.id}
            accessibilityRole="button"
            accessibilityState={{ selected: on }}
            scaleTo={0.94}
            onPress={() => {
              haptics.tick();
              onPick(p);
            }}
            style={{
              minWidth: 76,
              minHeight: 86,
              paddingHorizontal: 8,
              paddingVertical: 10,
              borderRadius: 20,
              backgroundColor: on ? palette.tabActive : TILE_REST,
              boxShadow: on ? `inset 0 0 0 1.5px ${palette.ink}` : undefined,
              alignItems: 'center',
              justifyContent: 'center',
              gap: 7,
            }}
          >
            {isSymbolName(p.icon) ? <CategoryTile icon={p.icon} hue={p.hue} /> : null}
            <Text style={{ ...body(12, 650), color: palette.ink, textAlign: 'center' }}>
              {nameOf(p)}
            </Text>
          </PressScale>
        );
      })}
    </ScrollView>
  );
}

/**
 * New jar's jar: it drops in with jarIn when the sheet opens, and a new preset re-tints it over
 * 300 ms (the old colour fades out over the new).
 */
export function DraftJar({
  hue,
  icon,
  futureYou,
  level,
}: {
  readonly hue: number;
  readonly icon: string;
  readonly futureYou: boolean;
  readonly level: number;
}) {
  const { palette } = useTheme();
  const land = useSharedValue(0);
  useEffect(() => {
    land.value = withSequence(
      withTiming(0.6, { duration: 330, easing: landEase, reduceMotion: ReduceMotion.System }),
      withTiming(1, { duration: 220, easing: landEase, reduceMotion: ReduceMotion.System }),
    );
  }, [land]);
  const style = useAnimatedStyle(() => {
    const v = land.value;
    const a = v < 0.6 ? v / 0.6 : (v - 0.6) / 0.4;
    return v < 0.6
      ? { opacity: a, transform: [{ translateY: -30 + 34 * a }, { scale: 0.6 + 0.44 * a }] }
      : { opacity: 1, transform: [{ translateY: 4 - 4 * a }, { scale: 1.04 - 0.04 * a }] };
  });
  return (
    <Animated.View style={[{ width: 84, height: 110 }, style]}>
      <Animated.View
        key={`${hue}:${icon}`}
        entering={FadeIn.duration(300)}
        exiting={FadeOut.duration(300)}
        style={{ position: 'absolute', top: 0, left: 0 }}
      >
        <Jar
          width={84}
          height={110}
          hue={hue}
          icon={icon}
          futureYou={futureYou}
          level={level}
          minFill={0}
          ringColor={palette.sheetSolid}
        />
      </Animated.View>
    </Animated.View>
  );
}

/**
 * The palette on the big jar's corner that opens its icons and colours (a check while they are
 * open): a solid chip, the sheet's raised surface under the chip tint so the glass never shows
 * through, ringed in the sheet's colour so it sits on the jar; it sinks under the finger.
 */
export function LookBadge({
  open,
  onPress,
}: {
  readonly open: boolean;
  readonly onPress: () => void;
}) {
  const { palette } = useTheme();
  const { t } = useI18n();
  return (
    <PressScale
      accessibilityRole="button"
      accessibilityLabel={t('pots.new.look')}
      accessibilityState={{ expanded: open }}
      scaleTo={0.88}
      hitSlop={8}
      onPress={onPress}
      style={{
        position: 'absolute',
        right: -6,
        bottom: -2,
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: palette.cell,
        boxShadow: `0 0 0 2px ${palette.sheetSolid}`,
        overflow: 'hidden',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <View
        style={{
          position: 'absolute',
          inset: 0,
          backgroundColor: open ? palette.btnBg : palette.chipBg,
        }}
      />
      <Symbol
        name={open ? 'check' : 'palette'}
        size={16}
        color={open ? palette.btnFg : palette.ink}
      />
    </PressScale>
  );
}

/**
 * "By a date" | "Each payday", the light sliding under the one chosen. Add on a jar's page uses it
 * too, for where the money comes from.
 */
export function FillSegment({
  options,
  selected,
  onSelect,
}: {
  readonly options: readonly {
    readonly id: string;
    readonly icon: SymbolName;
    readonly label: string;
  }[];
  readonly selected: string;
  readonly onSelect: (id: string) => void;
}) {
  const { palette } = useTheme();
  const [width, setWidth] = useState(0);
  const index = Math.max(
    0,
    options.findIndex((o) => o.id === selected),
  );
  const x = useSharedValue(index);
  useEffect(() => {
    x.value = withTiming(index, {
      duration: 250,
      easing: slideEase,
      reduceMotion: ReduceMotion.System,
    });
  }, [index, x]);
  const part = (width - 6) / Math.max(1, options.length);
  const light = useAnimatedStyle(() => ({ transform: [{ translateX: x.value * part }] }));
  return (
    <View
      onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
      style={{
        flexDirection: 'row',
        padding: 3,
        borderRadius: 14,
        backgroundColor: palette.chipBg,
      }}
    >
      {width > 0 ? (
        <Animated.View
          style={[
            {
              position: 'absolute',
              left: 3,
              top: 3,
              bottom: 3,
              width: part,
              borderRadius: 11,
              backgroundColor: 'rgba(255,255,255,0.16)',
            },
            light,
          ]}
        />
      ) : null}
      {options.map((o) => (
        <PressScale
          key={o.id}
          accessibilityRole="button"
          accessibilityState={{ selected: o.id === selected }}
          onPress={() => {
            haptics.tick();
            onSelect(o.id);
          }}
          style={{
            flex: 1,
            minHeight: 40,
            paddingVertical: 6,
            paddingHorizontal: 6,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
          }}
        >
          <Symbol name={o.icon} size={18} color={palette.ink} />
          <Text
            style={{ ...body(14.5, 650), color: palette.ink, flexShrink: 1, textAlign: 'center' }}
          >
            {o.label}
          </Text>
        </PressScale>
      ))}
    </View>
  );
}
