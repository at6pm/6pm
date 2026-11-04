import { useEffect } from 'react';
import { Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';

import {
  SET_ASIDE_REASONS,
  type ImportApp,
  type ImportSummary,
  type SetAsideReason,
} from '@6pm/domain';
import { curves, importInk } from '@6pm/theme';

import { useI18n } from '../../i18n/i18n';
import { useTheme } from '../../ui/theme/theme';
import { body, display, mono, tabular } from '../../ui/type/fonts';
import { FileCard, ImportFoot, PillButton } from './import-parts';
import { useCount, useMonthLabel } from './import-format';

const enter = Easing.bezier(...curves.enter);
const STACK_MS = 600;
const STACK_STAGGER = 70;

/** Paper ruled every 4 pt: the year's spending, a stack of slips. */
function Slips({ flex }: { readonly flex: number }) {
  return (
    <View
      style={{
        flex,
        borderRadius: 1,
        backgroundColor: importInk.paper,
        overflow: 'hidden',
        justifyContent: 'flex-end',
        gap: 3,
      }}
    >
      {Array.from({ length: 40 }, (_, i) => (
        <View key={i} style={{ height: 1, backgroundColor: importInk.paperLine }} />
      ))}
    </View>
  );
}

/** One year as a stack of paper, money in on top in green; it grows up from the baseline. */
function YearStack({
  year,
  spending,
  moneyIn,
  most,
  index,
}: {
  readonly year: string;
  readonly spending: number;
  readonly moneyIn: number;
  readonly most: number;
  readonly index: number;
}) {
  const { palette } = useTheme();
  const { t } = useI18n();
  const count = useCount();
  const reduceMotion = useReducedMotion();
  const grow = useSharedValue(reduceMotion ? 1 : 0);
  useEffect(() => {
    if (reduceMotion) return;
    grow.value = withDelay(
      index * STACK_STAGGER,
      withTiming(1, { duration: STACK_MS, easing: enter }),
    );
  }, [grow, index, reduceMotion]);
  const total = spending + moneyIn;
  const height = Math.round(30 + (total / Math.max(1, most)) * 110);
  // Scaled from the baseline: the stack's foot stays put while it grows.
  const style = useAnimatedStyle(() => ({
    opacity: reduceMotion ? grow.value : 1,
    transform: [{ translateY: (height * (1 - grow.value)) / 2 }, { scaleY: grow.value }],
  }));
  return (
    <View
      accessible
      accessibilityLabel={t('import.box.year', {
        year,
        spending: count(spending),
        moneyIn: count(moneyIn),
      })}
      style={{ flex: 1, height: '100%', alignItems: 'center', justifyContent: 'flex-end', gap: 5 }}
    >
      <Text style={{ ...body(10.5, 650), ...tabular, color: palette.inkSoft }}>{count(total)}</Text>
      <Animated.View style={[{ width: '100%', height, gap: 1.5 }, style]}>
        {moneyIn > 0 ? (
          <View
            style={{
              flex: moneyIn,
              borderTopLeftRadius: 3,
              borderTopRightRadius: 3,
              borderBottomLeftRadius: 1,
              borderBottomRightRadius: 1,
              backgroundColor: importInk.moneyIn,
            }}
          />
        ) : null}
        {spending > 0 ? <Slips flex={spending} /> : null}
      </Animated.View>
      <Text
        style={{ ...mono(9.5), color: palette.inkSoft, opacity: 0.82 }}
      >{`'${year.slice(2)}`}</Text>
    </View>
  );
}

/** A slip falling into the bin, as the set-aside lines do last. */
function FallingSlip({
  left,
  top,
  width,
  rotate,
  opacity,
  delay,
}: {
  readonly left: number;
  readonly top: number;
  readonly width: number;
  readonly rotate: number;
  readonly opacity: number;
  readonly delay: number;
}) {
  const reduceMotion = useReducedMotion();
  const t = useSharedValue(reduceMotion ? 1 : 0);
  useEffect(() => {
    if (reduceMotion) return;
    // binDrop: still for the first 40%, falls by 80%.
    t.value = withDelay(delay + 480, withTiming(1, { duration: 480, easing: enter }));
  }, [delay, reduceMotion, t]);
  const style = useAnimatedStyle(() => ({
    opacity: opacity * Math.min(1, t.value * 1.6),
    transform: [{ translateY: -60 * (1 - t.value) }, { rotate: `${rotate}deg` }],
  }));
  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          left,
          top,
          width,
          height: 12,
          borderRadius: 2,
          backgroundColor: importInk.paper,
        },
        style,
      ]}
    />
  );
}

/** "126 moves between your own accounts · 18 balance fixes · 40 already in 6pm". */
function setAsideLine(
  summary: ImportSummary,
  t: ReturnType<typeof useI18n>['t'],
  count: (n: number) => string,
): string {
  const words: Record<SetAsideReason, (n: number) => string> = {
    ownMove: (n) => t('import.box.ownMoves', { count: n, n: count(n) }),
    balanceFix: (n) => t('import.box.balanceFixes', { count: n, n: count(n) }),
    debt: (n) => t('import.box.debts', { count: n, n: count(n) }),
    failed: (n) => t('import.box.failed', { count: n, n: count(n) }),
    otherCurrency: (n) => t('import.box.otherCurrency', { n: count(n) }),
  };
  const parts = SET_ASIDE_REASONS.filter((r) => summary.setAside[r] > 0).map((r) =>
    words[r](summary.setAside[r]),
  );
  if (summary.alreadyIn > 0) parts.push(t('import.box.alreadyIn', { n: count(summary.alreadyIn) }));
  return parts.join(' · ');
}

/**
 * "What's in the box": how many receipts, from which app and when, each year as a stack of paper
 * (money in on top), and what was set aside and not counted: own moves, balance fixes and the like.
 */
export function ImportBox({
  summary,
  app,
  ext,
  onNext,
}: {
  readonly summary: ImportSummary;
  readonly app: ImportApp;
  readonly ext: string;
  readonly onNext: () => void;
}) {
  const { palette } = useTheme();
  const { t } = useI18n();
  const count = useCount();
  const months = useMonthLabel();
  const total = summary.rows.length;
  const most = Math.max(1, ...summary.years.map((y) => y.spending + y.moneyIn));
  const appName = t(`import.app.${app}`);
  const from = summary.first ? months.short(summary.first) : '';
  const to = summary.last ? months.short(summary.last) : '';
  const aside = summary.setAsideTotal + summary.alreadyIn;
  return (
    <View style={{ flex: 1 }}>
      <View style={{ flex: 1, paddingTop: 4, paddingHorizontal: 16, gap: 14 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 4 }}>
          <FileCard ext={ext} tilt={-6} />
          <View style={{ flexShrink: 1 }}>
            <Text style={{ ...display(38, 500, -0.03), lineHeight: 38, color: palette.ink }}>
              {t('import.box.count', { count: total, n: count(total) })}
            </Text>
            {total > 0 ? (
              <Text style={{ ...body(13), color: palette.inkSoft }}>
                {from === to
                  ? t('import.box.fromOne', { app: appName, month: from })
                  : t('import.box.from', { app: appName, from, to })}
              </Text>
            ) : null}
          </View>
        </View>
        {total > 0 ? (
          <View
            style={{
              borderRadius: 24,
              backgroundColor: palette.cell,
              boxShadow: palette.cardShadow,
              paddingTop: 16,
              paddingHorizontal: 14,
              paddingBottom: 12,
              gap: 10,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 8, height: 170 }}>
              {summary.years.map((y, i) => (
                <YearStack key={y.year} {...y} most={most} index={i} />
              ))}
            </View>
            <View
              style={{
                flexDirection: 'row',
                gap: 14,
                paddingTop: 8,
                borderTopWidth: 0.5,
                borderTopColor: palette.hair,
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <View style={{ width: 10, height: 10, borderRadius: 2, overflow: 'hidden' }}>
                  <Slips flex={1} />
                </View>
                <Text style={{ ...body(12, 600), color: palette.inkSoft }}>
                  {t('import.box.spending', { n: count(summary.spending) })}
                </Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <View
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: 2,
                    backgroundColor: importInk.moneyIn,
                  }}
                />
                <Text style={{ ...body(12, 600), color: palette.inkSoft }}>
                  {t('import.box.moneyIn', { n: count(summary.moneyIn) })}
                </Text>
              </View>
            </View>
          </View>
        ) : null}
        {aside > 0 ? (
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 14,
              paddingVertical: 12,
              paddingHorizontal: 14,
              borderRadius: 22,
              backgroundColor: palette.hair,
            }}
          >
            <View style={{ width: 64, height: 52, flexShrink: 0 }}>
              <FallingSlip left={10} top={6} width={40} rotate={8} opacity={0.75} delay={400} />
              <FallingSlip left={14} top={12} width={38} rotate={-6} opacity={0.6} delay={600} />
              <View
                style={{
                  position: 'absolute',
                  left: 4,
                  right: 4,
                  bottom: 0,
                  height: 30,
                  borderTopLeftRadius: 4,
                  borderTopRightRadius: 4,
                  borderBottomLeftRadius: 10,
                  borderBottomRightRadius: 10,
                  backgroundColor: palette.chipBg,
                  borderTopWidth: 2,
                  borderTopColor: palette.inkSoft,
                }}
              />
            </View>
            <View style={{ flex: 1, gap: 3 }}>
              <Text style={{ ...body(13.5, 650), color: palette.ink }}>
                {t('import.box.setAside', { n: count(aside) })}
              </Text>
              <Text style={{ ...body(12.5), lineHeight: 16.9, color: palette.inkSoft }}>
                {setAsideLine(summary, t, count)}
              </Text>
            </View>
          </View>
        ) : null}
        {total === 0 ? (
          <Text
            style={{
              ...body(13.5),
              lineHeight: 18.2,
              color: palette.inkSoft,
              paddingHorizontal: 4,
            }}
          >
            {t('import.box.nothingNewNote')}
          </Text>
        ) : null}
      </View>
      <ImportFoot>
        <PillButton
          enabled={total > 0}
          label={total > 0 ? t('import.box.sort') : t('import.box.nothingNew')}
          onPress={onNext}
        />
      </ImportFoot>
    </View>
  );
}
