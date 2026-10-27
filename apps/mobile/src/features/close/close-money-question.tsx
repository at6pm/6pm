import { useRef } from 'react';

import {
  moneyQuestion,
  payExtra,
  type CloseEvent,
  type CloseState,
  type GivableSpend,
  type MoneyInAsk,
  type SpendRow,
} from '@6pm/domain';
import { localeOf } from '@6pm/i18n';

import { useMoney, useMoneyActions } from '../../data/money-provider';
import { useI18n } from '../../i18n/i18n';
import { useMoneyFormat } from '../../money/use-money-format';
import { haptics } from '../../ui/haptics';
import { WorkQuestionStep } from './close-work-question';

/**
 * The close's question about money that looks like something: "Is this your pay?", "Is this for
 * your earbuds?" (a refund, the spend struck through as the card rises), or "Lan paying you back
 * for Pizza 4P's?". Yes places it; the pay's extra comes next as a card of its own. No makes it an
 * ordinary money card, to spread or save.
 */
export function MoneyQuestionStep({
  state,
  queue,
  asks,
  givable,
  dispatch,
  run,
}: {
  readonly state: CloseState;
  readonly queue: readonly SpendRow[];
  readonly asks: Readonly<Record<string, MoneyInAsk>>;
  readonly givable: readonly GivableSpend[];
  readonly dispatch: (event: CloseEvent) => void;
  readonly run: (task: () => Promise<unknown>) => Promise<boolean>;
}) {
  const snap = useMoney();
  const actions = useMoneyActions();
  const money = useMoneyFormat();
  const { t, language } = useI18n();
  // One answer per question: a second tap while the pay is being split does nothing.
  const answered = useRef<string | null>(null);
  const card = moneyQuestion(state);
  const spend = card ? queue.find((s) => s.id === card.id) : undefined;
  const ask = card ? asks[card.id] : undefined;
  if (!card || !spend || !ask || !snap.plan) return null;
  const { plan } = snap;
  const locale = localeOf(language);
  const clock = (at: string) =>
    new Intl.DateTimeFormat(locale, { hour: '2-digit', minute: '2-digit', hour12: false }).format(
      new Date(at),
    );
  const dayMonth = (day: string) =>
    new Intl.DateTimeFormat(locale, { day: '2-digit', month: 'short' })
      .format(new Date(`${day}T12:00:00`))
      .toUpperCase();
  const line = (event: 'payQuestion' | 'refundQuestion' | 'paybackQuestion') =>
    plan.serious ? null : t(`companion.${event}.${plan.persona}` as 'companion.payQuestion.soft');
  const from = spend.merchant.trim();
  const incoming = {
    time: clock(spend.at),
    name: from || t('moneyIn.name'),
    amount: spend.amount,
    plus: true,
  };

  const answer = (yes: boolean) => {
    if (answered.current === card.id) return;
    answered.current = card.id;
    haptics.tap();
    if (!yes) {
      dispatch({ type: 'answerMoney', id: card.id, yes: false });
      return;
    }
    if (ask.kind === 'pay') {
      void run(async () => {
        const extra = await actions.keepPay(spend.id, plan.income);
        dispatch({ type: 'answerMoney', id: card.id, yes: true, extra: extra ?? undefined });
      });
      return;
    }
    void run(() => actions.placeMoneyIn(spend.id, { moneyIn: ask.kind, givesBack: ask.spendId }));
    dispatch({ type: 'answerMoney', id: card.id, yes: true });
  };

  if (ask.kind === 'pay') {
    const extra = payExtra(spend.amount, plan.income);
    const income = money.short(plan.income);
    return (
      <WorkQuestionStep
        key={card.id}
        line={line('payQuestion')}
        mood="happy"
        receiptLine={incoming}
        title={t('moneyIn.pay.title')}
        sub={
          extra > 0
            ? t('moneyIn.pay.subExtra', { income, extra: money.short(extra) })
            : t('moneyIn.pay.sub', { income })
        }
        yes={t('moneyIn.pay.yes')}
        no={t('moneyIn.no')}
        onAnswer={answer}
      />
    );
  }

  const given = givable.find((g) => g.id === ask.spendId);
  if (!given) return null;
  const original = { time: dayMonth(given.day), name: given.merchant, amount: given.amount };
  if (ask.kind === 'refund') {
    return (
      <WorkQuestionStep
        key={card.id}
        line={line('refundQuestion')}
        mood="happy"
        receiptLine={{ ...original, struck: given.amount === spend.amount }}
        second={{ ...incoming, time: t('moneyIn.today'), name: t('moneyIn.refund.line') }}
        title={t('moneyIn.refund.title', { name: given.merchant })}
        sub={t('moneyIn.refund.sub', { amount: money.short(spend.amount) })}
        yes={t('moneyIn.refund.yes')}
        no={t('moneyIn.no')}
        onAnswer={answer}
      />
    );
  }
  return (
    <WorkQuestionStep
      key={card.id}
      line={line('paybackQuestion')}
      mood="happy"
      receiptLine={original}
      second={{ ...incoming, time: t('moneyIn.today'), name: t('moneyIn.payback.line') }}
      title={
        from
          ? t('moneyIn.payback.title', { from, name: given.merchant })
          : t('moneyIn.payback.titleNoName', { name: given.merchant })
      }
      sub={t(given.forWork ? 'moneyIn.payback.subClaim' : 'moneyIn.payback.sub')}
      yes={t('moneyIn.payback.yes')}
      no={t('moneyIn.no')}
      onAnswer={answer}
    />
  );
}
