import type { ReactNode } from 'react';
import { Text, View } from 'react-native';
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useReducedMotion,
} from 'react-native-reanimated';

import { catchInk } from '@6pm/theme';

import { useI18n } from '../../i18n/i18n';
import { BankLogo } from '../../ui/bank-logo/bank-logo';
import { Symbol } from '../../ui/icons/symbol';
import type { SymbolName } from '../../ui/icons/symbols.generated';
import { PressScale } from '../../ui/primitives/press-scale';
import { body, display } from '../../ui/type/fonts';
import type { ListenWay } from './catch-ways';
import { riseEntering, useLoop } from './onboarding-motion';
import type { OnboardingPalette } from './onboarding-palette';

/** The dot runs the path on a 3.4 s loop. */
const LOOP_MS = 3400;
const NODE = 56;

/** What is known of where it stopped: nothing (the last hop is dashed), or a stop at 6pm. */
export type PathStop = 'unknown' | 'skipped';

/**
 * Where a first catch may be stuck, drawn as its way's path (the bank's alert, the Shortcut or
 * Notification access, 6pm; or the Wallet tap, the Shortcut, 6pm; or a receipt, the share sheet,
 * 6pm) with a dot that runs it. iOS cannot say which hop failed, so the last hop is dashed and no
 * hop is marked stuck; only an alert the Shortcut passed on and 6pm skipped (a code, a promotion)
 * marks the stop, at 6pm. Warm, never red. Still listening underneath.
 */
export function FirstCatchPath({
  pal,
  way,
  bankId,
  stop,
  access,
  onFix,
  onAnother,
}: {
  readonly pal: OnboardingPalette;
  readonly way: ListenWay;
  /** The person's own bank, for the alert's first hop. */
  readonly bankId: string | null;
  readonly stop: PathStop;
  /** Bank alerts come through Android's Notification access, not a Shortcut. */
  readonly access: boolean;
  readonly onFix: () => void;
  readonly onAnother: () => void;
}) {
  const { t } = useI18n();
  const reduceMotion = useReducedMotion();
  const clock = useLoop(LOOP_MS, 0, 0.45);
  const known = stop === 'skipped';
  // `travel`: in, along the first hop, a breath at the middle node, on along the last, gone.
  const dot = useAnimatedStyle(() => {
    const p = clock.value;
    const travelEase = Easing.bezierFn(0.45, 0, 0.3, 1);
    const first = travelEase(Math.min(1, p / 0.42));
    const second = travelEase(Math.min(1, Math.max(0, (p - 0.52) / 0.18)));
    const along = p < 0.52 ? first * 0.5 : 0.5 + second * (known ? 0.5 : 0.25);
    return {
      left: `${along * 100}%`,
      opacity: interpolate(p, [0, 0.06, 0.62, 0.7, 1], [0, 1, 1, 0, 0]),
    };
  });
  const marker = useAnimatedStyle(() => ({
    opacity: interpolate(
      clock.value,
      [0, 0.58, 0.64, 0.68, 0.72, 0.76, 1],
      [0, 0, 1, 0.2, 1, 0, 0],
    ),
  }));

  const nodes = pathNodes(way, access, bankId, pal, t);
  const message = known
    ? t('firstCatch.stuck.alertSkipped')
    : way === 'alerts'
      ? t(access ? 'firstCatch.stuck.alertsAccess' : 'firstCatch.stuck.alerts')
      : t(way === 'wallet' ? 'firstCatch.stuck.wallet' : 'firstCatch.stuck.share');
  const fix =
    way === 'share'
      ? { label: t('firstCatch.fix.share'), icon: 'ios_share' as const }
      : way === 'alerts' && access
        ? { label: t('firstCatch.fix.access'), icon: 'notifications' as const }
        : { label: t('firstCatch.fix.shortcut'), icon: 'bolt' as const };

  return (
    <Animated.View
      entering={riseEntering(300, 0, reduceMotion, 14)}
      style={{
        borderRadius: 26,
        backgroundColor: pal.cell,
        boxShadow: pal.cardShadow,
        paddingTop: 22,
        paddingHorizontal: 18,
        paddingBottom: 18,
        gap: 18,
      }}
    >
      <View style={{ height: 86 }}>
        <View
          style={{
            position: 'absolute',
            left: NODE / 2,
            right: NODE / 2,
            top: 27,
            height: 2,
            flexDirection: 'row',
          }}
        >
          <View style={{ flex: 1, backgroundColor: pal.inkSoft, opacity: 0.68 }} />
          <DashedHop color={known ? pal.inkSoft : catchInk.warm} solid={known} />
        </View>
        <View
          style={{ position: 'absolute', left: NODE / 2, right: NODE / 2, top: 22, height: 12 }}
        >
          <Animated.View
            style={[
              {
                position: 'absolute',
                top: 0,
                width: 12,
                height: 12,
                marginLeft: -6,
                borderRadius: 6,
                backgroundColor: pal.ink,
                boxShadow: `0 0 12px ${pal.ink}`,
              },
              dot,
            ]}
          />
        </View>
        {known ? (
          <Animated.View
            style={[
              {
                position: 'absolute',
                right: NODE / 2 - 12,
                top: 12,
                width: 24,
                height: 24,
                borderRadius: 12,
                backgroundColor: catchInk.warm,
                boxShadow: `0 0 0 4px ${pal.cell}`,
                alignItems: 'center',
                justifyContent: 'center',
              },
              marker,
            ]}
          >
            {/* The app ships no priority_high glyph: the mark is drawn as the design's "!". */}
            <Text style={{ ...body(16, 800), color: catchInk.onWarm }}>!</Text>
          </Animated.View>
        ) : null}
        <View
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: 0,
            flexDirection: 'row',
            justifyContent: 'space-between',
          }}
        >
          {nodes.map((node, n) => (
            <View key={n} style={{ alignItems: 'center', gap: 8, width: NODE }}>
              {node.tile}
              <Text
                numberOfLines={1}
                style={{
                  ...body(11.5, 600),
                  color: pal.inkSoft,
                  opacity: n === nodes.length - 1 ? 0.68 : 1,
                  width: 96,
                  textAlign: 'center',
                }}
              >
                {node.label}
              </Text>
            </View>
          ))}
        </View>
      </View>
      <Text style={{ ...body(15, 550), lineHeight: 21, color: pal.ink }}>{message}</Text>
      <View style={{ flexDirection: 'row', gap: 8 }}>
        <PressScale
          scaleTo={0.96}
          accessibilityRole="button"
          onPress={onFix}
          style={{
            flex: 1,
            height: 44,
            borderRadius: 99,
            backgroundColor: pal.btnBg,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
          }}
        >
          <Symbol name={fix.icon} size={18} color={pal.btnFg} />
          <Text numberOfLines={1} style={{ ...body(14.5, 650), color: pal.btnFg }}>
            {fix.label}
          </Text>
        </PressScale>
        <PressScale
          scaleTo={0.96}
          accessibilityRole="button"
          onPress={onAnother}
          style={{
            height: 44,
            paddingHorizontal: 16,
            borderRadius: 99,
            backgroundColor: pal.chipBg,
            justifyContent: 'center',
          }}
        >
          <Text numberOfLines={1} style={{ ...body(14.5, 600), color: pal.ink }}>
            {t('firstCatch.another')}
          </Text>
        </PressScale>
      </View>
    </Animated.View>
  );
}

/** The path's last hop: dashed while 6pm cannot tell whether it got through. */
function DashedHop({ color, solid }: { readonly color: string; readonly solid: boolean }) {
  if (solid) return <View style={{ flex: 1, backgroundColor: color, opacity: 0.68 }} />;
  return (
    <View style={{ flex: 1, flexDirection: 'row', overflow: 'hidden', gap: 5 }}>
      {Array.from({ length: 24 }, (_, k) => (
        <View key={k} style={{ width: 5, height: 2, backgroundColor: color }} />
      ))}
    </View>
  );
}

interface PathNode {
  readonly tile: ReactNode;
  readonly label: string;
}

function iconTile(icon: SymbolName, pal: OnboardingPalette, background?: string): ReactNode {
  return (
    <View
      style={{
        width: NODE,
        height: NODE,
        borderRadius: 16,
        backgroundColor: background ?? pal.chipBg,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Symbol name={icon} size={28} color={background ? catchInk.onTile : pal.ink} />
    </View>
  );
}

function pathNodes(
  way: ListenWay,
  access: boolean,
  bankId: string | null,
  pal: OnboardingPalette,
  t: ReturnType<typeof useI18n>['t'],
): readonly PathNode[] {
  const shortcut: PathNode = {
    tile: (
      <View
        style={{
          width: NODE,
          height: NODE,
          borderRadius: 16,
          experimental_backgroundImage: catchInk.shortcutTile,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Symbol name="bolt" size={28} color={catchInk.onTile} />
      </View>
    ),
    label: t('firstCatch.path.shortcut'),
  };
  const app: PathNode = {
    tile: (
      <View style={{ width: NODE, height: NODE, borderRadius: 16, backgroundColor: pal.cell }}>
        <View
          style={{
            width: NODE,
            height: NODE,
            borderRadius: 16,
            experimental_backgroundImage: catchInk.appTile,
            alignItems: 'center',
            justifyContent: 'center',
            opacity: 0.45,
          }}
        >
          <Text style={{ ...display(15, 700), color: catchInk.onTile }}>
            {t('firstCatch.path.app')}
          </Text>
        </View>
      </View>
    ),
    label: t('firstCatch.path.app'),
  };
  if (way === 'alerts') {
    const bank: PathNode = {
      tile:
        bankId !== null ? (
          <BankLogo id={bankId} size={NODE} radius={16} neutral={pal.chipBg} neutralInk={pal.ink} />
        ) : (
          iconTile('account_balance', pal)
        ),
      label: t('firstCatch.path.alert'),
    };
    const middle = access
      ? { tile: iconTile('notifications', pal), label: t('firstCatch.path.access') }
      : shortcut;
    return [bank, middle, app];
  }
  if (way === 'wallet') {
    return [
      {
        tile: iconTile('contactless', pal, catchInk.walletTile),
        label: t('firstCatch.path.wallet'),
      },
      shortcut,
      app,
    ];
  }
  return [
    { tile: iconTile('receipt_long', pal), label: t('firstCatch.path.receipt') },
    { tile: iconTile('ios_share', pal), label: t('firstCatch.path.share') },
    app,
  ];
}
