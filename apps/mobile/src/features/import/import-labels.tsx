import { useEffect, useMemo, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import Animated, {
  Easing,
  FadeInDown,
  ZoomIn,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import type { CategoryRow, ImportLabel } from '@6pm/domain';
import { curves, importInk, springs } from '@6pm/theme';

import { useI18n } from '../../i18n/i18n';
import { CategoryTile } from '../../ui/category-tile';
import { haptics } from '../../ui/haptics';
import { isSymbolName, Symbol } from '../../ui/icons/symbol';
import { PressScale } from '../../ui/primitives/press-scale';
import { useTheme } from '../../ui/theme/theme';
import { body, display } from '../../ui/type/fonts';
import { useCount } from './import-format';
import { ImportFoot, PillButton } from './import-parts';
import { choiceTiles, tileOf, type Choice, type ChoiceTile } from './label-picks';

const enter = Easing.bezier(...curves.enter);

/** The unknown wire: orange dashes marching toward the chip, 0.7 s a step. */
function Wire({ unknown }: { readonly unknown: boolean }) {
  const { palette } = useTheme();
  const reduceMotion = useReducedMotion();
  const x = useSharedValue(0);
  useEffect(() => {
    if (!unknown || reduceMotion) return;
    x.value = 0;
    x.value = withRepeat(withTiming(7, { duration: 700, easing: Easing.linear }), -1);
  }, [unknown, reduceMotion, x]);
  const style = useAnimatedStyle(() => ({ transform: [{ translateX: x.value - 7 }] }));
  if (!unknown) {
    return (
      <View
        style={{
          width: 36,
          height: 2,
          borderRadius: 2,
          backgroundColor: palette.inkSoft,
          opacity: 0.55,
        }}
      />
    );
  }
  return (
    <View style={{ width: 36, height: 2, overflow: 'hidden' }}>
      <Animated.View style={[{ flexDirection: 'row', gap: 3, width: 50 }, style]}>
        {Array.from({ length: 7 }, (_, i) => (
          <View key={i} style={{ width: 4, height: 2, backgroundColor: importInk.unknown }} />
        ))}
      </Animated.View>
    </View>
  );
}

/** The soft ring an unknown chip breathes, 1.8 s, staggered row by row. */
function Breath({ index }: { readonly index: number }) {
  const reduceMotion = useReducedMotion();
  const t = useSharedValue(0);
  useEffect(() => {
    if (reduceMotion) return;
    t.value = withDelay(
      index * 250,
      withRepeat(withTiming(1, { duration: 900, easing: Easing.inOut(Easing.ease) }), -1, true),
    );
  }, [index, reduceMotion, t]);
  const style = useAnimatedStyle(() => ({ opacity: t.value }));
  return (
    <Animated.View
      pointerEvents="none"
      style={[
        {
          position: 'absolute',
          inset: -4,
          borderRadius: 16,
          borderWidth: 4,
          borderColor: importInk.unknownRing,
        },
        style,
      ]}
    />
  );
}

function Chip({ tile, index }: { readonly tile: ChoiceTile | null; readonly index: number }) {
  const { palette } = useTheme();
  const { t } = useI18n();
  if (tile === null) {
    return (
      <View
        style={{
          width: 116,
          height: 34,
          borderRadius: 12,
          borderWidth: 1.5,
          borderStyle: 'dashed',
          borderColor: importInk.unknown,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 7,
          paddingLeft: 5,
          paddingRight: 8,
        }}
      >
        <Breath index={index} />
        <View style={{ width: 24, height: 24, alignItems: 'center', justifyContent: 'center' }}>
          <Symbol name="help" size={15} fill={1} color={importInk.unknown} />
        </View>
        <Text
          numberOfLines={1}
          style={{ ...body(12.5, 650), color: importInk.unknown, flexShrink: 1 }}
        >
          {t('import.labels.pickOne')}
        </Text>
      </View>
    );
  }
  return (
    <Animated.View
      key={tile.choice}
      entering={ZoomIn.springify().damping(springs.pop.damping).stiffness(springs.pop.stiffness)}
      style={{
        width: 116,
        height: 34,
        borderRadius: 12,
        backgroundColor: palette.chipBg,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 7,
        paddingLeft: 5,
        paddingRight: 8,
        transformOrigin: 'left',
      }}
    >
      <ChoiceGlyph tile={tile} size={24} radius={8} glyph={15} />
      <Text numberOfLines={1} style={{ ...body(12.5, 650), color: palette.ink, flexShrink: 1 }}>
        {tile.name}
      </Text>
    </Animated.View>
  );
}

function ChoiceGlyph({
  tile,
  size,
  radius,
  glyph,
  onCard = false,
}: {
  readonly tile: ChoiceTile;
  readonly size: number;
  readonly radius: number;
  readonly glyph: number;
  /** On the dark "goes in…" card, whatever the look. */
  readonly onCard?: boolean;
}) {
  const { palette } = useTheme();
  const icon = isSymbolName(tile.icon) ? tile.icon : 'category';
  if (tile.hue === null) {
    return (
      <View
        style={{
          width: size,
          height: size,
          borderRadius: radius,
          backgroundColor: onCard ? importInk.pickChip : palette.chipBg,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Symbol
          name={icon}
          size={glyph}
          fill={1}
          color={onCard ? importInk.pickInk : palette.ink}
        />
      </View>
    );
  }
  return <CategoryTile icon={icon} hue={tile.hue} size={size} radius={radius} glyph={glyph} />;
}

/** The share of labels done, as a bar that eases to its new width. */
function Progress({ done, total }: { readonly done: number; readonly total: number }) {
  const { palette } = useTheme();
  const { t } = useI18n();
  const width = useSharedValue(total === 0 ? 1 : done / total);
  useEffect(() => {
    width.value = withTiming(total === 0 ? 1 : done / total, { duration: 500, easing: enter });
  }, [done, total, width]);
  const style = useAnimatedStyle(() => ({ width: `${width.value * 100}%` }));
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 4 }}>
      <Text style={{ ...display(26, 500), color: palette.ink }}>{done}</Text>
      <Text style={{ ...body(14, 600), color: palette.inkSoft }}>
        {t('import.labels.progress', { total })}
      </Text>
      <View
        style={{
          flex: 1,
          height: 6,
          borderRadius: 6,
          backgroundColor: palette.chipBg,
          overflow: 'hidden',
        }}
      >
        <Animated.View
          style={[{ height: '100%', borderRadius: 6, backgroundColor: palette.btnBg }, style]}
        />
      </View>
    </View>
  );
}

/**
 * "Label the boxes": their category on the left, where it goes on the right. A loose wire needs a
 * pick: tap the row, pick a tile, and every line under that category goes there.
 */
export function ImportLabels({
  labels,
  choices,
  categories,
  lines,
  onChoose,
  onBringIn,
}: {
  readonly labels: readonly ImportLabel[];
  readonly choices: ReadonlyMap<string, Choice>;
  readonly categories: readonly CategoryRow[];
  /** Everything that comes in, spending and money in. */
  readonly lines: number;
  readonly onChoose: (label: string, choice: Choice) => void;
  readonly onBringIn: () => void;
}) {
  const { palette } = useTheme();
  const { t, language } = useI18n();
  const count = useCount();
  const [picking, setPicking] = useState<string | null>(null);
  const tiles = useMemo(() => choiceTiles(categories, language), [categories, language]);
  const left = labels.filter((l) => !choices.has(l.label)).length;
  const done = labels.length - left;
  return (
    <View style={{ flex: 1 }}>
      <View style={{ flex: 1, paddingTop: 4, gap: 10 }}>
        <View style={{ paddingHorizontal: 16 }}>
          <Progress done={done} total={labels.length} />
        </View>
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 12 }}
          showsVerticalScrollIndicator={false}
        >
          <View
            style={{
              borderRadius: 24,
              backgroundColor: palette.cell,
              boxShadow: palette.cardShadow,
              overflow: 'hidden',
            }}
          >
            {labels.map((label, i) => {
              const choice = choices.get(label.label) ?? null;
              const on = picking === label.label;
              const tile = choice ? tileOf(choice, categories, language) : null;
              return (
                <PressScale
                  key={label.label}
                  accessibilityRole="button"
                  accessibilityLabel={t('import.labels.row', {
                    name: label.label,
                    lines: t('import.box.count', { count: label.count, n: count(label.count) }),
                    target: tile?.name ?? t('import.labels.pickOne'),
                  })}
                  accessibilityState={{ expanded: on }}
                  scaleTo={0.99}
                  onPress={() => {
                    haptics.tick();
                    setPicking(on ? null : label.label);
                  }}
                  style={{
                    paddingHorizontal: 12,
                    backgroundColor: on
                      ? importInk.unknownPicking
                      : choice
                        ? 'transparent'
                        : importInk.unknownRow,
                  }}
                >
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 8,
                      paddingVertical: 9,
                      borderTopWidth: i === 0 ? 0 : 0.5,
                      borderTopColor: palette.hair,
                    }}
                  >
                    <View style={{ flex: 1, minWidth: 0, gap: 1 }}>
                      <Text numberOfLines={1} style={{ ...body(14.5, 600), color: palette.ink }}>
                        {label.label}
                      </Text>
                      <Text style={{ ...body(11.5), color: palette.inkSoft, opacity: 0.82 }}>
                        {t('import.box.count', { count: label.count, n: count(label.count) })}
                      </Text>
                    </View>
                    <Wire unknown={choice === null} />
                    <Chip tile={tile} index={i} />
                  </View>
                </PressScale>
              );
            })}
          </View>
        </ScrollView>
        {picking !== null ? (
          <Animated.View
            entering={FadeInDown.duration(250).withInitialValues({
              transform: [{ translateY: 14 }],
            })}
            style={{
              marginHorizontal: 16,
              borderRadius: 22,
              backgroundColor: importInk.pickCard,
              padding: 12,
              gap: 10,
            }}
          >
            <Text style={{ ...body(13, 600), color: importInk.pickInk, opacity: 0.8 }}>
              {t('import.labels.goesIn', { name: picking })}
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', rowGap: 6 }}>
              {tiles.map((tile) => (
                <PressScale
                  key={tile.choice}
                  accessibilityRole="button"
                  accessibilityLabel={tile.name}
                  scaleTo={0.92}
                  onPress={() => {
                    haptics.tap();
                    onChoose(picking, tile.choice);
                    setPicking(null);
                  }}
                  style={{ width: '25%', alignItems: 'center', gap: 4, paddingVertical: 4 }}
                >
                  <ChoiceGlyph tile={tile} size={40} radius={13} glyph={21} onCard />
                  <Text
                    numberOfLines={1}
                    style={{ ...body(10.5, 600), color: importInk.pickInk, maxWidth: '96%' }}
                  >
                    {tile.name}
                  </Text>
                </PressScale>
              ))}
            </View>
          </Animated.View>
        ) : null}
      </View>
      <ImportFoot>
        <PillButton
          enabled={left === 0}
          label={
            left > 0
              ? t('import.labels.more', { n: left })
              : t('import.labels.bringIn', { n: count(lines) })
          }
          onPress={onBringIn}
        />
      </ImportFoot>
    </View>
  );
}
