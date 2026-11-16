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
import { useCompanionToast } from '../companion/use-companion-toast';
import { jarName } from '../pots/jar-name';
import { RequestQuestionStep } from '../owed/request-question';
import { BonusQuestionStep } from './close-bonus-question';
import { WorkQuestionStep } from './close-work-question';
import { useCloseMoney } from './use-close-money';

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
  const { canSave } = useCloseMoney();
  const say = useCompanionToast();
  // One answer per question: a second tap while the pay is being split does nothing.
  const answered = useRef<string | null>(null);
  const card = moneyQuestion(state);
  const spend = card ? queue.find((s) => s.id === card.id) : undefined;
  const ask = card ? asks[card.id] : undefined;
  if (!card || !spend || !ask || !snap.plan) return null;
  // A request to be paid: found by its code (7d), or matched by hand (7e).
  if (ask.kind === 'request' || ask.kind === 'byHand') {
    return (
      <RequestQuestionStep
        key={card.id}
        spend={spend}
        ask={ask}
        run={run}
        onAnswer={(yes) => dispatch({ type: 'answerMoney', id: card.id, yes })}
      />
    );
  }
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
  // The pay of one of the plan's incomes is measured against that income's amount per pay.
  const paidAs =
    ask.kind === 'pay' && ask.incomeId !== undefined
      ? plan.incomes?.find((i) => i.id === ask.incomeId)
      : undefined;
  const payKept = paidAs
    ? { amount: paidAs.amount, incomeId: paidAs.id }
    : { amount: plan.income, incomeId: null };
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
        const extra = await actions.keepPay(spend.id, payKept);
        dispatch({ type: 'answerMoney', id: card.id, yes: true, extra: extra ?? undefined });
      });
      return;
    }
    // The bonus places itself from its own step.
    if (ask.kind === 'bonus') return;
    if (ask.kind === 'remembered') {
      void run(() =>
        actions.placeMoneyIn(spend.id, {
          moneyIn: ask.place.moneyIn === 'saved' ? 'saved' : 'spread',
          savedTo: ask.place.savedTo,
        }),
      );
      dispatch({ type: 'answerMoney', id: card.id, yes: true });
      return;
    }
    void run(() =>
      actions.placeMoneyIn(spend.id, {
        moneyIn: ask.kind,
        givesBack: ask.spendId,
        ...(ask.kind === 'payback' && ask.owed ? { owed: ask.owed } : {}),
      }),
    );
    dispatch({ type: 'answerMoney', id: card.id, yes: true });
  };

  if (ask.kind === 'bonus') {
    return (
      <BonusQuestionStep
        key={card.id}
        spend={spend}
        jarId={ask.jarId}
        toJar={ask.toJar}
        canSave={canSave}
        onPlace={(place) => {
          if (answered.current === card.id) return;
          answered.current = card.id;
          if (!plan.serious) say('seasonBonus');
          void run(() => actions.placeMoneyIn(spend.id, place));
          dispatch({ type: 'answerMoney', id: card.id, yes: true });
        }}
      />
    );
  }

  if (ask.kind === 'remembered') {
    const jar = snap.pots.find((p) => p.id === ask.place.savedTo);
    return (
      <WorkQuestionStep
        key={card.id}
        line={null}
        mood="happy"
        receiptLine={incoming}
        title={
          ask.place.moneyIn === 'saved' && jar
            ? t('moneyIn.remembered.saved', { jar: jarName(jar, t) })
            : t('moneyIn.remembered.spread')
        }
        sub={from ? t('moneyIn.remembered.sub', { from }) : t('moneyIn.remembered.subNoName')}
        yes={t('moneyIn.remembered.yes')}
        no={t('moneyIn.no')}
        onAnswer={answer}
      />
    );
  }

  if (ask.kind === 'pay') {
    const extra = payExtra(spend.amount, payKept.amount);
    const income = money.short(payKept.amount);
    return (
      <WorkQuestionStep
        key={card.id}
        line={line('payQuestion')}
        mood="happy"
        receiptLine={incoming}
        title={t('moneyIn.pay.title')}
        sub={
          // Money that only lands has no amount to measure it against: what it does, the first
          // time; where it went, after.
          ask.landing === true
            ? t('moneyIn.landing.sub')
            : payKept.amount <= 0
              ? from
                ? t('moneyIn.remembered.sub', { from })
                : t('moneyIn.remembered.subNoName')
              : extra > 0
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
  // A friend's share of a split, named: "Linh paying back 300k?", their strip above the money.
  if (ask.kind === 'payback' && ask.owed) {
    const amount = money.short(spend.amount);
    return (
      <WorkQuestionStep
        key={card.id}
        line={line('paybackQuestion')}
        mood="happy"
        receiptLine={{ time: dayMonth(given.day), name: given.merchant, amount: spend.amount }}
        second={{ ...incoming, time: t('moneyIn.today'), name: t('moneyIn.payback.line') }}
        title={
          ask.name
            ? t('owed.close.title', { name: ask.name, amount })
            : t('owed.close.titleNoName', { amount })
        }
        sub={t('moneyIn.payback.sub')}
        yes={t('owed.close.yes')}
        no={t('moneyIn.no')}
        onAnswer={answer}
      />
    );
  }
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
