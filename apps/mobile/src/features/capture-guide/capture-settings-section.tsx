import { useState } from 'react';
import { Text, View } from 'react-native';
import Animated, { useReducedMotion } from 'react-native-reanimated';

import { addDays, localDateOf } from '@6pm/domain';
import { localeOf } from '@6pm/i18n';
import { catchInk } from '@6pm/theme';

import { useI18n, type I18n } from '../../i18n/i18n';
import { haptics } from '../../ui/haptics';
import { Symbol } from '../../ui/icons/symbol';
import type { SymbolName } from '../../ui/icons/symbols.generated';
import { PressScale } from '../../ui/primitives/press-scale';
import { useTheme } from '../../ui/theme/theme';
import { body } from '../../ui/type/fonts';
import { riseEntering } from '../onboarding/onboarding-motion';
import { nativeReach } from '../surfaces/native-reach';
import { captureColours } from './capture-colours';
import { CaptureLogCard } from './capture-log-card';
import { shortDate } from './capture-log-tape';
import { HEALTH_GUIDE, rowRuns, type HealthRow, type HealthWay } from './capture-health-rows';
import { HeartbeatAxis, HeartbeatStrip } from './heartbeat-strip';
import type { CaptureSource } from './source-status';
import { useCaptureHealthSection } from './use-capture-health';

const ICON: Readonly<Record<HealthWay, SymbolName>> = {
  scan: 'qr_code_scanner',
  share: 'ios_share',
  alerts: 'notifications',
  email: 'mail',
  voice: 'mic',
  wallet: 'contactless',
};

/** The icon tile, its gap and the row's inset: where a row's words start, for the hairline. */
const TEXT_INSET = 14 + 32 + 12;

/**
 * Settings' "How spending gets caught": a row per way with its last catch in words and its last
 * 14 days as a heartbeat (a bar a day that caught something, as tall as its count; a dot a day
 * that caught nothing; today in the accent), the ways that run ordered by their last catch. A way
 * that is not set up has a "Set up" button where the strip would be, under a hairline at the
 * foot. A way that runs by itself and went flat after a busy fortnight says so in the warm tone,
 * opens itself once with why and a way to check it, and outlines its quiet days. Counted on the
 * phone. The capture log sits at the foot of the section.
 */
export function CaptureSettingsSection({
  onOpen,
}: {
  readonly onOpen: (source: CaptureSource) => void;
}) {
  const { palette } = useTheme();
  const { t, language } = useI18n();
  const { rows, total, from } = useCaptureHealthSection();
  // A quiet way opens itself the first time Settings shows it; a tap closes it.
  const [closed, setClosed] = useState<ReadonlySet<HealthWay>>(new Set());
  const firstSetUp = rows.findIndex((row) => !rowRuns(row));
  const anyRunning = firstSetUp !== 0 && rows.length > 0;
  const upper = (text: string) => text.toLocaleUpperCase(localeOf(language));
  return (
    <View style={{ gap: 8 }}>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'baseline',
          gap: 10,
          paddingHorizontal: 6,
        }}
      >
        <Text
          accessibilityRole="header"
          numberOfLines={1}
          style={{
            ...body(13, 600, 0.04),
            textTransform: 'uppercase',
            color: palette.inkSoft,
            flexShrink: 1,
          }}
        >
          {t('capture.settings.title')}
        </Text>
        <Text numberOfLines={1} style={{ ...body(13), color: palette.inkSoft }}>
          {t('catch.health.total', { count: total })}
        </Text>
      </View>
      <View
        style={{
          borderRadius: 26,
          backgroundColor: palette.cell,
          boxShadow: palette.cardShadow,
          overflow: 'hidden',
        }}
      >
        {anyRunning ? (
          <View style={{ paddingTop: 12, paddingHorizontal: 14 }}>
            <HeartbeatAxis
              first={upper(shortDate(`${from}T12:00:00`, language))}
              today={t('catch.health.axisToday')}
            />
          </View>
        ) : null}
        {rows.map((row, n) => (
          <View key={row.way}>
            {n === firstSetUp && n > 0 ? (
              <View
                style={{
                  marginLeft: TEXT_INSET,
                  borderTopWidth: 0.5,
                  borderTopColor: palette.hair,
                }}
              />
            ) : null}
            <HealthRowView
              row={row}
              first={n === 0 || n === firstSetUp}
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
          </View>
        ))}
      </View>
      {/* The log is its own card, a little apart from the ways it follows. */}
      <View style={{ marginTop: 6 }}>
        <CaptureLogCard />
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 7, paddingHorizontal: 6 }}>
        <Symbol name="lock" size={15} color={palette.inkSoft} />
        <Text style={{ ...body(12.5), color: palette.inkSoft, flex: 1 }}>
          {t('captureLog.private')}
        </Text>
      </View>
    </View>
  );
}

/** "Today 12:10", "Yesterday 21:05", then the day and its date: "Mon 9 Nov · 15:05". */
function whenOf(at: string, today: string, i18n: I18n): string {
  const instant = new Date(at);
  const day = localDateOf(instant);
  const time = new Intl.DateTimeFormat(localeOf(i18n.language), {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(instant);
  if (day === today) return i18n.t('catch.health.at.today', { time });
  if (day === addDays(today, -1)) return i18n.t('catch.health.at.yesterday', { time });
  return `${i18n.weekdayDate(instant)} · ${time}`;
}

/** The words under a way's name, and the tone they are said in. */
function subOf(row: HealthRow, today: string, i18n: I18n): { text: string; tone: 'soft' | 'warn' } {
  const { state } = row;
  switch (state.kind) {
    case 'quiet':
      return { text: i18n.t('catch.health.quietCheck', { count: state.quiet.days }), tone: 'warn' };
    case 'caught':
      return { text: whenOf(state.at, today, i18n), tone: 'soft' };
    case 'off':
      return {
        text: row.way === 'email' ? i18n.t('receiptEmail.deviceMode') : i18n.t('catch.health.off'),
        tone: 'soft',
      };
    case 'notSetUp':
      return {
        text:
          row.way === 'wallet'
            ? i18n.t('catch.health.setUpWhy.wallet')
            : row.way === 'email'
              ? i18n.t('catch.health.setUpWhy.email')
              : i18n.t('catch.health.setUpWhy.alerts'),
        tone: 'soft',
      };
    case 'ready':
      return { text: i18n.t('catch.health.ready'), tone: 'soft' };
  }
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
  // Days are counted on the phone's calendar for the words, as the catch's own time is.
  const calendarToday = localDateOf(new Date());
  const reduceMotion = useReducedMotion();
  const colours = captureColours(palette);
  const { state } = row;
  const runs = rowRuns(row);
  const name =
    row.way === 'alerts' && row.bank
      ? t('catch.health.name.alertsFrom', { bank: row.bank })
      : t(`catch.health.name.${row.way}`);
  const sub = subOf(row, calendarToday, i18n);
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
      style={{
        paddingHorizontal: 14,
        backgroundColor: open ? (palette.dark ? catchInk.warmWash : colours.warnBg) : 'transparent',
      }}
    >
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 12,
          paddingVertical: 10,
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
        <View style={{ flex: 1, minWidth: 0, gap: 2 }}>
          <Text numberOfLines={1} style={{ ...body(16), color: palette.ink }}>
            {name}
          </Text>
          <Text
            numberOfLines={1}
            style={{ ...body(12.5), color: sub.tone === 'warn' ? colours.warn : palette.inkSoft }}
          >
            {sub.text}
          </Text>
        </View>
        {runs ? (
          <View accessible accessibilityLabel={t('catch.health.lastDays')}>
            <HeartbeatStrip
              beats={row.beats}
              quietDays={state.kind === 'quiet' ? state.quiet.days : 0}
            />
          </View>
        ) : (
          <PressScale
            scaleTo={0.95}
            accessibilityRole="button"
            onPress={onCheck}
            hitSlop={6}
            style={{
              height: 30,
              paddingHorizontal: 12,
              justifyContent: 'center',
            }}
          >
            {/* The dashed outline in the ink at 40 %, the button's words at full ink. */}
            <View
              pointerEvents="none"
              style={{
                position: 'absolute',
                top: 0,
                right: 0,
                bottom: 0,
                left: 0,
                borderRadius: 99,
                borderWidth: 1.2,
                borderStyle: 'dashed',
                borderColor: palette.ink,
                opacity: 0.4,
              }}
            />
            <Text style={{ ...body(13, 650), color: palette.ink }}>{t('catch.health.setUp')}</Text>
          </PressScale>
        )}
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
