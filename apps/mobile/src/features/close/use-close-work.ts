import { useCallback, useState } from 'react';

import {
  bankWorkOf,
  isTakings,
  merchantKeyOf,
  workDayOf,
  workIncomeOf,
  workMarkOf,
  type Income,
  type LocalDate,
  type MerchantRuleRow,
  type MoneyInAsk,
  type SpendRow,
  type WorkSetting,
} from '@6pm/domain';

import { useMoney, useMoneyActions, useMoneyStore } from '../../data/money-provider';
import { dayOf, findSpend } from '../../data/money-store';
import { rememberWork } from '../../data/work-actions';
import { workOf } from '../../data/work-money';
import { useI18n } from '../../i18n/i18n';
import { useMoneyFormat } from '../../money/use-money-format';
import { haptics } from '../../ui/haptics';
import type { CloseCardContent } from './close-card';

/** The work stamp on a close card, for someone with work on (`CloseCardContent.work`). */
export type CardWork = NonNullable<CloseCardContent['work']>;

/**
 * What the close leaves out of its cards and asks no question about, for someone with work on:
 * takings already stamped (an "always" bank, a sender remembered as work) go straight to today's
 * takings, and money in is never asked about as a landing of the work's own income.
 */
export function workQueueOf(work: WorkSetting | null, incomes: readonly Income[] | undefined) {
  const workIncome = work === null ? null : workIncomeOf(incomes);
  return {
    card: (spend: SpendRow) => work === null || !isTakings(spend),
    ask: (ask: MoneyInAsk) =>
      !(
        work !== null &&
        ask.kind === 'pay' &&
        workIncome !== null &&
        ask.incomeId === workIncome.id
      ),
  };
}

/**
 * The close's work stamp: offered (dashed) on a card from a "sometimes" bank whose shop or sender
 * is not remembered yet, inked on one that is work, absent where nothing is offered; one tap inks
 * or lifts it and remembers the shop or sender. Keeping a card remembers its answer either way.
 */
export function useCloseWork(remembered: ReadonlyMap<string, MerchantRuleRow>, day: LocalDate) {
  const snap = useMoney();
  const store = useMoneyStore();
  const actions = useMoneyActions();
  const { t } = useI18n();
  const money = useMoneyFormat();
  const work = workOf(snap);
  // What was answered tonight, by shop or sender, over what the phone remembered when it opened.
  const [answered, setAnswered] = useState<ReadonlyMap<string, boolean>>(new Map());
  const [stamped, setStamped] = useState<{ readonly id: string; readonly hint: string } | null>(
    null,
  );

  /** Its bank says it is always work: stamped, and nothing about the shop is remembered. */
  const byBank = (spend: SpendRow) => bankWorkOf(spend.wallet, work?.banks) === 'always';
  const live = (spend: SpendRow) => findSpend(snap, spend.id) ?? spend;

  /** The stamp on a card, and the two lines it swaps between; undefined with nothing offered. */
  const cardWork = (spend: SpendRow, money2: CloseCardContent['money']): CardWork | undefined => {
    if (work === null) return undefined;
    const row = live(spend);
    const mark = workMarkOf({
      work,
      wallet: spend.wallet,
      rule: remembered.get(merchantKeyOf(spend.merchant)),
    });
    if (mark === 'none' && !row.forWork && !answered.has(merchantKeyOf(spend.merchant))) {
      return undefined;
    }
    const inked = row.forWork;
    const takings = workDayOf(snap.cycleSpends, day);
    const toggle = () => toggleOf(row);
    if (spend.direction === 'in') {
      const withThis = takings.takings + (inked ? 0 : spend.amount);
      const perDay = money2 ? Math.max(0, money2.spread - money2.asIs) : 0;
      return {
        inked,
        greys: false,
        yours: {
          label: t('work.close.yoursIn'),
          value: t('work.perDay', { amount: money.number(perDay) }),
        },
        asWork: { label: t('work.close.workIn'), value: money.number(withThis) },
        labels: { inked: t('work.stamp'), offered: t('work.stampOffered') },
        onToggle: toggle,
      };
    }
    const line = dayOf(snap)?.line ?? 0;
    return {
      inked,
      greys: true,
      yours: { label: t('work.close.yoursSpend'), value: money.number(spend.amount) },
      asWork: { label: t('work.close.workSpend'), value: money.number(line) },
      labels: { inked: t('work.stamp'), offered: t('work.stampOffered') },
      onToggle: toggle,
    };
  };

  const toggleOf = (row: SpendRow) => {
    const next = !row.forWork;
    haptics.tap();
    void actions.markForWork(row.id, next);
    if (byBank(row)) return;
    const key = merchantKeyOf(row.merchant);
    if (key !== '') {
      setAnswered((was) => new Map(was).set(key, next));
      void rememberWork(store, row, next);
    }
    const name = row.merchant.trim() || t('moneyIn.name');
    setStamped(
      next
        ? {
            id: row.id,
            hint: t(
              row.direction === 'in' ? 'work.close.rememberedIn' : 'work.close.rememberedShop',
              {
                name,
              },
            ),
          }
        : null,
    );
  };

  /** A card kept: its shop or sender is remembered as it was kept, stamped or not. */
  const kept = useCallback(
    (spend: SpendRow) => {
      if (work === null) return;
      const row = findSpend(store.getSnapshot(), spend.id) ?? spend;
      const key = merchantKeyOf(row.merchant);
      if (key === '' || bankWorkOf(row.wallet, work.banks) === 'always') return;
      const offered =
        workMarkOf({ work, wallet: row.wallet, rule: remembered.get(key) }) !== 'none';
      if (!offered && !row.forWork) return;
      setAnswered((was) => new Map(was).set(key, row.forWork));
      void rememberWork(store, row, row.forWork);
    },
    [work, store, remembered],
  );

  return {
    work,
    cardWork,
    kept,
    /** The hint once a stamp was inked on the top card: what was remembered. */
    hintFor: (id: string | undefined) =>
      stamped !== null && stamped.id === id ? stamped.hint : null,
  };
}
