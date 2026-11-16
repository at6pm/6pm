import { useCallback, useMemo } from 'react';
import { Text, View } from 'react-native';

import { biggestFullJar, setAsideInYear, yearCard, yearCardYear, type YearCard } from '@6pm/domain';
import { localeOf } from '@6pm/i18n';

import { readClosedBetween, useStoreQuery } from '../../../data/diary-queries';
import type { MoneyStore } from '../../../data/money-store';
import { useMoney } from '../../../data/money-provider';
import { readPotMoves } from '../../../data/pot-moves';
import { useI18n } from '../../../i18n/i18n';
import { useMoneyFormat } from '../../../money/use-money-format';
import { mono } from '../../../ui/type/fonts';
import { jarName } from '../../pots/jar-name';
import { defineCard, type CardLayoutProps } from './card-definition';
import { CardGround, CardMark, InkedAmount, ON_CARD, title } from './card-parts';
import { CARD_WIDTH, cardHeight } from './card-size';

const YEAR = /^\d{4}$/;

export interface YearCardData {
  readonly card: YearCard;
  /** JAN … DEC in the phone's language. */
  readonly monthNames: readonly string[];
  readonly setAside: string;
  /** The full jar with the biggest target, or null. */
  readonly biggest: string | null;
}

/** The year the card is about: the one asked for, else the one Today's Year card shows. */
export function yearOfCard(of: string | undefined, today: string): string {
  return of && YEAR.test(of) ? of : (yearCardYear(today) ?? today.slice(0, 4));
}

/** My year, from the same closed evenings the Year book binds, and the jars' moves. */
export function useYearCard(of: string | undefined): YearCardData | null {
  const snap = useMoney();
  const { t, language } = useI18n();
  const money = useMoneyFormat();
  const year = yearOfCard(of, snap.today);
  const read = useCallback(
    async (store: MoneyStore) => ({
      closed: await readClosedBetween(store, `${year}-01-01`, `${year}-12-31`),
      moves: await readPotMoves(store.db),
    }),
    [year],
  );
  const data = useStoreQuery(read, `${year}:${snap.closedDays.length}:${snap.today}`);
  return useMemo(() => {
    if (!data) return null;
    const card = yearCard(year, data.closed);
    const full = biggestFullJar(snap.pots, snap.potSaved);
    const pot = full ? snap.pots.find((p) => p.id === full) : undefined;
    const monthShort = new Intl.DateTimeFormat(localeOf(language), { month: 'short' });
    return {
      card,
      monthNames: card.months.map((m) =>
        monthShort
          .format(new Date(`${m.month}-15T12:00:00`))
          .replace('.', '')
          .toLocaleUpperCase(),
      ),
      setAside: money.short(setAsideInYear(data.moves, year)),
      biggest: pot ? jarName(pot, t) : null,
    };
  }, [data, year, snap, language, money, t]);
}

function YearLayout({ data, format, amounts, inks }: CardLayoutProps<YearCardData>) {
  const { t } = useI18n();
  const story = format === 'story';
  const height = cardHeight(format);
  const { card } = data;
  const r = inks.receipt;
  const text = { ...mono(10, 400), color: r.ink };
  const strong = { ...mono(10, 600), color: r.ink };
  const label = Math.max(26, ...data.monthNames.map((m) => m.length * 6.4));
  const rule = { borderTopWidth: 1, borderColor: r.rule, borderStyle: 'dashed' as const };
  const row = { flexDirection: 'row' as const, justifyContent: 'space-between' as const };
  return (
    <CardGround inks={inks} width={CARD_WIDTH} height={height}>
      <View style={{ flex: 1, paddingTop: 24, paddingHorizontal: 22, paddingBottom: 18, gap: 12 }}>
        <Text {...ON_CARD} numberOfLines={2} style={title(inks, 34, 1)}>
          {t('shareCards.year.title', { year: card.year })}
        </Text>
        <View
          style={{
            flex: 1,
            minHeight: 0,
            transform: [{ rotate: '-1.2deg' }],
            boxShadow: '0 16px 22px rgba(15,5,25,.35)',
          }}
        >
          <View
            style={{
              flex: 1,
              overflow: 'hidden',
              backgroundColor: r.paper,
              paddingVertical: 12,
              paddingHorizontal: 14,
              gap: story ? 5 : 3,
            }}
          >
            <View style={row}>
              <Text {...ON_CARD} style={{ ...mono(10, 600, 0.12), color: r.ink }}>
                {t('shareCards.year.receipt').toLocaleUpperCase()}
              </Text>
              <Text {...ON_CARD} style={{ ...text, opacity: 0.55 }}>
                {t('shareCards.year.no', { year: card.year })}
              </Text>
            </View>
            <View style={rule} />
            {card.months.map((m, i) => {
              const best = m.month === card.best;
              const dots = m.closed.map((lit) => (lit ? '●' : '·')).join('');
              return (
                <View
                  key={m.month}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 8,
                    marginHorizontal: -4,
                    paddingHorizontal: 4,
                    paddingVertical: 1,
                    backgroundColor: best ? r.best : 'transparent',
                  }}
                >
                  <Text {...ON_CARD} style={{ ...strong, width: label }}>
                    {data.monthNames[i]}
                  </Text>
                  <Text
                    {...ON_CARD}
                    numberOfLines={1}
                    ellipsizeMode="clip"
                    style={{ ...text, flex: 1, letterSpacing: -0.5, color: r.soft }}
                  >
                    {dots}
                  </Text>
                  <Text {...ON_CARD} style={{ ...text, width: 22, textAlign: 'right' }}>
                    {m.count > 0 ? String(m.count) : '—'}
                  </Text>
                </View>
              );
            })}
            <View style={rule} />
            <View style={row}>
              <Text {...ON_CARD} style={{ ...strong, fontSize: 11 }}>
                {t('shareCards.year.closed').toLocaleUpperCase()}
              </Text>
              <Text {...ON_CARD} style={{ ...strong, fontSize: 11 }}>
                {String(card.closed)}
              </Text>
            </View>
            <View style={row}>
              <Text {...ON_CARD} style={text}>
                {t('shareCards.year.noSpend').toLocaleUpperCase()}
              </Text>
              <Text {...ON_CARD} style={text}>
                {String(card.noSpend)}
              </Text>
            </View>
            <View style={{ ...row, alignItems: 'center' }}>
              <Text {...ON_CARD} style={text}>
                {t('shareCards.year.setAside').toLocaleUpperCase()}
              </Text>
              <InkedAmount
                text={data.setAside}
                shown={amounts}
                ink={r.ink}
                style={text}
                inset={{ l: -6, r: -2, t: 0, b: 0 }}
                radius={2}
              />
            </View>
            <View style={row}>
              <Text {...ON_CARD} style={text}>
                {t('shareCards.year.biggest').toLocaleUpperCase()}
              </Text>
              <Text
                {...ON_CARD}
                numberOfLines={1}
                style={{ ...text, flexShrink: 1, marginLeft: 12 }}
              >
                {data.biggest
                  ? `${data.biggest.toLocaleUpperCase()} ✓`
                  : t('shareCards.year.none').toLocaleUpperCase()}
              </Text>
            </View>
          </View>
        </View>
        <CardMark inks={inks} path="year" />
      </View>
    </CardGround>
  );
}

export const yearShareCard = defineCard<YearCardData>({
  path: 'year',
  useData: useYearCard,
  hasAmounts: () => true,
  fileKey: (d) => d.card.year,
  Layout: YearLayout,
});
