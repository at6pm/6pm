import { useState } from 'react';

import {
  asksBillAmount,
  billQuestion,
  REPAYMENT,
  type BillRow,
  type CloseEvent,
  type CloseState,
  type SpendRow,
} from '@6pm/domain';
import { localeOf } from '@6pm/i18n';

import { useBillPayments } from '../../data/bill-payments';
import { useMoney } from '../../data/money-provider';
import { findSpend } from '../../data/money-store';
import { useI18n } from '../../i18n/i18n';
import { useMoneyFormat } from '../../money/use-money-format';
import { haptics } from '../../ui/haptics';
import { WorkQuestionStep } from './close-work-question';

/**
 * "Is this your {bill}?", or "Paying off a card or loan?" when no bill matches: the close's
 * question card about a spend that looks like a bill's payment, or was marked as one when it was
 * caught. Yes (the first answer) marks the bill paid this cycle and keeps the spend out of the
 * daily number; when it paid a different amount than the bill's, the same card then asks whether
 * that is the bill's amount from now on ("Just this month" first). No keeps it as spending (a
 * spend marked when caught goes back to counting, its bill back to due) and the bill is not asked
 * about again this cycle.
 */
export function BillQuestionStep({
  state,
  queue,
  dispatch,
  run,
}: {
  readonly state: CloseState;
  readonly queue: readonly SpendRow[];
  readonly dispatch: (event: CloseEvent) => void;
  readonly run: (task: () => Promise<unknown>) => Promise<boolean>;
}) {
  const snap = useMoney();
  const { t, language } = useI18n();
  const money = useMoneyFormat();
  const payments = useBillPayments();
  // The bill whose amount is being asked about, with what it was before this payment.
  const [amountAsk, setAmountAsk] = useState<{ id: string; bill: BillRow } | null>(null);
  const card = billQuestion(state);
  const queued = card ? queue.find((s) => s.id === card.id) : undefined;
  if (!card || !queued || card.askBill === undefined) return null;
  // The spend as it is now: an edit on the cards step may have changed its amount.
  const spend = findSpend(snap, queued.id) ?? queued;
  const bill =
    card.askBill === REPAYMENT ? undefined : snap.bills.find((b) => b.id === card.askBill);
  const time = new Intl.DateTimeFormat(localeOf(language), {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(new Date(spend.at));
  const persona = snap.plan?.persona ?? 'soft';
  const receiptLine = { time, name: spend.merchant, amount: spend.amount };
  const line = snap.plan?.serious
    ? null
    : t(`companion.billQuestion.${persona}` as 'companion.billQuestion.soft');

  const answer = (paid: boolean) => {
    haptics.tap();
    if (paid) {
      void run(() => payments.setPaysBill(spend.id, bill ? bill.id : REPAYMENT));
      if (bill && asksBillAmount(bill, spend.amount)) {
        setAmountAsk({ id: card.id, bill });
        return;
      }
    } else if (bill && spend.paysBill === bill.id) {
      void run(() => payments.setPaysBill(spend.id, null));
    } else if (bill) {
      void run(() => payments.billAsked(bill.id));
    }
    dispatch({ type: 'answerBill', id: card.id, paid });
  };

  if (amountAsk?.id === card.id) {
    const asked = amountAsk.bill;
    const answerAmount = (thisMonth: boolean) => {
      haptics.tap();
      if (!thisMonth) void run(() => payments.billFromNowOn(asked.id, spend.amount));
      setAmountAsk(null);
      dispatch({ type: 'answerBill', id: card.id, paid: true });
    };
    return (
      <WorkQuestionStep
        key={`${card.id}-amount`}
        line={line}
        receiptLine={receiptLine}
        title={t('close.bill.amountTitle', { new: money.short(spend.amount) })}
        sub={t('close.bill.amountSub', {
          bill: asked.name,
          old: money.short(asked.amount),
          new: money.short(spend.amount),
        })}
        yes={t('close.bill.thisMonth')}
        no={t('close.bill.fromNow')}
        onAnswer={answerAmount}
      />
    );
  }

  return (
    <WorkQuestionStep
      key={card.id}
      line={line}
      receiptLine={receiptLine}
      title={bill ? t('close.bill.title', { bill: bill.name }) : t('close.repayment.title')}
      sub={
        bill
          ? t(bill.kind === 'card' ? 'close.bill.subCard' : 'close.bill.sub')
          : t('close.repayment.sub')
      }
      yes={
        bill
          ? t(bill.kind === 'card' ? 'close.bill.yesCard' : 'close.bill.yes')
          : t('close.repayment.yes')
      }
      no={t('close.bill.no')}
      onAnswer={answer}
    />
  );
}
