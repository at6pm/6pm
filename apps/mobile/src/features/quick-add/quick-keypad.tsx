import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Linking, Text, View } from 'react-native';
import Animated, {
  Easing,
  ReduceMotion,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import type { KeypadKey } from '@6pm/domain';
import { curves, quickAddInk } from '@6pm/theme';

import { useI18n } from '../../i18n/i18n';
import { haptics } from '../../ui/haptics';
import { Symbol } from '../../ui/icons/symbol';
import type { SymbolName } from '../../ui/icons/symbols.generated';
import { KeypadKeyCell, type KeypadCurrencyKey } from '../../ui/keypad';
import { PressScale } from '../../ui/primitives/press-scale';
import { useTheme } from '../../ui/theme/theme';
import { body } from '../../ui/type/fonts';
import { QuickMicCell, useVoiceSwap } from '../voice/quick-voice';
import { lastRowOf, missed, type VoiceStage } from '../voice/voice-stage';
import { KeepCell } from './keep-cell';
import { quickKeyRows } from './quick-keys';

const GAP = 6;
/** "Try again" fills from the microphone's cell outward to three cells. */
const FILL_MS = 240;
const fillEase = Easing.bezier(...curves.enter);
const SWAP_MS = 200;
/** One cell's share of a row: four to a row, 6 pt apart. */
const cell = { flexGrow: 1, flexBasis: 0 } as const;
/** Two cells and the gap between them. */
const twoCells = { flexGrow: 2, flexBasis: GAP } as const;

/**
 * Quick add's keypad, 210 pt: 1–9 with delete, "k" and "000" in three rows, then the microphone,
 * the 0 under the 8 and Keep it over two cells. Voice opens its panel over the three rows, so
 * nothing above moves; the last row keeps the grid and says what voice needs next.
 */
export function QuickKeypad({
  onKey,
  currency,
  decimal,
  stage,
  panel,
  canKeep,
  onKeep,
  onMic,
  onVoiceMain,
  micOff = false,
}: {
  readonly onKey: (key: KeypadKey) => void;
  readonly currency?: KeypadCurrencyKey | undefined;
  readonly decimal?: string | undefined;
  readonly stage: VoiceStage;
  /** What voice shows over the three rows while it is open. */
  readonly panel: ReactNode;
  readonly canKeep: boolean;
  readonly onKeep: () => void;
  /** The microphone, and Try again. */
  readonly onMic: () => void;
  /** Done talking, and the keypad cell: voice's own "stop" or "close". */
  readonly onVoiceMain: () => void;
  /** Drawn, but voice does not fill this face. */
  readonly micOff?: boolean;
}) {
  const { palette } = useTheme();
  const open = stage !== 'closed';
  // Coming back to the keys from a miss is a plain cross-fade.
  const lastOpen = useRef<VoiceStage>('closed');
  const back = !open && missed(lastOpen.current);
  if (open) lastOpen.current = stage;
  const swap = useVoiceSwap(open, back);
  const rows = quickKeyRows({
    decimal: decimal !== undefined || currency?.decimal === true,
    currency: currency !== undefined,
  });
  const key = (name: KeypadKey) => (
    <KeypadKeyCell
      key={name}
      keyName={name}
      onPress={onKey}
      {...(currency ? { currency } : {})}
      decimal={decimal}
      style={cell}
    />
  );

  return (
    <View style={{ gap: GAP }}>
      <View>
        <Animated.View
          pointerEvents={open ? 'none' : 'auto'}
          accessibilityElementsHidden={open}
          style={[{ gap: GAP }, swap.keypad]}
        >
          {rows.map((row, i) => (
            <View key={i} style={{ flexDirection: 'row', gap: GAP }}>
              {row.map(key)}
            </View>
          ))}
        </Animated.View>
        <Animated.View
          pointerEvents={open ? 'auto' : 'none'}
          accessibilityElementsHidden={!open}
          style={[
            {
              position: 'absolute',
              inset: 0,
              borderRadius: 18,
              backgroundColor: palette.chipBg,
              overflow: 'hidden',
            },
            swap.panel,
          ]}
        >
          {panel}
        </Animated.View>
      </View>
      <LastRow
        stage={stage}
        zero={key('0')}
        canKeep={canKeep}
        onKeep={onKeep}
        onMic={onMic}
        onVoiceMain={onVoiceMain}
        micOff={micOff}
      />
    </View>
  );
}

/**
 * The last row. Closed: the microphone, the 0 and Keep it. Open: its first cell is the
 * microphone, or the way back to the keypad once voice cannot go on, and the three cells after it
 * one wide button: Done talking, Keep it, Try again (filling outward from the first cell) or Open
 * Settings.
 */
function LastRow({
  stage,
  zero,
  canKeep,
  onKeep,
  onMic,
  onVoiceMain,
  micOff,
}: {
  readonly stage: VoiceStage;
  readonly zero: ReactNode;
  readonly canKeep: boolean;
  readonly onKeep: () => void;
  readonly onMic: () => void;
  readonly onVoiceMain: () => void;
  readonly micOff: boolean;
}) {
  const { palette } = useTheme();
  const { t } = useI18n();
  const open = stage !== 'closed';
  const { lead, action } = lastRowOf(stage);
  const [width, setWidth] = useState(0);
  const one = Math.max(0, (width - GAP * 3) / 4);
  const wide = Math.max(0, width - one - GAP);

  // One warning tap as voice misses.
  const miss = missed(stage);
  useEffect(() => {
    if (miss) haptics.warning();
  }, [miss]);

  const keypadLead = useSharedValue(lead === 'keypad' ? 1 : 0);
  const overlay = useSharedValue(open ? 1 : 0);
  const reach = useSharedValue(open ? 1 : 0);
  useEffect(() => {
    const fade = { duration: SWAP_MS, reduceMotion: ReduceMotion.System };
    keypadLead.set(withTiming(lead === 'keypad' ? 1 : 0, fade));
    overlay.set(withTiming(open ? 1 : 0, fade));
    if (!open) return;
    if (miss) {
      reach.set(0);
      reach.set(
        withTiming(1, { duration: FILL_MS, easing: fillEase, reduceMotion: ReduceMotion.System }),
      );
    } else {
      reach.set(1);
    }
  }, [lead, open, miss, keypadLead, overlay, reach]);
  const micStyle = useAnimatedStyle(() => ({ opacity: 1 - keypadLead.get() }));
  const padStyle = useAnimatedStyle(() => ({ opacity: keypadLead.get() }));
  const overlayStyle = useAnimatedStyle(() => ({ opacity: overlay.get() }));
  // Try again's fill grows from the first cell's side; its words come in as it does.
  const fillStyle = useAnimatedStyle(() => ({ transform: [{ scaleX: reach.get() }] }));
  const wordsStyle = useAnimatedStyle(() => ({ opacity: reach.get() }));
  const keepUnder = useAnimatedStyle(() => ({ opacity: 1 - overlay.get() }));
  const zeroUnder = useAnimatedStyle(() => ({ opacity: 1 - overlay.get() }));

  const wideButton = (icon: SymbolName, label: string, accent: boolean, onPress: () => void) => {
    const ink = accent ? palette.accentFg : palette.btnFg;
    return (
      <PressScale
        accessibilityRole="button"
        accessibilityLabel={label}
        scaleTo={0.97}
        onPress={onPress}
        style={{ width: wide, height: 48 }}
      >
        <Animated.View
          pointerEvents="none"
          style={[
            {
              position: 'absolute',
              inset: 0,
              borderRadius: 15,
              backgroundColor: accent ? palette.accent : palette.btnBg,
              boxShadow: accent ? quickAddInk.retryGlow : quickAddInk.keepShadow,
              transformOrigin: 'left center',
            },
            fillStyle,
          ]}
        />
        <Animated.View
          pointerEvents="none"
          style={[
            {
              flex: 1,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              paddingHorizontal: 8,
            },
            wordsStyle,
          ]}
        >
          <Symbol name={icon} size={21} fill={accent ? 1 : 0} color={ink} />
          <Text numberOfLines={1} style={{ ...body(16, 650), color: ink, flexShrink: 1 }}>
            {label}
          </Text>
        </Animated.View>
      </PressScale>
    );
  };

  return (
    <View
      onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
      style={{ flexDirection: 'row', gap: GAP }}
    >
      <View style={cell}>
        <Animated.View
          pointerEvents={lead === 'mic' ? 'auto' : 'none'}
          style={[{ flexDirection: 'row' }, micStyle]}
        >
          <QuickMicCell stage={stage} onPress={onMic} disabled={micOff && !open} />
        </Animated.View>
        <Animated.View
          pointerEvents={lead === 'keypad' ? 'auto' : 'none'}
          accessibilityElementsHidden={lead !== 'keypad'}
          style={[{ position: 'absolute', inset: 0 }, padStyle]}
        >
          <PressScale
            accessibilityRole="button"
            accessibilityLabel={t('voice.toKeypad')}
            scaleTo={0.92}
            onPress={onVoiceMain}
            style={{
              flex: 1,
              borderRadius: 15,
              backgroundColor: palette.chipBg,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Symbol name="apps" size={22} color={palette.ink} />
          </PressScale>
        </Animated.View>
      </View>
      <Animated.View
        pointerEvents={open ? 'none' : 'auto'}
        accessibilityElementsHidden={open}
        style={[cell, { flexDirection: 'row' }, zeroUnder]}
      >
        <View style={{ flex: 1 }}>{zero}</View>
      </Animated.View>
      <Animated.View
        pointerEvents={open ? 'none' : 'auto'}
        accessibilityElementsHidden={open}
        style={[twoCells, keepUnder]}
      >
        <KeepCell awake={canKeep} onPress={onKeep} />
      </Animated.View>
      <Animated.View
        pointerEvents={open ? 'auto' : 'none'}
        accessibilityElementsHidden={!open}
        style={[
          { position: 'absolute', top: 0, bottom: 0, left: one + GAP, width: wide },
          overlayStyle,
        ]}
      >
        {action === 'stop' ? (
          wideButton('check', t('voice.doneTalking'), false, onVoiceMain)
        ) : action === 'retry' ? (
          wideButton('mic', t('voice.tryAgain'), true, onMic)
        ) : action === 'settings' ? (
          wideButton('settings', t('voice.openSettings'), true, () => {
            void Linking.openSettings();
          })
        ) : (
          <KeepCell
            awake={canKeep}
            dim={stage === 'reading'}
            onPress={onKeep}
            style={{ width: wide }}
          />
        )}
      </Animated.View>
    </View>
  );
}
