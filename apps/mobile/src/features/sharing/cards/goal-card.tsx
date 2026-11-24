import { useMemo } from 'react';
import { View } from 'react-native';

import { cycleMonth, isFutureYouPot } from '@6pm/domain';

import { useMoney } from '../../../data/money-provider';
import { useI18n } from '../../../i18n/i18n';
import { useMoneyFormat } from '../../../money/use-money-format';
import { isSymbolName, Symbol } from '../../../ui/icons/symbol';
import { usePlanFormat } from '../../plan/plan-format';
import { jarName } from '../../pots/jar-name';
import { CardArt } from './card-art';
import { defineCard, type CardLayoutProps } from './card-definition';
import { companionLine } from './companion-line';
import { HeroCard } from './hero-card';
import { jarBoxes } from './jar-art';

export interface GoalCardData {
  readonly id: string;
  readonly name: string;
  readonly icon: string;
  readonly hue: number;
  readonly month: string;
  /** What the jar reached, written in full: its target, or what it holds when it has none. */
  readonly amount: string;
  /** The companion's line, from its catalogue. */
  readonly line: string;
}

/** A goal reached: the jar asked for, named with the amount it reached. */
function useGoalCard(of: string | undefined): GoalCardData | null {
  const snap = useMoney();
  const { t } = useI18n();
  const money = useMoneyFormat();
  const format = usePlanFormat(snap.today);
  return useMemo(() => {
    const pot = snap.pots.find((p) => p.id === of);
    if (!pot) return null;
    return {
      id: pot.id,
      name: jarName(pot, t),
      icon: isFutureYouPot(pot) ? 'savings' : pot.icon,
      hue: pot.hue,
      month: format.monthLong(cycleMonth(snap.cycle)),
      amount: money.short(pot.goal > 0 ? pot.goal : (snap.potSaved[pot.id] ?? 0)),
      line: companionLine(t, 'goalCard', snap.plan?.persona),
    };
  }, [snap, of, t, money, format]);
}

/** The full jar, in the look's material, with its glyph. */
function FullJar({
  data,
  inks,
  height,
}: {
  readonly data: GoalCardData;
  readonly inks: CardLayoutProps<GoalCardData>['inks'];
  readonly height: number;
}) {
  const h = height;
  const w = h * 0.6;
  const jar = inks.jar(1, data.hue);
  const boxes = useMemo(() => jarBoxes(inks, jar, { x: 0, y: 0, w, h }, 0.94), [inks, jar, w, h]);
  return (
    <View style={{ width: w, height: h }}>
      <CardArt boxes={boxes} width={w} height={h} style={{ position: 'absolute' }} />
      {jar.glyph !== null && isSymbolName(data.icon) ? (
        <View
          style={{
            position: 'absolute',
            inset: 0,
            paddingTop: h * 0.12,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Symbol name={data.icon} size={Math.round(w * 0.34)} fill={1} color={jar.glyph} />
        </View>
      ) : null}
    </View>
  );
}

function GoalLayout({ data, format, inks, serious, still = false }: CardLayoutProps<GoalCardData>) {
  const { t } = useI18n();
  return (
    <HeroCard
      inks={inks}
      format={format}
      serious={serious}
      still={still}
      kicker={t('shareCards.goal.kicker', { month: data.month })}
      headline={t('shareCards.goal.title', { jar: data.name, amount: data.amount })}
      beside={(height) => <FullJar data={data} inks={inks} height={height} />}
      line={serious ? null : data.line}
      mood="happy"
    />
  );
}

export const goalShareCard = defineCard<GoalCardData>({
  path: 'goal',
  useData: useGoalCard,
  // The amount is the point of the card: it is always printed, so there is no switch.
  hasAmounts: () => false,
  fileKey: (d) => d.id,
  Layout: GoalLayout,
});
