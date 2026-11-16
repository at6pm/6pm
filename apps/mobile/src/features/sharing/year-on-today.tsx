import { Canvas, Group, Path, rect, Skia } from '@shopify/react-native-skia';
import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Text, useWindowDimensions, View } from 'react-native';
import {
  Easing,
  ReduceMotion,
  useDerivedValue,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { weekdayMondayFirst, yearCardYear } from '@6pm/domain';
import { curves } from '@6pm/theme';

import { useMoney } from '../../data/money-provider';
import { useI18n } from '../../i18n/i18n';
import { haptics } from '../../ui/haptics';
import { PressScale } from '../../ui/primitives/press-scale';
import { useTheme } from '../../ui/theme/theme';
import { body, display, leading, mono } from '../../ui/type/fonts';
import { yearCardAnyDay } from '../dev/design-streak-seed';
import { useYearCard } from './cards/year-card';
import { shareCardHref, ShareChip } from './share-chip';

const COLUMNS = 53;
const GAP = 1.5;
/** The dots light up left to right on first view, about 700 ms, on the reveal curve. */
const LIGHT_UP = {
  duration: 700,
  easing: Easing.bezier(...curves.enter),
  reduceMotion: ReduceMotion.System,
};

/**
 * Today's Year card, from 20 December to 5 January under tonight's card: the evenings closed this
 * year, a dot for every day, and the quiet chip that shares My year. Never above the number or the
 * close.
 */
export function YearOnToday() {
  const { today } = useMoney();
  const year = yearCardYear(today) ?? (yearCardAnyDay() ? today.slice(0, 4) : null);
  if (year === null) return null;
  return <YearCardOnToday year={year} />;
}

function YearCardOnToday({ year }: { readonly year: string }) {
  const router = useRouter();
  const { palette } = useTheme();
  const { t } = useI18n();
  const data = useYearCard(year);
  // The sheet's 16 pt sides and the card's own: the grid has its height on the first frame.
  const screen = useWindowDimensions().width;
  const [width, setWidth] = useState(screen - 64);
  const lit = useSharedValue(0);
  const ready = data !== null && width > 0;
  useEffect(() => {
    if (ready) lit.set(withTiming(1, LIGHT_UP));
  }, [ready, lit]);

  const cell = width > 0 ? (width - GAP * (COLUMNS - 1)) / COLUMNS : 0;
  const paths = useMemo(() => {
    const on = Skia.Path.Make();
    const off = Skia.Path.Make();
    if (!data || cell <= 0) return { on, off };
    const lead = weekdayMondayFirst(`${year}-01-01`);
    let i = lead;
    for (const month of data.card.months) {
      for (const closed of month.closed) {
        const x = Math.floor(i / 7) * (cell + GAP);
        const y = (i % 7) * (cell + GAP);
        (closed ? on : off).addRRect(Skia.RRectXY(rect(x, y, cell, cell), 1, 1));
        i += 1;
      }
    }
    return { on, off };
  }, [data, cell, year]);
  const height = cell > 0 ? cell * 7 + GAP * 6 : 0;
  const sweep = useDerivedValue(() => rect(0, 0, width * lit.get(), height));

  if (!data) return null;
  return (
    <PressScale
      accessibilityRole="button"
      scaleTo={0.98}
      onPress={() => {
        haptics.tap();
        router.push(shareCardHref('year', year));
      }}
      style={{
        borderRadius: 26,
        overflow: 'hidden',
        backgroundColor: palette.cell,
        boxShadow: palette.cardShadow,
        padding: 16,
        gap: 12,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <Text style={{ ...mono(11, 400, 0.14), color: palette.inkSoft }}>
          {t('shareCards.year.today', { year }).toLocaleUpperCase()}
        </Text>
        <ShareChip card="year" of={year} size="small" label={t('shareCards.chip')} />
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 8 }}>
        <Text style={{ ...leading(display(44, 500, -0.03), 44, true), color: palette.ink }}>
          {String(data.card.closed)}
        </Text>
        <Text style={{ ...body(15), flexShrink: 1, color: palette.inkSoft }}>
          {t('shareCards.year.todaySub')}
        </Text>
      </View>
      <View onLayout={(e) => setWidth(e.nativeEvent.layout.width)} style={{ height }}>
        {width > 0 ? (
          <Canvas style={{ width, height }}>
            <Path path={paths.off} color={palette.chipBg} />
            <Group clip={sweep}>
              <Path path={paths.on} color={palette.accent} />
            </Group>
          </Canvas>
        ) : null}
      </View>
      <Text style={{ ...body(13), color: palette.inkSoft }}>{t('shareCards.year.todayTap')}</Text>
    </PressScale>
  );
}
