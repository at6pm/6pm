import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import Animated, {
  interpolate,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
} from 'react-native-reanimated';

import { useI18n } from '../../i18n/i18n';
import { haptics } from '../../ui/haptics';
import { Symbol } from '../../ui/icons/symbol';
import { PressScale } from '../../ui/primitives/press-scale';
import { useTheme } from '../../ui/theme/theme';
import { body, display, leading } from '../../ui/type/fonts';
import { HEADING_BREAKS, headingWords } from '../../ui/type/word-fit-text';
import { openAlertAccess } from '../capture-guide/alert-access';
import { alertsPaused, useAlertsPausedSigns } from './alerts-paused';
import { foldAway, SHEET_GAP } from './first-catch-card';
import { useFirstCatchCard } from './use-first-catch-card';

/**
 * Android: Today's word that bank alerts are paused, when Notification access was switched off on
 * a phone that had them set up. Drawn as the first-catch card is: the bell crossed out, what is
 * paused, what turning access back on gives, and the one action that opens Android's Notification
 * access at 6pm's switch. It folds away (the first-catch card's fold) the moment access is back.
 */
export function AlertsPausedCard() {
  const { palette } = useTheme();
  const { t } = useI18n();
  const reduceMotion = useReducedMotion();
  const signs = useAlertsPausedSigns();
  const { reminder } = useFirstCatchCard();
  const paused = alertsPaused({ ...signs, reminderUp: reminder !== null });
  const [shown, setShown] = useState(false);
  const [gone, setGone] = useState(false);
  const height = useSharedValue(0);
  const fold = useSharedValue(0);

  useEffect(() => {
    if (paused) {
      fold.set(0);
      setGone(false);
      setShown(true);
    } else if (shown && !gone) {
      foldAway(fold, reduceMotion, setGone);
    }
  }, [paused, shown, gone, fold, reduceMotion]);

  const folding = useAnimatedStyle(() => {
    const p = fold.get();
    if (p === 0) return { opacity: 1 };
    return {
      height: height.get() * (1 - p),
      marginBottom: -SHEET_GAP * p,
      opacity: interpolate(p, [0, 0.7], [1, 0], 'clamp'),
      overflow: 'hidden',
    };
  });

  if (!shown || gone) return null;
  return (
    <Animated.View
      style={folding}
      onLayout={(e) => {
        if (fold.get() === 0) height.set(e.nativeEvent.layout.height);
      }}
    >
      <View
        style={{
          borderRadius: 26,
          backgroundColor: palette.cell,
          boxShadow: palette.cardShadow,
          padding: 16,
          gap: 14,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 14 }}>
          <View
            style={{
              width: 44,
              height: 44,
              borderRadius: 14,
              backgroundColor: palette.chipBg,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Symbol name="notifications_off" size={24} color={palette.ink} />
          </View>
          <View style={{ flex: 1, minWidth: 0, gap: 6 }}>
            <Text
              {...HEADING_BREAKS}
              accessibilityRole="header"
              style={{ ...leading(display(21, 500), 23.5), color: palette.ink }}
            >
              {headingWords(t('capture.alerts.paused.title'))}
            </Text>
            <Text style={{ ...body(14.5), lineHeight: 20, color: palette.inkSoft }}>
              {t('capture.alerts.paused.body')}
            </Text>
          </View>
        </View>
        <PressScale
          scaleTo={0.96}
          accessibilityRole="button"
          onPress={() => {
            haptics.tap();
            openAlertAccess();
          }}
          style={{
            height: 44,
            borderRadius: 99,
            backgroundColor: palette.accent,
            boxShadow: `0 8px 22px ${palette.accentGlow}, inset 0 1px 0 rgba(255,255,255,.5)`,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 4,
          }}
        >
          <Text numberOfLines={1} style={{ ...body(15, 650), color: palette.accentFg }}>
            {t('capture.alerts.paused.action')}
          </Text>
          <Symbol name="arrow_forward" size={18} color={palette.accentFg} />
        </PressScale>
      </View>
    </Animated.View>
  );
}
