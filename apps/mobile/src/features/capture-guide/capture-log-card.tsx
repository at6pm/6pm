import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Text, View } from 'react-native';
import Animated, {
  Easing,
  ReduceMotion,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

import type { CaptureLogContents } from '@6pm/domain';

import { deviceCaptureLog, sendCaptureLog } from '../../data/device-capture-log';
import { useMoney } from '../../data/money-provider';
import { useI18n } from '../../i18n/i18n';
import { haptics } from '../../ui/haptics';
import { Symbol } from '../../ui/icons/symbol';
import { PressScale } from '../../ui/primitives/press-scale';
import { Switch } from '../../ui/primitives/switch';
import { useTheme } from '../../ui/theme/theme';
import { useToast } from '../../ui/toast/toast-host';
import { body } from '../../ui/type/fonts';
import { captureColours } from './capture-colours';
import { CaptureLogTape, shortDate } from './capture-log-tape';
import { useCaptureLog } from './use-capture-log';

/** The tape prints downward from under the row (the slips' print curve), and folds up quicker. */
const PRINT = { duration: 350, easing: Easing.bezier(0.2, 0.9, 0.2, 1) } as const;
const FOLD = { duration: 220, easing: Easing.bezier(0.42, 0, 1, 1) } as const;
/** How long "Turn off and clear the log?" waits for the second tap. */
const ARM_MS = 3000;

/**
 * Settings' "Keep a capture log", at the foot of How spending gets caught. Off by default. On,
 * the tape of the newest catches prints under the row with "Send the log", the one way the log
 * leaves the phone (the share sheet, with the file). Turning it off asks once, in place, and then
 * deletes everything the log holds.
 */
export function CaptureLogCard() {
  const { palette } = useTheme();
  const { t, language } = useI18n();
  const toast = useToast();
  const { today } = useMoney();
  const contents = useCaptureLog();
  const on = contents !== null && contents !== undefined;
  const [armed, setArmed] = useState(false);
  const [sending, setSending] = useState(false);
  const disarm = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(disarm.current), []);

  // What the tape shows stays while it folds away after the log is turned off.
  const [folding, setFolding] = useState<CaptureLogContents | null>(null);
  useEffect(() => {
    if (contents) setFolding(contents);
  }, [contents]);
  const tape = contents ?? folding;
  const open = useSharedValue(0);
  const height = useSharedValue(0);
  // Settings opening with the log on shows the tape at once; only the switch prints or folds it.
  const settled = useRef(false);
  const loaded = contents !== undefined;
  useLayoutEffect(() => {
    if (!loaded) return;
    if (!settled.current) {
      settled.current = true;
      open.value = on ? 1 : 0;
      return;
    }
    open.value = withTiming(
      on ? 1 : 0,
      { ...(on ? PRINT : FOLD), reduceMotion: ReduceMotion.System },
      (done) => {
        if (done && !on) scheduleOnRN(setFolding, null);
      },
    );
  }, [loaded, on, open]);
  const reveal = useAnimatedStyle(() => ({ height: height.value * open.value }));

  const flip = (next: boolean) => {
    if (next) {
      clearTimeout(disarm.current);
      setArmed(false);
      void deviceCaptureLog.turnOn();
      return;
    }
    if (!armed) {
      setArmed(true);
      disarm.current = setTimeout(() => setArmed(false), ARM_MS);
      return;
    }
    clearTimeout(disarm.current);
    setArmed(false);
    void deviceCaptureLog.turnOff();
  };

  const send = () => {
    if (sending) return;
    haptics.tick();
    setSending(true);
    sendCaptureLog(today)
      .catch(() => toast(t('captureLog.sendFailed')))
      .finally(() => setSending(false));
  };

  const sub = armed
    ? t('captureLog.confirmOff')
    : on
      ? t('captureLog.on', { date: shortDate(contents.since, language) })
      : t('captureLog.off');

  return (
    <View
      style={{
        borderRadius: 26,
        backgroundColor: palette.cell,
        boxShadow: palette.cardShadow,
        overflow: 'hidden',
      }}
    >
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 12,
          paddingHorizontal: 14,
          paddingVertical: 12,
        }}
      >
        <View
          style={{
            width: 32,
            height: 32,
            borderRadius: 10,
            backgroundColor: palette.chipBg,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Symbol name="receipt_long" size={19} color={palette.ink} />
        </View>
        <View style={{ flex: 1, minWidth: 0, gap: 2 }}>
          <Text numberOfLines={1} style={{ ...body(16), color: palette.ink }}>
            {t('captureLog.title')}
          </Text>
          <Text
            numberOfLines={1}
            style={{
              ...body(12.5),
              color: armed ? captureColours(palette).warn : palette.inkSoft,
            }}
          >
            {sub}
          </Text>
        </View>
        <Switch value={on} onChange={flip} accessibilityLabel={t('captureLog.title')} />
      </View>
      <Animated.View
        pointerEvents={on ? 'auto' : 'none'}
        accessibilityElementsHidden={!on}
        style={[{ overflow: 'hidden' }, reveal]}
      >
        <View
          onLayout={(e) => {
            height.value = withTiming(e.nativeEvent.layout.height, {
              ...PRINT,
              duration: height.value === 0 ? 0 : PRINT.duration,
              reduceMotion: ReduceMotion.System,
            });
          }}
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: 0,
            paddingTop: 2,
            paddingHorizontal: 14,
            paddingBottom: 14,
            gap: 12,
          }}
        >
          {tape ? <CaptureLogTape contents={tape} /> : null}
          <PressScale
            scaleTo={0.97}
            accessibilityRole="button"
            accessibilityState={{ busy: sending }}
            onPress={send}
            style={{
              height: 48,
              borderRadius: 99,
              backgroundColor: palette.btnBg,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 7,
            }}
          >
            <Symbol name="ios_share" size={19} color={palette.btnFg} />
            <Text style={{ ...body(16, 650), color: palette.btnFg }}>{t('captureLog.send')}</Text>
          </PressScale>
          <Text
            style={{
              ...body(12.5),
              lineHeight: 18.1,
              color: palette.inkSoft,
              paddingHorizontal: 4,
            }}
          >
            {t('captureLog.sendNote')}
          </Text>
        </View>
      </Animated.View>
    </View>
  );
}
