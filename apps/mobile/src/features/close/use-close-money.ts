import { useMemo } from 'react';

import { spreadPreview, type SpendRow } from '@6pm/domain';

import { useMoney } from '../../data/money-provider';
import { dayOf } from '../../data/money-store';
import { useI18n } from '../../i18n/i18n';
import { homeCurrencyOf, useMoneyFormat } from '../../money/use-money-format';
import type { CloseCardContent } from './close-card';

/** Money in's card in the close: what it would make of tomorrow, and where Future you stands. */
export function useCloseMoney() {
  const snap = useMoney();
  const { t } = useI18n();
  const money = useMoneyFormat();
  const day = dayOf(snap);
  const currency = homeCurrencyOf(snap.plan);
  const goals = useMemo(
    () => snap.pots.filter((p) => p.kind === 'goal' && p.archivedAt === null),
    [snap.pots],
  );
  const futureYou = goals.reduce((sum, g) => sum + (snap.potSaved[g.id] ?? 0), 0);
  const canSave = goals.length > 0;

  /** The money half of a card for money that came in, or undefined for spending. */
  const cardOf = (spend: SpendRow): CloseCardContent['money'] => {
    if (spend.direction !== 'in' || day === null) return undefined;
    const preview = spreadPreview(day, spend.amount, snap.cycle.daysLeft, currency);
    return {
      asIs: preview.asIs,
      spread: preview.spread,
      asIsLabel: t('moneyIn.card.asIs'),
      spreadLabel: t('moneyIn.card.spread', { count: preview.days }),
      stampSpread: t('moneyIn.stamp.spread'),
      stampFutureYou: t('moneyIn.stamp.futureYou'),
      canSave,
    };
  };

  /** What the Future you pill says while `amount` is lifted to it. */
  const pillFor = (amount: number) => ({
    label: t('moneyIn.pill'),
    from: money.number(futureYou),
    to: money.full(futureYou + amount),
  });

  /** The detail line on the card for the pay's extra: what was kept as the pay. */
  const countedAsPay = t('moneyIn.extra.counted', { amount: money.full(snap.plan?.income ?? 0) });

  return { cardOf, pillFor, canSave, goals, futureYou, countedAsPay };
}
