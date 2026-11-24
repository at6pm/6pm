import { useEffect, useMemo, useRef, type ReactNode } from 'react';
import { Text, View } from 'react-native';
import Animated, {
  Easing,
  FadeIn,
  ReduceMotion,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { curves } from '@6pm/theme';
import type { ShareInks } from '@6pm/theme';

import { Companion } from '../../../ui/companion/companion';
import type { CompanionMood } from '../../../ui/companion/companion-mood';
import { PressScale } from '../../../ui/primitives/press-scale';
import { WordFitText } from '../../../ui/type/word-fit-text';
import { CardArt } from './card-art';
import { CardGround, CardSign, kicker, ON_CARD, title } from './card-parts';
import { CARD_WIDTH, cardHeight, type ArtBox, type CardFormat } from './card-size';

/** The headline's lines are set this tall: room for Vietnamese marks stacked over a capital. */
const HEADLINE_LEADING = 1.04;
/** A shown amount fades in as the canvas's entrance, 300 ms; a hidden one fades out faster. */
const SHOW = {
  duration: 300,
  easing: Easing.bezier(...curves.enter),
  reduceMotion: ReduceMotion.System,
};
const HIDE = { duration: 160, reduceMotion: ReduceMotion.System };
/** How long a headline switched by a tap takes to settle: a capture waits for it. */
export const HEADLINE_SETTLE_MS = 280;
/** The column inside the card's 24 pt sides. */
const COLUMN = CARD_WIDTH - 48;

/**
 * How many lines a heading or line holds: exactly as many as it marks with breaks (Japanese and
 * Chinese mark their phrases, so a phrase is never split, and the type shrinks to keep each one
 * on its line), otherwise up to `most`.
 */
export function linesOf(text: string, most: number): number {
  return text.includes('\n') ? text.split('\n').length : most;
}

/** The companion's size: about two fifths of a story's height, a third of the feed crop's. */
export function heroSize(format: CardFormat): number {
  return format === 'story' ? 224 : 150;
}

/**
 * The band of suns under the headline, one per thing counted (a visit, an evening): at most three
 * rows and a quarter of the card, so the companion keeps the middle. Thirty evenings are three
 * rows of ten; a hundred, three rows of small ones.
 */
export function SunBand({
  inks,
  count,
  format,
}: {
  readonly inks: ShareInks;
  readonly count: number;
  readonly format: CardFormat;
}) {
  const story = format === 'story';
  const n = Math.max(1, Math.min(count, 100));
  const rows = Math.min(3, Math.ceil(n / 10));
  const cols = Math.ceil(n / rows);
  const ratio = 0.42;
  const cell = Math.min(
    COLUMN / (cols + (cols - 1) * ratio),
    (story ? 86 : 52) / (rows + (rows - 1) * ratio),
    story ? 24 : 16,
  );
  const gap = cell * ratio;
  const w = cols * cell + (cols - 1) * gap;
  const h = rows * cell + (rows - 1) * gap;
  // The canvas reaches a gap past the band on every side, so the suns' glow is never cut off.
  const m = gap;
  const boxes = useMemo((): ArtBox[] => {
    const s = inks.sun;
    return Array.from({ length: n }, (_, i) => ({
      l: m + (i % cols) * (cell + gap),
      t: m + Math.floor(i / cols) * (cell + gap),
      w: cell,
      h: cell,
      r: s.radius,
      bg: s.full,
      sh: s.lit,
    }));
  }, [inks, n, cols, cell, gap, m]);
  return (
    <View style={{ width: w, height: h }}>
      <CardArt
        boxes={boxes}
        width={w + m * 2}
        height={h + m * 2}
        style={{ position: 'absolute', top: -m, marginHorizontal: -m }}
      />
    </View>
  );
}

/** A line under the headline that fades in and out where it stands: nothing moves around it. */
function FadingLine({
  text,
  shown,
  inks,
}: {
  readonly text: string;
  readonly shown: boolean;
  readonly inks: ShareInks;
}) {
  const on = useSharedValue(shown ? 1 : 0);
  useEffect(() => {
    on.set(withTiming(shown ? 1 : 0, shown ? SHOW : HIDE));
  }, [on, shown]);
  const style = useAnimatedStyle(() => ({ opacity: on.get() }));
  return (
    <Animated.Text
      {...ON_CARD}
      numberOfLines={1}
      accessibilityElementsHidden={!shown}
      style={[{ ...kicker(inks, 13, 0.04, 600), lineHeight: 18, color: inks.ink }, style]}
    >
      {text}
    </Animated.Text>
  );
}

export interface HeroCardProps {
  readonly inks: ShareInks;
  readonly format: CardFormat;
  readonly serious: boolean;
  /** Drawn at rest: the layer fading out as the format changes plays no entrance. */
  readonly still: boolean;
  readonly kicker: string;
  readonly headline: string;
  /**
   * The headline's block is this many lines tall whatever it says, so switching it by a tap moves
   * nothing below; absent, it is as tall as its words.
   */
  readonly headlineLines?: number;
  /** A tap on the headline (the habit's shop or category). */
  readonly onHeadline?: () => void;
  readonly headlineHint?: string;
  /** A line under the headline shown only when `shown` (an amount behind Show amounts). */
  readonly sub?: { readonly text: string; readonly shown: boolean };
  /** A compact band under the headline (the suns). */
  readonly band?: ReactNode;
  /**
   * What stands beside the companion (the full jar), drawn for the given height. In serious mode
   * it stands alone under the headline.
   */
  readonly beside?: (height: number) => ReactNode;
  /** The companion's line; null in serious mode. */
  readonly line: string | null;
  readonly mood: CompanionMood;
}

/**
 * The hero cards' layout, for a story and its feed crop: what the person got as the headline, an
 * amount only where they chose to show it, a compact band of what was counted, then the companion
 * large in the middle with its line set as big as the headline, and the small at6pm.app mark.
 * Serious mode drops the companion and its line, sets the headline larger and centres the rest.
 */
export function HeroCard(props: HeroCardProps) {
  const { inks, format, serious, still, headline } = props;
  const story = format === 'story';
  const companion = props.line !== null && !serious;
  const base = story ? inks.titleSize : inks.titleSize * 0.82;
  const size = companion ? base : base * (story ? 1.3 : 1.15);
  const lines = props.headlineLines;
  const style = {
    ...title(inks, size, HEADLINE_LEADING),
    ...(lines === undefined ? {} : { height: size * HEADLINE_LEADING * lines }),
  };
  // A headline switched by a tap fades in; the first one is simply there.
  const first = useRef(headline);
  const fresh = !still && headline !== first.current;
  const words = (
    <Animated.View
      key={headline}
      {...(fresh ? { entering: FadeIn.duration(HEADLINE_SETTLE_MS) } : {})}
    >
      <WordFitText
        {...ON_CARD}
        numberOfLines={lines ?? linesOf(headline, companion || !story ? 2 : 3)}
        adjustsFontSizeToFit
        minimumFontScale={0.6}
        style={style}
      >
        {headline}
      </WordFitText>
    </Animated.View>
  );
  const head = (
    <View>
      <Text {...ON_CARD} numberOfLines={1} style={{ ...kicker(inks, 10.5), color: inks.soft }}>
        {props.kicker.toLocaleUpperCase()}
      </Text>
      <View style={{ height: story ? 14 : 10 }} />
      {props.onHeadline ? (
        <PressScale
          scaleTo={0.98}
          accessibilityRole="button"
          {...(props.headlineHint === undefined ? {} : { accessibilityHint: props.headlineHint })}
          onPress={props.onHeadline}
        >
          {words}
        </PressScale>
      ) : (
        words
      )}
      {props.sub ? (
        <View style={{ paddingTop: 8 }}>
          <FadingLine text={props.sub.text} shown={props.sub.shown} inks={inks} />
        </View>
      ) : null}
      {props.band ? (
        <View style={{ paddingTop: story ? 20 : 12, alignItems: 'flex-start' }}>{props.band}</View>
      ) : null}
    </View>
  );
  const said =
    props.line === null ? null : (
      <WordFitText
        {...ON_CARD}
        numberOfLines={linesOf(props.line, 3)}
        adjustsFontSizeToFit
        minimumFontScale={0.6}
        style={{
          ...title(inks, base, 1.1, inks.lineWeight),
          textAlign: 'center',
        }}
      >
        {props.line}
      </WordFitText>
    );
  // Beside the jar on a story the companion gives up a little; in the feed crop, over its line,
  // a little more so the line keeps the full column.
  const hero = heroSize(format) * (props.beside ? (story ? 0.92 : 1) : story ? 1 : 0.88);
  const figure = (
    <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 4 }}>
      <View style={{ marginBottom: -hero * 0.04 }}>
        <Companion size={hero} mood={props.mood} />
      </View>
      {props.beside?.(hero * 0.82)}
    </View>
  );
  return (
    <CardGround inks={inks} width={CARD_WIDTH} height={cardHeight(format)}>
      <View
        style={{
          flex: 1,
          paddingTop: story ? 30 : 22,
          paddingHorizontal: 24,
          paddingBottom: story ? 22 : 16,
        }}
      >
        {!companion ? (
          // Serious: the words and what was counted, centred in the card.
          <>
            <View style={{ flex: 1, justifyContent: 'center', gap: story ? 28 : 18 }}>
              {head}
              {props.beside ? (
                <View style={{ alignItems: 'center' }}>{props.beside(story ? 230 : 150)}</View>
              ) : null}
            </View>
            <CardSign inks={inks} />
          </>
        ) : (
          // The companion large in the middle, its line under it as big as the headline, across
          // the full column in every language.
          <>
            {head}
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
              {figure}
              <View style={{ alignSelf: 'stretch', paddingTop: story ? 14 : 8 }}>{said}</View>
            </View>
            <CardSign inks={inks} />
          </>
        )}
      </View>
    </CardGround>
  );
}
