import { useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState, type ComponentRef } from 'react';
import { ScrollView, Text, View, type ScrollViewInstance } from 'react-native';
import Animated, {
  Easing,
  ReduceMotion,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { hasPayday } from '@6pm/domain';
import { curves, durations } from '@6pm/theme';

import { useMoney } from '../../data/money-provider';
import { useI18n } from '../../i18n/i18n';
import { useMoneyFormat } from '../../money/use-money-format';
import { haptics } from '../../ui/haptics';
import { balanceTwoLines } from '../../ui/type/balanced-text';
import { wordsToMeasure } from '../../ui/type/word-fit';
import { PressScale } from '../../ui/primitives/press-scale';
import { useTheme } from '../../ui/theme/theme';
import { body, tabular } from '../../ui/type/fonts';
import { HEADING_BREAKS, headingWords, useWordFit } from '../../ui/type/word-fit-text';
import { sharedPotRoute } from '../together/shared-jar';
import { Jar } from './jar';
import { alpha } from './jar-colours';
import { flyFrom, takeLanding, useJarAwayStyle } from './jar-flight';
import { NewJarItem } from './jar-outline';
import { potRoute, potsRoute } from './pot-routes';
import { useJars, type ShelfJar } from './use-jars';

const CELL = 66;
const GAP = 6;
const JAR_W = 52;
const JAR_H = 66;
const landEase = Easing.bezier(...curves.jarIn);
/** A jar's name under it, and what it holds. */
const NAME = body(12, 650);
/**
 * A name takes up to two lines, 64 pt wide, balanced; still too long, it steps down to 11 pt,
 * and only then ends in "…". Every jar on the shelf keeps the tallest name's room, so the amounts
 * under them line up.
 */
const NAME_WIDTH = 64;
const NAME_LINE = 15;
const NAME_SMALLEST = 11 / 12;
/**
 * A name of one long word (Weihnachten) keeps to one line, and a long word among others
 * ("Wochenende am Meer") to its own: either shrinks this far rather than be cut in two.
 */
const WORD_SMALLEST = 9 / 12;
const HELD = { ...body(11), ...tabular };

/**
 * The jar shelf on Today, under tonight's card (Pots canvas, A1): "Pots" and what goes into jars
 * each payday, then one row of small jars, Future you first, one's own, then the shared ones, and
 * New jar at the end, an empty jar at their size. It never collapses; past five jars it scrolls and snaps. Tap a jar and
 * it grows into its page.
 */
export function JarShelf() {
  const { palette } = useTheme();
  const { t } = useI18n();
  const money = useMoneyFormat();
  const router = useRouter();
  const jars = useJars();
  const scroll = useRef<ScrollViewInstance>(null);
  const plan = useMoney().plan;
  const [nameLines, setNameLines] = useState(1);

  if (plan === null) return null;

  return (
    <View style={{ gap: 10 }}>
      <PressScale
        accessibilityRole="button"
        scaleTo={0.98}
        onPress={() => {
          haptics.tap();
          router.push(potsRoute);
        }}
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'baseline',
          paddingHorizontal: 6,
        }}
      >
        <Text {...HEADING_BREAKS} style={{ ...body(20, 700, -0.02), color: palette.ink }}>
          {headingWords(t('pots.shelf.title'))}
        </Text>
        <Text style={{ ...body(14, 500), ...tabular, color: palette.inkSoft }}>
          {t(hasPayday(plan) ? 'pots.shelf.each' : 'pots.shelf.eachMonth', {
            amount: money.short(jars.eachPayday),
          })}
        </Text>
      </PressScale>
      <ScrollView
        ref={scroll}
        horizontal
        scrollsToTop={false}
        showsHorizontalScrollIndicator={false}
        snapToInterval={CELL + GAP}
        decelerationRate="fast"
        // A jar New jar just started drops in from above the row's top.
        style={{ marginHorizontal: -16, flexGrow: 0, overflow: 'visible' }}
        contentContainerStyle={{
          gap: GAP,
          paddingHorizontal: 16,
          paddingTop: 14,
          paddingBottom: 2,
        }}
      >
        {jars.all.map((jar) => (
          <ShelfCell
            key={`${jar.kind}:${jar.id}`}
            jar={jar}
            nameLines={nameLines}
            onNameLines={(lines) => setNameLines((most) => Math.max(most, lines))}
            onLanded={() => scroll.current?.scrollToEnd({ animated: true })}
          />
        ))}
        <NewJarItem
          locked={jars.locked}
          jarWidth={JAR_W}
          jarHeight={JAR_H}
          width={CELL}
          gap={7}
          label={NAME}
          under={HELD}
        />
      </ScrollView>
    </View>
  );
}

function ShelfCell({
  jar,
  nameLines,
  onNameLines,
  onLanded,
}: {
  readonly jar: ShelfJar;
  /** The most lines any name on the shelf takes: each name keeps that much room. */
  readonly nameLines: number;
  readonly onNameLines: (lines: number) => void;
  readonly onLanded: () => void;
}) {
  const [twoLines, setTwoLines] = useState(false);
  const { palette } = useTheme();
  const home = useMoneyFormat();
  const router = useRouter();
  const jarView = useRef<ComponentRef<typeof View>>(null);
  const onOpen = useCallback(() => {
    haptics.tap();
    if (jar.kind === 'shared') {
      router.push(sharedPotRoute(jar.id));
      return;
    }
    flyFrom(jar.id, jarView.current, () => router.push(potRoute(jar.id)));
  }, [jar.kind, jar.id, router]);
  const money = jar.kind === 'shared' ? jar.money : home;
  const awayStyle = useJarAwayStyle(jar.id);

  // A jar New jar just started drops in after the sheet has gone, with the jarIn curve.
  const [landing] = useState(() => takeLanding());
  const land = useSharedValue(landing ? 0 : 1);
  useEffect(() => {
    if (!landing) return;
    onLanded();
    const half = durations.jarFill * 0.6;
    land.value = withDelay(
      durations.screen,
      withSequence(
        withTiming(0.6, { duration: half, easing: landEase, reduceMotion: ReduceMotion.System }),
        withTiming(1, {
          duration: durations.jarFill - half,
          easing: landEase,
          reduceMotion: ReduceMotion.System,
        }),
      ),
    );
    const buzz = setTimeout(haptics.success, durations.screen + half);
    return () => clearTimeout(buzz);
  }, [landing, land, onLanded]);
  const landStyle = useAnimatedStyle(() => {
    const v = land.value;
    if (v >= 1) return { opacity: 1, transform: [{ translateY: 0 }, { scale: 1 }] };
    const a = v < 0.6 ? v / 0.6 : (v - 0.6) / 0.4;
    return v < 0.6
      ? { opacity: a, transform: [{ translateY: -30 + 34 * a }, { scale: 0.6 + 0.44 * a }] }
      : { opacity: 1, transform: [{ translateY: 4 - 4 * a }, { scale: 1.04 - 0.04 * a }] };
  });

  const own = jar.kind === 'own' ? jar : null;
  // One word with nowhere to break: a second line would cut it in two, so it shrinks to its line.
  const oneWord = wordsToMeasure(jar.name) === jar.name;
  // A word too wide for the cell's line shrinks the name until it fits (`useWordFit`), with a
  // little room to spare: the system face tracks wider as it gets smaller.
  const fit = useWordFit(
    jar.name,
    { ...NAME, lineHeight: NAME_LINE, color: palette.ink, textAlign: 'center' },
    WORD_SMALLEST,
    undefined,
    NAME_WIDTH - 4,
  );
  return (
    <Animated.View style={[{ width: CELL, alignItems: 'center', gap: 7 }, landStyle]}>
      <PressScale
        accessibilityRole="button"
        accessibilityLabel={`${jar.name}, ${money.spoken(jar.saved)}`}
        onPress={onOpen}
        style={{ width: CELL, alignItems: 'center', gap: 7 }}
      >
        <View ref={jarView} collapsable={false} style={{ width: JAR_W, height: JAR_H }}>
          <Animated.View style={awayStyle}>
            <Jar
              width={JAR_W}
              height={JAR_H}
              hue={jar.pot.hue}
              icon={jar.pot.icon}
              futureYou={own?.futureYou ?? false}
              level={jar.level}
              state={own?.state ?? 'normal'}
              partner={
                jar.kind === 'shared'
                  ? { initial: jar.partnerInitial, level: jar.partnerLevel }
                  : null
              }
              ringColor={palette.sheet}
            />
          </Animated.View>
        </View>
        <View style={{ alignItems: 'center', width: '100%' }}>
          <View style={{ width: NAME_WIDTH, minHeight: nameLines * NAME_LINE }}>
            <Text
              numberOfLines={oneWord ? 1 : 2}
              adjustsFontSizeToFit
              minimumFontScale={oneWord ? WORD_SMALLEST : NAME_SMALLEST}
              onTextLayout={(e) => {
                const lines = Math.min(2, e.nativeEvent.lines.length);
                if (lines === 2 && !twoLines) setTwoLines(true);
                onNameLines(lines);
              }}
              style={fit.style}
            >
              {twoLines ? balanceTwoLines(jar.name) : jar.name}
            </Text>
            {oneWord ? null : fit.probe}
          </View>
          <Text style={{ ...HELD, color: alpha(palette.ink, 0.62) }}>{money.short(jar.saved)}</Text>
        </View>
      </PressScale>
    </Animated.View>
  );
}
