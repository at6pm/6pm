import { Text, View } from 'react-native';
import Animated, { FadeOut, LinearTransition, ReduceMotion } from 'react-native-reanimated';

import { useI18n } from '../../i18n/i18n';
import { haptics } from '../../ui/haptics';
import { Symbol } from '../../ui/icons/symbol';
import type { SymbolName } from '../../ui/icons/symbols.generated';
import { PressScale } from '../../ui/primitives/press-scale';
import { body } from '../../ui/type/fonts';
import type { SelfCatchingWay } from './catch-ways';
import type { OnboardingPalette } from './onboarding-palette';

/** The way's tile icon, so a card that folds away is the tile that takes its place. */
export const SETUP_ICON: Readonly<Record<SelfCatchingWay, SymbolName>> = {
  alerts: 'account_balance',
  wallet: 'contactless',
};

/** Folding away, the cards under it close up with the app's settle spring. */
const fold = LinearTransition.springify().damping(22).stiffness(240);
const away = FadeOut.duration(180).reduceMotion(ReduceMotion.System);

/**
 * While the wait listens for a first catch, a compact card for each way that catches by itself
 * but is not set up yet: its icon, its name, the minute it takes, and Set up, which opens the
 * same walkthrough (or Android's Notification access) as the catching step's card. Once the way
 * is set up the card folds away and the way joins the tiles to try.
 */
export function FirstCatchSetupCards({
  pal,
  ways,
  onSetUp,
}: {
  readonly pal: OnboardingPalette;
  readonly ways: readonly SelfCatchingWay[];
  readonly onSetUp: (way: SelfCatchingWay) => void;
}) {
  const { t } = useI18n();
  if (ways.length === 0) return null;
  return (
    <Animated.View layout={fold} style={{ gap: 8 }}>
      {ways.map((way) => (
        <Animated.View
          key={way}
          layout={fold}
          exiting={away}
          style={{
            minHeight: 64,
            borderRadius: 20,
            backgroundColor: pal.cell,
            boxShadow: pal.cardShadow,
            paddingVertical: 10,
            paddingLeft: 12,
            paddingRight: 10,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12,
          }}
        >
          <View
            style={{
              width: 40,
              height: 40,
              borderRadius: 13,
              backgroundColor: pal.chipBg,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Symbol name={SETUP_ICON[way]} size={22} color={pal.ink} />
          </View>
          <View style={{ flex: 1, minWidth: 0, gap: 2 }}>
            <Text numberOfLines={1} style={{ ...body(15, 650), color: pal.ink }}>
              {t(`onboarding.catch.${way}.title`)}
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Symbol name="schedule" size={14} color={pal.inkSoft} />
              <Text
                numberOfLines={1}
                style={{ ...body(12.5, 600), color: pal.inkSoft, flexShrink: 1 }}
              >
                {t(`capture.${way}.time`)}
              </Text>
            </View>
          </View>
          <PressScale
            scaleTo={0.95}
            accessibilityRole="button"
            accessibilityLabel={`${t('onboarding.catch.setUp')}: ${t(`onboarding.catch.${way}.title`)}`}
            onPress={() => {
              haptics.tap();
              onSetUp(way);
            }}
          >
            <View
              style={{
                height: 40,
                borderRadius: 99,
                paddingLeft: 14,
                paddingRight: 8,
                backgroundColor: pal.accent,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 2,
              }}
            >
              <Text style={{ ...body(14, 700), color: pal.onAccent }}>
                {t('onboarding.catch.setUp')}
              </Text>
              <Symbol name="chevron_right" size={18} color={pal.onAccent} />
            </View>
          </PressScale>
        </Animated.View>
      ))}
    </Animated.View>
  );
}
