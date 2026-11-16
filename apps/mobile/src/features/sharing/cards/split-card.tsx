import { useMemo } from 'react';
import { Text, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { cycleMonth, isFutureYouPot, splitShares, type SplitShare } from '@6pm/domain';

import { useMoney } from '../../../data/money-provider';
import { useI18n } from '../../../i18n/i18n';
import { useMoneyFormat } from '../../../money/use-money-format';
import { isSymbolName, Symbol } from '../../../ui/icons/symbol';
import { FitWidth } from '../../../ui/layout/fit-width';
import { body, display } from '../../../ui/type/fonts';
import { usePlanFormat } from '../../plan/plan-format';
import { planJarsOf, planSplitOf } from '../../plan/plan-view';
import { jarName } from '../../pots/jar-name';
import { CardArt } from './card-art';
import { defineCard, type CardLayoutProps } from './card-definition';
import {
  CardGround,
  CardMark,
  glowStyle,
  InkedAmount,
  kicker,
  ON_CARD,
  Rule,
  title,
} from './card-parts';
import { CARD_WIDTH, cardHeight, type ArtBox } from './card-size';
import { jarBoxes } from './jar-art';

/** The canvas's hues for the parts that are not jars: Bills amber, free money the dusk orange. */
const BILLS_HUE = 80;
const FREE_HUE = 45;

export interface SplitJar {
  readonly key: string;
  readonly name: string;
  readonly icon: string;
  readonly hue: number;
  readonly share: SplitShare;
  readonly amount: string;
}

export interface SplitCardData {
  readonly month: string;
  readonly pay: string;
  readonly jars: readonly SplitJar[];
}

/**
 * My split: the pay as jars on a shelf. Bills, Future you, every jar that takes something each
 * payday, and the free money left, each a whole share of the pay (largest remainder, so they add
 * up to 100%).
 */
function useSplitCard(): SplitCardData | null {
  const snap = useMoney();
  const { t } = useI18n();
  const money = useMoneyFormat();
  const format = usePlanFormat(snap.today);
  return useMemo(() => {
    const split = planSplitOf(snap);
    if (!split || !snap.plan) return null;
    const income = snap.plan.income;
    const { jars } = planJarsOf(snap);
    const taking = jars.filter((j) => j.each > 0);
    const intoJars = taking.reduce((sum, j) => sum + j.each, 0);
    const parts = [
      {
        key: 'bills',
        name: t('shareCards.split.bills'),
        icon: 'receipt_long',
        hue: BILLS_HUE,
        amount: split.bills,
      },
      ...taking.map((j) => ({
        key: j.pot.id,
        name: jarName(j.pot, t),
        icon: isFutureYouPot(j.pot) ? 'savings' : j.pot.icon,
        hue: j.pot.hue,
        amount: j.each,
      })),
      {
        key: 'free',
        name: t('shareCards.split.free'),
        icon: 'wb_twilight',
        hue: FREE_HUE,
        amount: Math.max(0, income - split.bills - intoJars),
      },
    ].filter((p) => p.amount > 0);
    const shares = splitShares(parts.map((p) => ({ key: p.key, amount: p.amount })));
    return {
      month: format.monthLong(cycleMonth(snap.cycle)),
      pay: money.short(income),
      jars: parts.map((p, i) => ({
        key: p.key,
        name: p.name,
        icon: p.icon,
        hue: p.hue,
        share: shares[i] ?? { key: p.key, amount: p.amount, percent: 0 },
        amount: money.short(p.amount),
      })),
    };
  }, [snap, t, money, format]);
}

const COLUMN = CARD_WIDTH - 44;
const GAP = 6;
/** The value above each jar. */
const VALUE = 22;

function SplitLayout({ data, format, amounts, inks }: CardLayoutProps<SplitCardData>) {
  const { t } = useI18n();
  const story = format === 'story';
  const height = cardHeight(format);
  const n = data.jars.length;
  const slot = (COLUMN - 4 - GAP * (n - 1)) / n;
  const jarW = Math.min(56, slot);
  const top = Math.max(1, ...data.jars.map((j) => j.share.percent));
  const heightOf = (percent: number) => Math.round(56 + (percent / top) * (story ? 230 : 120));
  const rowH = heightOf(top);
  // The art layer keeps its parsed boxes while their CSS stays the same.
  const boxes: ArtBox[] = data.jars.flatMap((j, i) => {
    const h = heightOf(j.share.percent);
    const x = 2 + i * (slot + GAP) + (slot - jarW) / 2;
    return jarBoxes(inks, inks.jar(i, j.hue), { x, y: rowH - h, w: jarW, h });
  });
  const titleStyle = title(inks, 42, 0.95);
  return (
    <CardGround inks={inks} width={CARD_WIDTH} height={height}>
      <View style={{ flex: 1, paddingTop: 28, paddingHorizontal: 22, paddingBottom: 18, gap: 10 }}>
        <Text {...ON_CARD} style={{ ...kicker(inks, 10.5), color: inks.soft }}>
          {t('shareCards.split.kicker', { month: data.month }).toLocaleUpperCase()}
        </Text>
        {/* One line, as the canvas sets it: a wide face or a long amount scales down to fit. */}
        <FitWidth height={Math.ceil(42 * 0.95) + 2}>
          <View style={{ flexDirection: 'row', alignItems: 'center', columnGap: 8 }}>
            <Text {...ON_CARD} style={titleStyle}>
              {t('shareCards.split.lead')}
            </Text>
            <InkedAmount
              text={data.pay}
              shown={amounts}
              ink={inks.ink}
              style={titleStyle}
              inset={{ l: -4, r: -4, t: 8, b: 4 }}
              radius={6}
            />
            <Text {...ON_CARD} style={{ ...titleStyle, marginLeft: -8 }}>
              {t('shareCards.split.jars', { count: n })}
            </Text>
          </View>
        </FitWidth>
        <View style={{ flex: 1, justifyContent: 'flex-end' }}>
          <View style={{ height: rowH + VALUE }}>
            <CardArt
              boxes={boxes}
              width={COLUMN}
              height={rowH}
              style={{ position: 'absolute', top: VALUE }}
            />
            {data.jars.map((j, i) => {
              const h = heightOf(j.share.percent);
              const jar = inks.jar(i, j.hue);
              const left = 2 + i * (slot + GAP);
              return (
                <View key={j.key} pointerEvents="none">
                  <Animated.Text
                    key={amounts ? 'amount' : 'share'}
                    entering={FadeIn.duration(180)}
                    {...ON_CARD}
                    numberOfLines={1}
                    style={{
                      position: 'absolute',
                      left: left - 6,
                      width: slot + 12,
                      top: rowH - h - 2,
                      textAlign: 'center',
                      ...display(16, inks.lineWeight),
                      ...glowStyle(inks.glow),
                      color: inks.ink,
                    }}
                  >
                    {amounts ? j.amount : `${j.share.percent}%`}
                  </Animated.Text>
                  {jar.glyph !== null && isSymbolName(j.icon) ? (
                    <View
                      style={{
                        position: 'absolute',
                        left,
                        width: slot,
                        top: VALUE + rowH - h + 7,
                        height: h - 7,
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Symbol name={j.icon} size={20} fill={1} color={jar.glyph} />
                    </View>
                  ) : null}
                </View>
              );
            })}
          </View>
        </View>
        {inks.shelf ? (
          <CardArt
            width={CARD_WIDTH - 32}
            height={8}
            boxes={[
              {
                l: 0,
                t: 0,
                w: CARD_WIDTH - 32,
                h: 8,
                r: '3px',
                bg: inks.shelf.bg,
                sh: inks.shelf.sh,
              },
            ]}
            style={{ marginHorizontal: -6 }}
          />
        ) : (
          <Rule rule={inks.rule} />
        )}
        <View style={{ flexDirection: 'row', gap: GAP, paddingHorizontal: 2 }}>
          {data.jars.map((j) => (
            <Text
              key={j.key}
              {...ON_CARD}
              numberOfLines={2}
              style={{
                width: slot,
                textAlign: 'center',
                ...body(10.5, 650),
                lineHeight: 12,
                color: inks.ink,
              }}
            >
              {j.name}
            </Text>
          ))}
        </View>
        <View style={{ paddingTop: 2 }}>
          <CardMark inks={inks} path="split" />
        </View>
      </View>
    </CardGround>
  );
}

export const splitShareCard = defineCard<SplitCardData>({
  path: 'split',
  useData: useSplitCard,
  hasAmounts: () => true,
  fileKey: (d) => String(d.jars.length),
  Layout: SplitLayout,
});
