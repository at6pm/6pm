import type { ReactNode } from 'react';
import { ScrollView, Text, View } from 'react-native';
import Animated, {
  Easing,
  interpolate,
  LayoutAnimationConfig,
  useAnimatedStyle,
  useReducedMotion,
  type SharedValue,
} from 'react-native-reanimated';

import { useMoney } from '../../data/money-provider';
import { useI18n } from '../../i18n/i18n';
import { useHomeCurrency, useMoneyFormat } from '../../money/use-money-format';
import { Companion } from '../../ui/companion/companion';
import { haptics } from '../../ui/haptics';
import { Symbol } from '../../ui/icons/symbol';
import type { SymbolName } from '../../ui/icons/symbols.generated';
import { PressScale } from '../../ui/primitives/press-scale';
import { body, display, leading, mono } from '../../ui/type/fonts';
import type { ListenWay, SelfCatchingWay } from './catch-ways';
import { FirstCatchPath } from './first-catch-path';
import { FirstCatchSetupCards } from './first-catch-setup';
import { FirstCatchSlip } from './first-catch-slip';
import { fadeEntering, popEntering, riseEntering, useLoop } from './onboarding-motion';
import type { OnboardingPalette } from './onboarding-palette';
import type { FirstCatchListen } from './use-first-catch';

/** Each ring grows and fades over 2.2 s; the second runs half a ring behind. */
const RING_MS = 2200;
/** The live dot on each way breathes over 1.1 s, there and back. */
const BREATHE_MS = 2200;
const TILE_ICON: Readonly<Record<ListenWay, SymbolName>> = {
  alerts: 'account_balance',
  share: 'ios_share',
  wallet: 'contactless',
};

/**
 * The catching step once a way is set up: it waits, live, for one real catch. "Waiting for your
 * first one…" over the companion in its rings, a tile for each way that was set up to make one
 * happen now, a card for each way that catches by itself but is not set up yet (set up right
 * there, it folds away and joins the tiles), and "I'll do it later", which always moves on. After 90 s with nothing it shows
 * the walked way's path and where it may be stuck, still listening. When the catch lands it
 * prints as receipt Nº 001 ("Caught it.") with the companion's line and Continue.
 */
export function FirstCatchListen({
  pal,
  ways,
  setupWays,
  walked,
  listen,
  bankId,
  access,
  onTry,
  onFix,
  onLater,
  onContinue,
}: {
  readonly pal: OnboardingPalette;
  readonly ways: readonly ListenWay[];
  /** The ways that catch by themselves still to set up, each offered as a card. */
  readonly setupWays: readonly SelfCatchingWay[];
  /** The way last set up or tried, whose path shows when it seems stuck. */
  readonly walked: ListenWay | null;
  readonly listen: FirstCatchListen;
  readonly bankId: string | null;
  /** Bank alerts come through Android's Notification access. */
  readonly access: boolean;
  readonly onTry: (way: ListenWay) => void;
  readonly onFix: (way: ListenWay) => void;
  readonly onLater: () => void;
  readonly onContinue: () => void;
}) {
  const { t } = useI18n();
  const { caught, stuck, skipped } = listen;
  const way = skipped ? 'alerts' : (walked ?? ways[0] ?? 'share');
  const phase = caught ? 'caught' : stuck || skipped ? 'stuck' : 'waiting';
  const title =
    phase === 'caught'
      ? t('firstCatch.caught')
      : phase === 'stuck'
        ? t('firstCatch.still')
        : t('firstCatch.waiting');
  return (
    <View style={{ flex: 1 }}>
      <Animated.View key={title} entering={fadeEntering(300, 0, false)}>
        <Text
          accessibilityRole="header"
          accessibilityLiveRegion="polite"
          style={{
            ...leading(display(36, 600, -0.03), 36),
            color: pal.ink,
            paddingTop: 20,
            minHeight: 92,
          }}
        >
          {title}
        </Text>
      </Animated.View>
      {phase === 'caught' && caught ? (
        <Caught pal={pal} onContinue={onContinue}>
          <FirstCatchSlip spend={caught} />
        </Caught>
      ) : phase === 'stuck' ? (
        <View style={{ flex: 1, gap: 18 }}>
          <Animated.View
            entering={fadeEntering(300, 0, false)}
            style={{ alignItems: 'center', paddingTop: 6, paddingBottom: 6 }}
          >
            <Companion size={92} mood="think" />
          </Animated.View>
          <FirstCatchPath
            pal={pal}
            way={way}
            bankId={bankId}
            stop={skipped ? 'skipped' : 'unknown'}
            access={access}
            onFix={() => onFix(way)}
            onAnother={() => {
              haptics.tap();
              listen.again();
            }}
          />
          <View style={{ flex: 1 }} />
          <LaterButton pal={pal} onPress={onLater} />
        </View>
      ) : (
        <Waiting
          pal={pal}
          ways={ways}
          setupWays={setupWays}
          onTry={onTry}
          onSetUp={onFix}
          onLater={onLater}
        />
      )}
    </View>
  );
}

function Waiting({
  pal,
  ways,
  setupWays,
  onTry,
  onSetUp,
  onLater,
}: {
  readonly pal: OnboardingPalette;
  readonly ways: readonly ListenWay[];
  readonly setupWays: readonly SelfCatchingWay[];
  readonly onTry: (way: ListenWay) => void;
  readonly onSetUp: (way: SelfCatchingWay) => void;
  readonly onLater: () => void;
}) {
  const { t } = useI18n();
  const reduceMotion = useReducedMotion();
  const money = useMoneyFormat();
  const step = useHomeCurrency().step;
  const rings = useLoop(RING_MS);
  const breathe = useLoop(BREATHE_MS, 0, 1);
  const hint = (way: ListenWay) =>
    way === 'alerts'
      ? t('firstCatch.tile.alerts', { amount: money.full(step) })
      : t(way === 'share' ? 'firstCatch.tile.share' : 'firstCatch.tile.wallet');
  // A short phone, a larger text size or set-up cards scroll the wait rather than push
  // "I'll do it later" off the screen.
  return (
    <ScrollView
      style={{ flex: 1, marginHorizontal: -20 }}
      contentContainerStyle={{ flexGrow: 1, gap: 14, paddingHorizontal: 20 }}
      showsVerticalScrollIndicator={false}
      alwaysBounceVertical={false}
    >
      <View style={{ flex: 1, minHeight: 170, alignItems: 'center', justifyContent: 'center' }}>
        <View style={{ width: 170, height: 170, alignItems: 'center', justifyContent: 'center' }}>
          <Ring clock={rings} offset={0} color={pal.accent} />
          <Ring clock={rings} offset={0.5} color={pal.accent} />
          <Companion size={104} mood="calm" />
        </View>
      </View>
      {ways.length > 0 ? (
        <Text
          style={{
            ...mono(10.5, 500, 0.14),
            color: pal.inkSoft,
            opacity: 0.81,
            textAlign: 'center',
          }}
        >
          {t('firstCatch.tryHere')}
        </Text>
      ) : null}
      {/* A way set up while waiting pops into its tile; the tiles there from the start do not. */}
      <LayoutAnimationConfig skipEntering>
        {ways.length > 0 ? (
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {[0, 1, 2].map((slot) => {
              const way = ways[slot];
              return (
                <View key={slot} style={{ flex: 1, minWidth: 0 }}>
                  {way ? (
                    <Animated.View key={way} entering={popEntering(420, 0, reduceMotion)}>
                      <PressScale
                        scaleTo={0.95}
                        accessibilityRole="button"
                        accessibilityLabel={hint(way)}
                        onPress={() => {
                          haptics.tap();
                          onTry(way);
                        }}
                        style={{
                          height: 132,
                          borderRadius: 22,
                          backgroundColor: pal.cell,
                          boxShadow: pal.cardShadow,
                          paddingVertical: 12,
                          paddingHorizontal: 10,
                          justifyContent: 'space-between',
                        }}
                      >
                        <BreathingDot clock={breathe} color={pal.accent} />
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
                          <Symbol name={TILE_ICON[way]} size={22} color={pal.ink} />
                        </View>
                        <Text style={{ ...body(13, 650), lineHeight: 16.25, color: pal.ink }}>
                          {hint(way)}
                        </Text>
                      </PressScale>
                    </Animated.View>
                  ) : null}
                </View>
              );
            })}
          </View>
        ) : null}
      </LayoutAnimationConfig>
      <FirstCatchSetupCards pal={pal} ways={setupWays} onSetUp={onSetUp} />
      <LaterButton pal={pal} onPress={onLater} />
    </ScrollView>
  );
}

/** `ring`: a disc at the companion's size that grows to 1.7× as it fades, ease-out. */
function Ring({
  clock,
  offset,
  color,
}: {
  readonly clock: SharedValue<number>;
  readonly offset: number;
  readonly color: string;
}) {
  const style = useAnimatedStyle(() => {
    const p = (clock.value + offset) % 1;
    const eased = Easing.bezierFn(0, 0, 0.58, 1)(p);
    return { opacity: 0.5 * (1 - eased), transform: [{ scale: 1 + 0.7 * eased }] };
  });
  return (
    <Animated.View
      style={[
        { position: 'absolute', width: 110, height: 110, borderRadius: 55, backgroundColor: color },
        style,
      ]}
    />
  );
}

/** `breathe`: the live dot on a way's tile, .4 → 1 and back. */
function BreathingDot({
  clock,
  color,
}: {
  readonly clock: SharedValue<number>;
  readonly color: string;
}) {
  const style = useAnimatedStyle(() => {
    const p = clock.value;
    const there = p < 0.5 ? p * 2 : (1 - p) * 2;
    const eased = Easing.bezierFn(0.42, 0, 0.58, 1)(there);
    return { opacity: interpolate(eased, [0, 1], [0.4, 1]) };
  });
  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          right: 11,
          top: 13,
          width: 7,
          height: 7,
          borderRadius: 3.5,
          backgroundColor: color,
        },
        style,
      ]}
    />
  );
}

function LaterButton({
  pal,
  onPress,
}: {
  readonly pal: OnboardingPalette;
  readonly onPress: () => void;
}) {
  const { t } = useI18n();
  return (
    <PressScale
      scaleTo={0.97}
      accessibilityRole="button"
      onPress={onPress}
      style={{
        height: 56,
        marginTop: 6,
        borderRadius: 99,
        borderWidth: 1,
        borderColor: pal.inkSoft,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Text style={{ ...body(17, 650), color: pal.ink }}>{t('firstCatch.later')}</Text>
    </PressScale>
  );
}

/** The caught receipt, the companion's line under it, and Continue, each in its turn. */
function Caught({
  pal,
  children,
  onContinue,
}: {
  readonly pal: OnboardingPalette;
  readonly children: ReactNode;
  readonly onContinue: () => void;
}) {
  const { t } = useI18n();
  const reduceMotion = useReducedMotion();
  const persona = useMoney().plan?.persona ?? 'soft';
  return (
    <View style={{ flex: 1, gap: 18, paddingTop: 14 }}>
      {children}
      <Animated.View
        entering={riseEntering(450, 700, reduceMotion, 14)}
        style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 6 }}
      >
        <Companion size={62} mood="happy" />
        <View
          style={{
            flexShrink: 1,
            maxWidth: 260,
            marginBottom: 24,
            paddingTop: 10,
            paddingHorizontal: 15,
            paddingBottom: 11,
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            borderBottomRightRadius: 20,
            borderBottomLeftRadius: 6,
            backgroundColor: pal.btnBg,
          }}
        >
          <Text style={{ ...leading(display(16.5, 500), 20.6), color: pal.btnFg }}>
            {t(`companion.firstCatch.${persona}`)}
          </Text>
        </View>
      </Animated.View>
      <View style={{ flex: 1 }} />
      <Animated.View entering={riseEntering(400, 900, reduceMotion, 14)}>
        <PressScale
          scaleTo={0.97}
          accessibilityRole="button"
          onPress={onContinue}
          style={{
            height: 56,
            borderRadius: 99,
            backgroundColor: pal.accent,
            boxShadow: pal.accentShadow,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
          }}
        >
          <Text style={{ ...body(17, 700), color: pal.onAccent }}>{t('onboarding.continue')}</Text>
          <Symbol name="arrow_forward" size={20} color={pal.onAccent} />
        </PressScale>
      </Animated.View>
    </View>
  );
}
