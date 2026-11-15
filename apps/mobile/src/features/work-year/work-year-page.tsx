import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { Text, View } from 'react-native';
import Animated, {
  FadeIn,
  ReduceMotion,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { WORK_YEAR_LINE, workYearMoment, yearLine, type WorkYear } from '@6pm/domain';
import { localeOf } from '@6pm/i18n';
import { requestInk } from '@6pm/theme';

import { useMoney } from '../../data/money-provider';
import { useI18n } from '../../i18n/i18n';
import { useMoneyFormat } from '../../money/use-money-format';
import { haptics } from '../../ui/haptics';
import { Symbol } from '../../ui/icons/symbol';
import { easeOut } from '../../ui/motion/curves';
import { SheetScreen } from '../../ui/navigation/sheet-screen';
import { PressScale } from '../../ui/primitives/press-scale';
import { useTheme } from '../../ui/theme/theme';
import { body, display, mono, tabular } from '../../ui/type/fonts';
import { OfferedChip } from '../sharing/offered-chip';
import { useWorkYear } from './use-work-year';

const BAR_HEIGHT = 70;
const TICKS = [0.25, 0.5, 0.75] as const;

/** The line's and bars' inks for the look: drawn for a dark sky, in ink on a light sheet. */
const yearInk = (dark: boolean) => (dark ? requestInk : requestInk.onLight);

/**
 * The line: a track to one billion đồng with quarter ticks, filled to the year's figure as it
 * opens (700 ms). Drawn only in đồng, where the line is.
 */
function YearLine({ billed }: { readonly billed: number }) {
  const { palette } = useTheme();
  const { t } = useI18n();
  const money = useMoneyFormat();
  const line = yearLine(billed);
  const ink = yearInk(palette.dark);
  const fill = useSharedValue(0);
  useEffect(() => {
    fill.set(
      withTiming(Math.min(1, line.share), {
        duration: 700,
        easing: easeOut,
        reduceMotion: ReduceMotion.System,
      }),
    );
  }, [fill, line.share]);
  const grow = useAnimatedStyle(() => ({ transform: [{ scaleX: fill.get() }] }));
  const ticks = [0, ...TICKS, 1].map((at) =>
    at === 1 ? money.short(WORK_YEAR_LINE) : at === 0 ? '0' : money.short(WORK_YEAR_LINE * at),
  );
  return (
    <View style={{ paddingHorizontal: 6, gap: 8 }}>
      <View
        style={{
          height: 16,
          borderRadius: 8,
          backgroundColor: ink.track,
          overflow: 'hidden',
        }}
      >
        <Animated.View
          style={[
            {
              position: 'absolute',
              left: 0,
              top: 0,
              bottom: 0,
              width: '100%',
              borderRadius: 8,
              backgroundColor: requestInk.fill,
              transformOrigin: 'left center',
            },
            grow,
          ]}
        />
        {TICKS.map((at) => (
          <View
            key={at}
            style={{
              position: 'absolute',
              left: `${at * 100}%`,
              top: 3,
              bottom: 3,
              width: 1.5,
              backgroundColor: ink.tick,
            }}
          />
        ))}
      </View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        {ticks.map((label, i) => (
          <Text key={i} style={{ ...mono(10, 400, 0.08), color: ink.barLabel }}>
            {label.toLocaleUpperCase()}
          </Text>
        ))}
      </View>
      <Text style={{ ...body(13.5, 600), color: palette.ink }}>
        {line.under > 0
          ? t('workYear.under', { amount: money.short(line.under) })
          : t('workYear.past', { amount: money.short(billed - WORK_YEAR_LINE) })}
        <Text style={{ ...body(13.5, 500), color: palette.inkSoft }}>
          {` · ${t('workYear.percent', { percent: line.percent })}`}
        </Text>
      </Text>
      {line.near ? (
        <Animated.Text
          entering={FadeIn.duration(250)}
          style={{ ...body(13.5), lineHeight: 19, color: palette.inkSoft }}
        >
          {t('workYear.near')}
        </Animated.Text>
      ) : null}
    </View>
  );
}

/** The months that made the year: this month in work ink, months to come dashed. */
function MonthBars({ work, month }: { readonly work: WorkYear; readonly month: number }) {
  const { palette } = useTheme();
  const { language } = useI18n();
  const ink = yearInk(palette.dark);
  const most = Math.max(1, ...work.months);
  const narrow = new Intl.DateTimeFormat(localeOf(language), { month: 'narrow' });
  return (
    <View
      style={{
        borderRadius: 26,
        backgroundColor: palette.cell,
        boxShadow: palette.cardShadow,
        paddingHorizontal: 16,
        paddingTop: 14,
        paddingBottom: 12,
      }}
    >
      <View
        style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 6, height: BAR_HEIGHT + 22 }}
      >
        {work.months.map((billed, i) => {
          const toCome = i > month;
          const height = toCome
            ? BAR_HEIGHT
            : Math.max(billed > 0 ? 4 : 2, (billed / most) * BAR_HEIGHT);
          return (
            <View key={i} style={{ flex: 1, alignItems: 'center', gap: 5 }}>
              <View
                style={{
                  alignSelf: 'stretch',
                  height,
                  borderRadius: 5,
                  backgroundColor: toCome
                    ? 'transparent'
                    : i === month
                      ? requestInk.barNow
                      : ink.bar,
                  borderWidth: toCome ? 1.25 : 0,
                  borderStyle: 'dashed',
                  borderColor: ink.barToCome,
                }}
              />
              <Text style={{ ...mono(9.5), color: ink.barLabel }}>
                {narrow.format(new Date(Date.UTC(work.year, i, 15)))}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

function Row({
  title,
  sub,
  value,
  first = false,
  onPress,
}: {
  readonly title: string;
  readonly sub?: string | undefined;
  readonly value: string;
  readonly first?: boolean;
  readonly onPress?: () => void;
}) {
  const { palette } = useTheme();
  const content = (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginHorizontal: 14,
        paddingVertical: 12,
        borderTopWidth: first ? 0 : 0.5,
        borderTopColor: palette.hair,
      }}
    >
      <View style={{ flex: 1, gap: 2 }}>
        <Text style={{ ...body(15, 600), color: palette.ink }}>{title}</Text>
        {sub ? <Text style={{ ...body(12.5), color: palette.inkSoft }}>{sub}</Text> : null}
      </View>
      <Text style={{ ...body(15, 650), ...tabular, color: palette.ink }}>{value}</Text>
      {onPress ? <Symbol name="chevron_right" size={20} color={palette.inkSoft} /> : null}
    </View>
  );
  if (!onPress) return content;
  return (
    <PressScale scaleTo={0.98} accessibilityRole="button" onPress={onPress}>
      {content}
    </PressScale>
  );
}

/**
 * 8a, your work year: one figure for the year (work money in as billed: landed plus held back),
 * against the one line that matters, then the months that made it. Held back and costs sit under
 * it; kept is what the person lived on. "For whoever files" hands over the list.
 */
export function WorkYearPage() {
  const router = useRouter();
  const { palette } = useTheme();
  const { t } = useI18n();
  const money = useMoneyFormat();
  const snap = useMoney();
  const { year, work, read } = useWorkYear();
  const month = Number(snap.today.slice(5, 7)) - 1;
  const inDong = money.currency.code === 'VND';
  // From 1 December the year is offered as a card, beside the list for whoever files (once).
  const moment = read && work.billed > 0 ? workYearMoment(snap.today) : null;
  return (
    <SheetScreen
      title={t('workYear.title', { year })}
      gap={16}
      footer={
        <View style={{ paddingHorizontal: 16, paddingTop: 10, paddingBottom: 8, gap: 10 }}>
          {moment ? (
            <View style={{ alignItems: 'center' }}>
              <OfferedChip
                moments={[moment]}
                card="workYear"
                of={String(year)}
                size="small"
                label={t('shareCards.chip')}
              />
            </View>
          ) : null}
          <PressScale
            scaleTo={0.97}
            accessibilityRole="button"
            onPress={() => {
              haptics.tap();
              router.push('/year-files');
            }}
            style={{
              height: 56,
              borderRadius: 99,
              backgroundColor: palette.btnBg,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
            }}
          >
            <Symbol name="ios_share" size={20} color={palette.btnFg} />
            <Text style={{ ...body(17, 650), color: palette.btnFg }}>{t('workYear.files')}</Text>
          </PressScale>
        </View>
      }
    >
      <View style={{ paddingHorizontal: 6, gap: 6 }}>
        <Text style={{ ...body(15, 500), color: palette.inkSoft }}>{t('workYear.figure')}</Text>
        <Text
          numberOfLines={1}
          adjustsFontSizeToFit
          style={{ ...display(54, 400, -0.03), ...tabular, color: palette.ink }}
        >
          {money.full(work.billed)}
        </Text>
      </View>
      {read && inDong ? <YearLine billed={work.billed} /> : null}
      {read && work.billed === 0 && work.costs === 0 ? (
        <Text style={{ ...body(15), color: palette.inkSoft, paddingHorizontal: 6 }}>
          {t('workYear.empty')}
        </Text>
      ) : null}
      <MonthBars work={work} month={month} />
      <View
        style={{
          borderRadius: 26,
          backgroundColor: palette.cell,
          boxShadow: palette.cardShadow,
          overflow: 'hidden',
        }}
      >
        <Row
          first
          title={t('workYear.held')}
          sub={
            work.uncertified.count > 0
              ? t('workYear.heldSub', { count: work.uncertified.count })
              : work.heldPayments > 0
                ? t('workYear.heldSubNone')
                : undefined
          }
          value={money.short(work.heldBack)}
          {...(work.heldPayments > 0 ? { onPress: () => router.push('/held-year') } : {})}
        />
        <Row title={t('workYear.costs')} value={money.short(work.costs)} />
        <Row
          title={t('workYear.kept')}
          sub={t('workYear.keptSub')}
          value={money.short(work.kept)}
        />
      </View>
    </SheetScreen>
  );
}
