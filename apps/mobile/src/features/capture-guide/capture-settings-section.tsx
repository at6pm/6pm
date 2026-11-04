import { useState } from 'react';
import { Text, View } from 'react-native';
import Animated, { useReducedMotion } from 'react-native-reanimated';

import { addDays, diffDays, localDateOf } from '@6pm/domain';
import { localeOf } from '@6pm/i18n';

import { useMoney } from '../../data/money-provider';
import { useI18n, type I18n } from '../../i18n/i18n';
import { haptics } from '../../ui/haptics';
import { Symbol } from '../../ui/icons/symbol';
import type { SymbolName } from '../../ui/icons/symbols.generated';
import { PressScale } from '../../ui/primitives/press-scale';
import { useTheme } from '../../ui/theme/theme';
import { body, mono } from '../../ui/type/fonts';
import { riseEntering } from '../onboarding/onboarding-motion';
import { nativeReach } from '../surfaces/native-reach';
import { captureColours } from './capture-colours';
import { HEALTH_GUIDE, type HealthRow, type HealthWay } from './capture-health-rows';
import type { CaptureSource } from './source-status';
import { useCaptureHealth } from './use-capture-health';

const ICON: Readonly<Record<HealthWay, SymbolName>> = {
  scan: 'qr_code_scanner',
  share: 'ios_share',
  alerts: 'notifications',
  email: 'mail',
  voice: 'mic',
  wallet: 'contactless',
};

/**
 * Settings' "How spending gets caught": a row per way with its last 14 days as a heartbeat (a bar
 * a day, as tall as that day's catches) and where it stands. A way that runs by itself and went
 * flat after a busy fortnight says so in the warm tone, opens itself once with why and a way to
 * check it, and outlines its quiet days. Each other row opens its guide. Counted on the phone.
 */
export function CaptureSettingsSection({
  onOpen,
}: {
  readonly onOpen: (source: CaptureSource) => void;
}) {
  const { palette } = useTheme();
  const { t } = useI18n();
  const rows = useCaptureHealth();
  // A quiet way opens itself the first time Settings shows it; a tap closes it.
  const [closed, setClosed] = useState<ReadonlySet<HealthWay>>(new Set());
  const kicker = { ...mono(10, 500, 0.12), color: palette.inkSoft } as const;
  return (
    <View style={{ gap: 10 }}>
      <Text
        accessibilityRole="header"
        style={{
          ...body(13, 600, 0.04),
          textTransform: 'uppercase',
          color: palette.inkSoft,
          paddingHorizontal: 6,
        }}
      >
        {t('capture.settings.title')}
      </Text>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 6 }}>
        <Text style={kicker}>{t('catch.health.lastDays')}</Text>
        <Text style={kicker}>{t('catch.health.today')}</Text>
      </View>
      <View
        style={{
          borderRadius: 26,
          backgroundColor: palette.cell,
          boxShadow: palette.cardShadow,
          overflow: 'hidden',
        }}
      >
        {rows.map((row, n) => (
          <HealthRowView
            key={row.way}
            row={row}
            first={n === 0}
            open={row.state.kind === 'quiet' && !closed.has(row.way)}
            onPress={() => {
              haptics.tick();
              if (row.state.kind === 'quiet') {
                setClosed((ways) => {
                  const next = new Set(ways);
                  if (next.has(row.way)) next.delete(row.way);
                  else next.add(row.way);
                  return next;
                });
              } else if (row.way !== 'voice' || nativeReach.siri) {
                onOpen(HEALTH_GUIDE[row.way]);
              }
            }}
            onCheck={() => {
              haptics.tick();
              onOpen(HEALTH_GUIDE[row.way]);
            }}
          />
        ))}
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 6 }}>
        <Symbol name="lock" size={15} color={palette.inkSoft} />
        <Text style={{ ...body(12), color: palette.inkSoft }}>{t('catch.health.private')}</Text>
      </View>
    </View>
  );
}

/** "Today 12:10", "Yesterday 16:40", "Mon 12:10", or "3 Oct" further back. */
function whenOf(at: string, today: string, i18n: I18n): string {
  const day = localDateOf(new Date(at));
  const time = new Intl.DateTimeFormat(localeOf(i18n.language), {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(new Date(at));
  if (day === today) return i18n.t('catch.health.at.today', { time });
  if (day === addDays(today, -1)) return i18n.t('catch.health.at.yesterday', { time });
  if (diffDays(today, day) < 7) {
    const weekday = new Intl.DateTimeFormat(localeOf(i18n.language), { weekday: 'short' });
    return `${weekday.format(new Date(at))} ${time}`;
  }
  return i18n.dayMonth(new Date(at));
}

function HealthRowView({
  row,
  first,
  open,
  onPress,
  onCheck,
}: {
  readonly row: HealthRow;
  readonly first: boolean;
  readonly open: boolean;
  readonly onPress: () => void;
  readonly onCheck: () => void;
}) {
  const { palette } = useTheme();
  const i18n = useI18n();
  const { t } = i18n;
  const { today } = useMoney();
  const reduceMotion = useReducedMotion();
  const colours = captureColours(palette);
  const { state } = row;
  const quietDays = state.kind === 'quiet' ? state.quiet.days : 0;
  const name =
    row.way === 'alerts' && row.bank
      ? t('catch.health.name.alertsFrom', { bank: row.bank })
      : t(`catch.health.name.${row.way}`);
  const status =
    state.kind === 'quiet'
      ? t('catch.health.quietFor', { count: state.quiet.days })
      : state.kind === 'caught'
        ? whenOf(state.at, today, i18n)
        : state.kind === 'off'
          ? t('catch.health.off')
          : state.kind === 'notSetUp'
            ? t('catch.health.notSetUp')
            : t('catch.health.ready');
  const statusInk =
    state.kind === 'quiet'
      ? colours.warn
      : state.kind === 'off' || state.kind === 'notSetUp'
        ? palette.accent
        : palette.inkSoft;
  const via =
    row.way === 'alerts' && nativeReach.alertListener
      ? 'access'
      : row.way === 'email'
        ? 'email'
        : 'shortcut';
  return (
    <PressScale
      highlight
      accessibilityRole="button"
      accessibilityState={{ expanded: open }}
      onPress={onPress}
      style={{ paddingHorizontal: 14, backgroundColor: open ? colours.warnBg : 'transparent' }}
    >
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 12,
          paddingVertical: 12,
          borderTopWidth: 0.5,
          borderTopColor: first ? 'transparent' : palette.hair,
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
          <Symbol name={ICON[row.way]} size={19} color={palette.ink} />
        </View>
        <View style={{ flex: 1, minWidth: 0, gap: 6 }}>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'baseline',
              gap: 8,
            }}
          >
            <Text numberOfLines={1} style={{ ...body(15.5), color: palette.ink, flexShrink: 1 }}>
              {name}
            </Text>
            <Text numberOfLines={1} style={{ ...body(12, 650), color: statusInk }}>
              {status}
            </Text>
          </View>
          <View
            accessible
            accessibilityLabel={t('catch.health.lastDays')}
            style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 3, height: 16 }}
          >
            {row.beats.map((count, k) => (
              <View
                key={k}
                style={{
                  flex: 1,
                  height: count ? Math.min(16, 4 + count * 4) : 4,
                  borderRadius: 2,
                  backgroundColor: count ? palette.inkSoft : palette.chipBg,
                  borderWidth: !count && k >= row.beats.length - quietDays ? 1 : 0,
                  borderColor: colours.warn,
                }}
              />
            ))}
          </View>
        </View>
      </View>
      {open && state.kind === 'quiet' ? (
        <Animated.View
          entering={riseEntering(250, 0, reduceMotion, 8)}
          style={{ paddingLeft: 44, paddingBottom: 14, gap: 10 }}
        >
          <Text style={{ ...body(13.5), lineHeight: 18.9, color: colours.warn }}>
            {`${t('catch.health.quiet', { days: state.quiet.days, count: state.quiet.catches })} ${t(`catch.health.why.${via}`)}`}
          </Text>
          <PressScale
            scaleTo={0.96}
            accessibilityRole="button"
            onPress={onCheck}
            style={{
              alignSelf: 'flex-start',
              height: 34,
              paddingHorizontal: 14,
              borderRadius: 99,
              backgroundColor: palette.btnBg,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 5,
            }}
          >
            <Symbol
              name={via === 'email' ? 'mail' : via === 'access' ? 'notifications' : 'bolt'}
              size={16}
              color={palette.btnFg}
            />
            <Text style={{ ...body(13, 650), color: palette.btnFg }}>
              {t(`catch.health.check.${via}`)}
            </Text>
          </PressScale>
        </Animated.View>
      ) : null}
    </PressScale>
  );
}
