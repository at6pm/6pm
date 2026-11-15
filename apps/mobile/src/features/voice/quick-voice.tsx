import { useEffect, useRef } from 'react';
import { Text, View } from 'react-native';
import Animated, {
  Easing,
  FadeIn,
  FadeOut,
  interpolateColor,
  ReduceMotion,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';

import type { Language } from '@6pm/i18n';
import { curves, voiceInk } from '@6pm/theme';

import { useI18n } from '../../i18n/i18n';
import { Companion } from '../../ui/companion/companion';
import { Symbol } from '../../ui/icons/symbol';
import { PressScale } from '../../ui/primitives/press-scale';
import { useTheme } from '../../ui/theme/theme';
import { body, display, leading, mono } from '../../ui/type/fonts';
import { ListeningRing } from './listening-ring';
import { VoiceShimmer } from './voice-shimmer';
import { dictationName, type VoiceChip } from './voice-support';
import { missed, type VoiceStage } from './voice-stage';
import { WaveBars } from './wave-bars';

const enter = Easing.bezier(...curves.enter);
const house = Easing.bezier(...curves.house);
/** The prototype's `micIn` curve: a pop that overshoots a little. */
const pop = Easing.bezier(0.2, 1.4, 0.4, 1);
/** Back to the keys from a miss: a plain cross-fade. */
const BACK_MS = 200;
/** The companion rising into a miss, on the house pop. */
const RISE = 14;
const RISE_MS = 420;
/** The waveform settling and fading as the miss comes in. */
const SETTLE_MS = 160;

/** `micIn`: scaled from .6 and faded in, after `delay` ms. */
function popIn(duration: number, delay = 0) {
  return () => {
    'worklet';
    return {
      initialValues: { opacity: 0, transform: [{ scale: 0.6 }] },
      animations: {
        opacity: withDelay(delay, withTiming(1, { duration, easing: pop })),
        transform: [{ scale: withDelay(delay, withTiming(1, { duration, easing: pop })) }],
      },
    };
  };
}

/**
 * The keypad and the voice panel in one place: the keypad steps back (fading, shrinking a little,
 * dropping 6 pt) while the panel comes forward over it, and the other way when the panel closes.
 * Leaving a miss for the keys (`back`) is a plain 200 ms cross-fade.
 */
export function useVoiceSwap(open: boolean, back = false) {
  const shown = useSharedValue(open ? 1 : 0);
  const quick = useSharedValue(back ? 1 : 0);
  useEffect(() => {
    quick.value = !open && back ? 1 : 0;
    shown.value = open ? 1 : 0;
  }, [open, back, shown, quick]);
  const keypad = useAnimatedStyle(() => {
    const fast = quick.value === 1;
    return {
      opacity: withTiming(1 - shown.value, { duration: fast ? BACK_MS : 350 }),
      transform: [
        { translateY: withTiming(6 * shown.value, { duration: fast ? 0 : 450, easing: enter }) },
        { scale: withTiming(1 - 0.04 * shown.value, { duration: fast ? 0 : 450, easing: enter }) },
      ],
    };
  });
  const panel = useAnimatedStyle(() => {
    const fast = quick.value === 1;
    return {
      opacity: withTiming(shown.value, { duration: fast ? BACK_MS : 350 }),
      transform: [
        {
          translateY: withTiming(10 * (1 - shown.value), {
            duration: fast ? 0 : 450,
            easing: enter,
          }),
        },
        {
          scale: withTiming(0.96 + 0.04 * shown.value, {
            duration: fast ? 0 : 450,
            easing: enter,
          }),
        },
      ],
    };
  });
  return { keypad, panel };
}

/** The panel's words for a stage it cannot carry on from with the microphone. */
function settingsLine(
  stage: VoiceStage,
  t: ReturnType<typeof useI18n>['t'],
  language: Language,
): string | null {
  if (stage === 'denied') return t('voice.denied');
  if (stage === 'unavailable')
    return t('voice.unavailable', { language: dictationName(language, t) });
  return null;
}

/**
 * Voice missed: the companion rises with one line, what was heard in mono and how to say it; with
 * nothing heard at all, it asks whether the microphone is allowed.
 */
function MissedLine({
  nothing,
  transcript,
  serious,
}: {
  /** Nothing was heard at all. */
  readonly nothing: boolean;
  /** The words the speech service returned; empty when it returned none. */
  readonly transcript: string;
  readonly serious: boolean;
}) {
  const { palette } = useTheme();
  const { t } = useI18n();
  const rise = useSharedValue(0);
  useEffect(() => {
    rise.value = withTiming(1, {
      duration: RISE_MS,
      easing: house,
      reduceMotion: ReduceMotion.System,
    });
  }, [rise]);
  const risen = useAnimatedStyle(() => ({
    opacity: Math.min(1, rise.value * 1.5),
    transform: [{ translateY: RISE * (1 - rise.value) }],
  }));
  const heard = transcript.trim();
  // The heard words sit inside the sentence in mono: the sentence is split where they go.
  const [before = '', after = ''] = t('voice.heardFirst', { said: '\u0000' }).split('\u0000');
  const how = { ...body(13.5), lineHeight: 19, color: palette.inkSoft };
  return (
    <Animated.View
      style={[{ flexDirection: 'row', alignItems: 'center', gap: 14, alignSelf: 'stretch' }, risen]}
    >
      <Companion size={58} mood="calm" serious={serious} />
      <View style={{ flex: 1, gap: 5 }}>
        <Text style={{ ...leading(display(20, 500), 23), color: palette.ink }}>
          {nothing ? t('voice.nothingHeard') : t('voice.missed')}
        </Text>
        {nothing ? null : heard === '' ? (
          <Text numberOfLines={3} style={how}>
            {t('voice.sayFirst')}
          </Text>
        ) : (
          <Text numberOfLines={3} style={how}>
            {before}
            <Text style={{ ...mono(12), color: palette.ink }}>{`“${heard}”`}</Text>
            {after}
          </Text>
        )}
      </View>
    </Animated.View>
  );
}

/**
 * What quick add hears, over the keypad's first three rows: a status line, the words (streaming
 * while listening, quoted once read), and under them the bars, the reading sweep or the chips read
 * from them. A miss is the companion with one line, the words heard and how to say it.
 */
export function QuickVoicePanel({
  stage,
  transcript,
  chips,
  serious = false,
}: {
  readonly stage: VoiceStage;
  readonly transcript: string;
  readonly chips: readonly VoiceChip[];
  /** Serious mode: the plain companion. */
  readonly serious?: boolean;
}) {
  const { palette } = useTheme();
  const { t, language } = useI18n();
  // While the panel fades out it keeps showing what it showed last.
  const last = useRef<VoiceStage>('waiting');
  if (stage !== 'closed') last.current = stage;
  const shown = last.current;
  const stuck = settingsLine(shown, t, language);
  const hearing = shown === 'waiting' || shown === 'listening';
  const title = hearing
    ? t('voice.listening')
    : shown === 'reading'
      ? t('voice.reading')
      : shown === 'heard'
        ? t('voice.gotIt')
        : null;
  const said =
    transcript === ''
      ? hearing
        ? t('voice.promptTap')
        : ''
      : hearing
        ? transcript
        : `“${transcript}”`;
  const saidInk = transcript !== '' && shown !== 'reading' ? palette.ink : palette.inkSoft;

  if (missed(shown)) {
    return (
      <View
        style={{ flex: 1, justifyContent: 'center', paddingVertical: 14, paddingHorizontal: 16 }}
      >
        <MissedLine
          key={`${shown}-${transcript}`}
          nothing={shown === 'nothing'}
          transcript={transcript}
          serious={serious}
        />
      </View>
    );
  }

  return (
    <View
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        paddingVertical: 12,
        paddingHorizontal: 20,
      }}
    >
      {title ? (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 7 }}>
          <View
            style={{
              width: 7,
              height: 7,
              borderRadius: 4,
              backgroundColor: shown === 'heard' ? voiceInk.heard : palette.accent,
            }}
          />
          <Text
            style={{
              ...mono(10.5, 400, 0.14),
              textTransform: 'uppercase',
              color: palette.inkSoft,
            }}
          >
            {title}
          </Text>
        </View>
      ) : null}
      {said !== '' ? (
        <View style={{ minHeight: stuck ? 0 : 58, maxWidth: 300, justifyContent: 'center' }}>
          <Text
            numberOfLines={2}
            style={{ ...leading(display(23, 500), 28.75), color: saidInk, textAlign: 'center' }}
          >
            {said}
          </Text>
        </View>
      ) : null}
      {stuck ? (
        <Animated.Text
          key={shown}
          entering={FadeIn.duration(300)}
          style={{
            ...body(15),
            lineHeight: 21,
            maxWidth: 300,
            color: palette.inkSoft,
            textAlign: 'center',
          }}
        >
          {stuck}
        </Animated.Text>
      ) : null}
      {hearing ? (
        <Animated.View
          entering={FadeIn.duration(300)}
          exiting={FadeOut.duration(SETTLE_MS)}
          style={{ height: 28 }}
        >
          <WaveBars count={7} width={4} height={28} gap={4} radius={3} />
        </Animated.View>
      ) : shown === 'reading' ? (
        <Animated.View
          entering={FadeIn.duration(300)}
          style={{ height: 28, justifyContent: 'center' }}
        >
          <VoiceShimmer />
        </Animated.View>
      ) : shown === 'heard' ? (
        <View key={transcript} style={{ height: 28, flexDirection: 'row', gap: 6 }}>
          {chips.map((chip, i) => (
            <Animated.View
              key={`${i}-${chip.label}`}
              entering={popIn(400, i * 80)}
              style={{
                height: 28,
                paddingHorizontal: 11,
                borderRadius: 14,
                backgroundColor: palette.accent,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 4,
              }}
            >
              <Symbol name={chip.icon} size={14} fill={1} color={palette.accentFg} />
              <Text numberOfLines={1} style={{ ...body(12.5, 650), color: palette.accentFg }}>
                {chip.label}
              </Text>
            </Animated.View>
          ))}
        </View>
      ) : null}
    </View>
  );
}

/**
 * The microphone, the first cell of Quick add's last row. Tapped, it listens; while listening it
 * stops; it takes the accent while the panel is open and pulses a ring while it hears.
 */
export function QuickMicCell({
  stage,
  onPress,
  disabled = false,
}: {
  readonly stage: VoiceStage;
  readonly onPress: () => void;
  /** Drawn, but voice does not fill this face of the ticket. */
  readonly disabled?: boolean;
}) {
  const { palette } = useTheme();
  const { t } = useI18n();
  const open = stage !== 'closed';
  const listening = stage === 'listening';
  const icon =
    stage === 'listening' || stage === 'waiting'
      ? 'stop'
      : stage === 'reading'
        ? 'more_horiz'
        : stage === 'heard'
          ? 'check'
          : 'mic';
  const on = useSharedValue(open ? 1 : 0);
  const glow = useSharedValue(0);
  useEffect(() => {
    on.value = withTiming(open ? 1 : 0, { duration: 300 });
    glow.value = withTiming(listening ? 1 : 0, { duration: 300 });
  }, [open, listening, on, glow]);

  const face = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(on.value, [0, 1], [palette.chipBg, palette.accent]),
  }));
  const shadow = useAnimatedStyle(() => ({ opacity: glow.value }));

  return (
    <View style={{ flex: 1, height: 48, opacity: disabled ? 0.35 : 1 }}>
      <ListeningRing on={listening} radius={15} />
      <Animated.View
        pointerEvents="none"
        style={[
          {
            position: 'absolute',
            inset: 0,
            borderRadius: 15,
            backgroundColor: palette.accent,
            boxShadow: voiceInk.listeningGlow,
          },
          shadow,
        ]}
      />
      <PressScale
        scaleTo={0.92}
        accessibilityRole="button"
        accessibilityLabel={listening ? t('voice.stopHint') : t('voice.micHint')}
        accessibilityState={{ busy: listening, disabled }}
        disabled={disabled}
        onPress={onPress}
        style={{ flex: 1 }}
      >
        <Animated.View
          style={[
            { flex: 1, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
            face,
          ]}
        >
          <Animated.View key={icon} {...(open ? { entering: popIn(300) } : {})}>
            <Symbol name={icon} size={22} fill={1} color={open ? palette.accentFg : palette.ink} />
          </Animated.View>
        </Animated.View>
      </PressScale>
    </View>
  );
}
