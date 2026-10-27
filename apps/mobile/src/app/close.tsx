import { useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import { Text, View } from 'react-native';

import {
  clockOf,
  isBigMoneyIn,
  offersPlanUpdate,
  stepPosition,
  tally,
  type GivableSpend,
} from '@6pm/domain';

import { useGivableSpends } from '../data/givable-spends';
import { useMoney, useMoneyActions } from '../data/money-provider';
import { CashCustom } from '../features/close/cash-custom';
import { BillQuestionStep } from '../features/close/close-bill-question';
import { CloseCards } from '../features/close/close-cards';
import { CloseEdit } from '../features/close/close-edit';
import { CloseMoneyEdit } from '../features/close/close-money-edit';
import { MoneyQuestionStep } from '../features/close/close-money-question';
import { CloseReceiptStep } from '../features/close/close-receipt-step';
import { CloseRevealStep } from '../features/close/close-reveal-step';
import { CashStep, SortedStep } from '../features/close/close-steps';
import { WorkQuestionStep } from '../features/close/close-work-question';
import { CloseTopBar } from '../features/close/close-top-bar';
import { useClose } from '../features/close/use-close';
import { useCloseCash } from '../features/close/use-close-cash';
import { useClosingNumber } from '../features/close/use-closing-number';
import { useRuleOffer } from '../features/close/use-rule-offer';
import { useCompanionToast } from '../features/companion/use-companion-toast';
import { RulePrompt } from '../features/details/rule-prompt';
import { useI18n } from '../i18n/i18n';
import { useMoneyFormat } from '../money/use-money-format';
import { haptics } from '../ui/haptics';
import { Symbol } from '../ui/icons/symbol';
import { PressScale } from '../ui/primitives/press-scale';
import { body } from '../ui/type/fonts';
import { useDesignInsets } from '../ui/layout/design-insets';
import { useClock } from '../ui/theme/clock';
import { useTheme } from '../ui/theme/theme';
import { CloseBook } from '../features/duo/close-book';
import { CloseLedger, type CardPress } from '../features/duo/close-ledger';
import { useFoldShut } from '../features/duo/use-fold-shut';
import { useFoldForm } from '../ui/layout/fold';
import { useFinishClose } from '../features/close/use-finish-close';

/** The design phone's width less its 20 pt sides. */
const COLUMN = 362;

const STEP_KEYS = [
  'close.step.cards',
  'close.step.cash',
  'close.step.check',
  'close.step.receipt',
  'close.step.tomorrow',
] as const;

/**
 * The 6pm Close: about a minute from caught to tomorrow's number. It opens once the spends money
 * that came in may give back are read, a moment's work, so its questions know them from the start.
 */
export default function Close() {
  const { palette } = useTheme();
  const today = useMoney().today;
  const givable = useGivableSpends(today);
  if (givable === null) {
    return <View style={{ flex: 1, experimental_backgroundImage: palette.skyDeep }} />;
  }
  return <CloseOpen givable={givable} />;
}

function CloseOpen({ givable }: { readonly givable: readonly GivableSpend[] }) {
  const router = useRouter();
  const { palette } = useTheme();
  const { t, language } = useI18n();
  const money = useMoneyFormat();
  const { now } = useClock();
  const { top, bottom, rail } = useDesignInsets();
  const snap = useMoney();
  const actions = useMoneyActions();
  const say = useCompanionToast();
  const close = useClose(givable);
  // The number of the day being closed, even when the money day turns over mid-close.
  const day = useClosingNumber(close.day);
  const { state, dispatch, run } = close;
  const [editing, setEditing] = useState<string | null>(null);
  const [typingCash, setTypingCash] = useState(false);
  const rules = useRuleOffer(actions, state.step);
  const { chips, categoryFor, addCash } = useCloseCash(close);
  const [closedAt] = useState(() => clockOf(now.getHours() + now.getMinutes() / 60));
  // The iPhone Duo opened: the Close is an open book, the step left, the ledger right.
  const form = useFoldForm();
  const book = form.kind === 'spread' ? form : null;
  const pressCard = useRef<((choice: CardPress) => void) | null>(null);
  const finish = useFinishClose(close, day);
  // Folded shut once nothing is left to confirm, the day is closed, as the reveal's Done does.
  useFoldShut(() => void finish(), state.step !== 'cards');

  if (!day || !snap.plan) return null;

  const locale = language === 'vi' ? 'vi-VN' : 'en-GB';
  const closingDate = new Date(`${close.day}T12:00:00`);

  const shortDate = (d: Date) =>
    new Intl.DateTimeFormat(locale, { weekday: 'short', day: 'numeric', month: 'short' })
      .format(d)
      .toUpperCase();
  const position = stepPosition(state.step);
  const counts = tally(state);
  const editingSpend = editing ? close.everything.find((s) => s.id === editing) : undefined;
  const rule = rules.offer
    ? snap.categories.find((c) => c.id === rules.offer?.categoryId)
    : undefined;

  const edit = (amount: number, categoryId: string) => {
    if (!editingSpend) return;
    close.decide(editingSpend.id, 'edited', { amount, categoryId });
    setEditing(null);
    rules.changed(editingSpend.merchant, editingSpend.categoryId, categoryId);
  };

  const buttonLabels = {
    edit: t('close.btn.edit'),
    notMine: t('close.btn.notMine'),
    keep: t('close.btn.keep'),
    spread: t('moneyIn.btn.spread'),
    futureYou: t('moneyIn.btn.futureYou'),
  };
  const { plan } = snap;
  // Money on top of the stack: its hint, or the companion's word when it is a big one.
  const moneyHintFor = (amount: number | undefined) =>
    amount !== undefined && !plan.serious && isBigMoneyIn(amount, plan.income)
      ? t(`companion.moneyIn.big.${plan.persona}` as 'companion.moneyIn.big.soft')
      : t(close.moneyIn.canSave ? 'moneyIn.hint' : 'moneyIn.hintNoSave');
  const pillFor = (amount: number | undefined) =>
    amount === undefined ? null : close.moneyIn.pillFor(amount);
  const topCard = close.cards[0];
  const topMoney = close.moneyCards[0];
  const extraOnTop = topMoney ? close.extraIds.has(topMoney.row.id) : false;
  // The pay's extra offers to make the plan's income the pay, when it is worth saying.
  const raise =
    extraOnTop && topMoney && offersPlanUpdate(topMoney.amount, plan.income)
      ? plan.income + topMoney.amount
      : null;
  const pages = (
    <>
      <CloseTopBar
        keys={STEP_KEYS}
        index={position.index}
        of={position.of}
        label={t(STEP_KEYS[position.index - 1] ?? 'close.step.cards')}
        closeLabel={t('common.done')}
        onClose={() => (state.step === 'reveal' ? void finish() : router.back())}
      />

      {state.step === 'cards' ? (
        <CloseCards
          cards={close.cards}
          kicker={
            counts.kept + counts.edited > 0
              ? t('close.kicker', {
                  date: shortDate(closingDate),
                  // The top card's place in the queue: money waiting for its question is not
                  // in the stack, but keeps its number.
                  n: close.queue.findIndex((s) => s.id === topCard?.row.id) + 1,
                  total: close.queue.length,
                  kept: money.short(close.keptBefore).toUpperCase(),
                })
              : t('close.kickerStart', {
                  date: shortDate(closingDate),
                  n: 1,
                  total: close.queue.length,
                })
          }
          title={t('close.title', { count: close.queue.length })}
          hint={t('close.hint')}
          moneyHint={moneyHintFor(topCard?.money ? topCard.amount : undefined)}
          pill={pillFor(topCard?.money ? topCard.amount : undefined)}
          undoText={close.undoText}
          undoLabel={t('close.undo')}
          buttons={buttonLabels}
          pressRef={book ? pressCard : undefined}
          onDecide={close.decide}
          onEdit={setEditing}
          onUndo={close.undo}
        />
      ) : null}
      {state.step === 'sorted' ? (
        <SortedStep
          title={t('close.sorted.title', { count: close.queue.length })}
          sub={t('close.sorted.sub', counts)}
          undoLabel={t('close.undoLast')}
          canUndo={state.undoable !== null}
          onUndo={close.undo}
        />
      ) : null}
      {state.step === 'cash' ? (
        <CashStep
          title={state.sweep ? t('close.cash.sweep') : t('close.cash.title')}
          sub={t('close.cash.sub')}
          chips={chips}
          added={close.cash}
          totalLabel={t('close.cash.total')}
          doneLabel={t('close.cash.done')}
          noneLabel={t('close.cash.none')}
          otherLabel={t('close.cash.other')}
          onAdd={(chip) => addCash(chip.name, chip.amount, categoryFor(chip.key), chip.key)}
          onSaid={(said) =>
            addCash(said.name, said.amount, categoryFor(said.key), said.key, 'voice')
          }
          onOther={() => setTypingCash(true)}
          onDone={() => dispatch({ type: 'cashDone' })}
        />
      ) : null}
      {state.step === 'bill' ? (
        <BillQuestionStep state={state} queue={close.queue} dispatch={dispatch} run={run} />
      ) : null}
      {state.step === 'money' ? (
        <MoneyQuestionStep
          state={state}
          queue={close.queue}
          asks={close.moneyAsks}
          givable={givable}
          dispatch={dispatch}
          run={run}
        />
      ) : null}
      {state.step === 'moneyCards' ? (
        <CloseCards
          cards={close.moneyCards}
          kicker={
            extraOnTop
              ? t('moneyIn.extra.kicker', { date: shortDate(closingDate) })
              : shortDate(closingDate)
          }
          title={extraOnTop ? t('moneyIn.extra.title') : t('moneyIn.name')}
          hint={moneyHintFor(topMoney?.amount)}
          moneyHint={moneyHintFor(topMoney?.amount)}
          pill={pillFor(topMoney?.amount)}
          undoText={close.undoText}
          undoLabel={t('close.undo')}
          accessory={
            raise === null ? null : (
              <PressScale
                hitSlop={6}
                onPress={() =>
                  router.push({ pathname: '/month', params: { income: String(raise) } })
                }
                style={{
                  height: 32,
                  paddingLeft: 9,
                  paddingRight: 13,
                  borderRadius: 99,
                  backgroundColor: palette.glass,
                  boxShadow: palette.glassShadow,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <Symbol name="trending_up" size={18} color={palette.ink} />
                <Text style={{ ...body(14, 600), color: palette.ink }}>
                  {t('moneyIn.extra.plan')}
                </Text>
                <Text style={{ ...body(14, 500), color: palette.ink, opacity: 0.55 }}>
                  {t('moneyIn.extra.planTo', { amount: money.short(raise) })}
                </Text>
              </PressScale>
            )
          }
          buttons={buttonLabels}
          onDecide={close.decide}
          onEdit={setEditing}
          onUndo={close.undo}
        />
      ) : null}
      {state.step === 'question' && close.askWorkId ? (
        <WorkQuestionStep
          line={
            snap.plan.serious
              ? null
              : t(`companion.question.${snap.plan.persona}` as 'companion.question.cheeky')
          }
          receiptLine={(() => {
            const s = close.queue.find((q) => q.id === close.askWorkId);
            return {
              time: s
                ? new Intl.DateTimeFormat(locale, {
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: false,
                  }).format(new Date(s.at))
                : '',
              name: s?.merchant ?? '',
              amount: s?.amount ?? 0,
            };
          })()}
          title={t('close.work.title')}
          sub={t('close.work.sub')}
          yes={t('close.work.yes')}
          no={t('close.work.no')}
          onAnswer={(forWork) => {
            haptics.tap();
            const id = close.askWorkId;
            if (forWork && id) void run(() => actions.markForWork(id, true));
            dispatch({ type: 'answerWork' });
          }}
        />
      ) : null}
      {state.step === 'receipt' ? (
        <CloseReceiptStep
          day={close.day}
          closedAt={closedAt}
          spent={day.spent}
          tomorrow={day.tomorrow}
          onNext={() => dispatch({ type: 'receiptDone' })}
        />
      ) : null}
      {state.step === 'reveal' ? (
        <CloseRevealStep day={close.day} number={day} onDone={() => void finish()} />
      ) : null}
    </>
  );

  return (
    <View
      style={{
        flex: 1,
        experimental_backgroundImage: palette.skyDeep,
        paddingTop: top(60),
        paddingLeft: 20,
        paddingRight: 20 + rail,
        paddingBottom: bottom(30),
      }}
    >
      {book ? (
        <CloseBook
          inset={20}
          leftPage={book.left}
          rightPage={book.right}
          left={pages}
          right={
            <CloseLedger
              kept={close.keptBefore}
              day={day}
              onPress={state.step === 'cards' ? (choice) => pressCard.current?.(choice) : null}
              labels={buttonLabels}
            />
          }
        />
      ) : (
        // A phone's column, centred where the screen is wider.
        <View style={{ flex: 1, width: '100%', maxWidth: COLUMN, alignSelf: 'center' }}>
          {pages}
        </View>
      )}

      {rules.offer && rule ? (
        <View style={{ position: 'absolute', left: 16, right: 16, bottom: bottom(24), zIndex: 15 }}>
          <RulePrompt
            text={t('rule.ask', { merchant: rules.offer.merchant, category: rule.name })}
            once={t('rule.once')}
            always={t('rule.always')}
            onOnce={rules.dismiss}
            onAlways={() => {
              const offer = rules.offer;
              if (!offer) return;
              rules.dismiss();
              void run(() => actions.rememberMerchant(offer.merchant, offer.categoryId)).then(
                (saved) => {
                  if (saved) say('ruleSaved');
                },
              );
            }}
          />
        </View>
      ) : null}

      {editingSpend?.direction === 'in' ? (
        <CloseMoneyEdit
          name={editingSpend.merchant || t('moneyIn.name')}
          amount={editingSpend.amount}
          spreadTo={(close.cards[0]?.money ?? close.moneyCards[0]?.money)?.spread ?? day.tomorrow}
          spreadMore={Math.max(
            0,
            ((close.cards[0]?.money ?? close.moneyCards[0]?.money)?.spread ?? day.tomorrow) -
              day.tomorrow,
          )}
          futureYou={close.moneyIn.futureYou}
          canSave={close.moneyIn.canSave}
          pots={snap.pots.filter((p) => p.kind === 'occasion' && p.archivedAt === null)}
          saved={snap.potSaved}
          onCancel={() => setEditing(null)}
          onPlace={(place) => {
            close.decideMoney(editingSpend.id, place);
            setEditing(null);
          }}
        />
      ) : editingSpend ? (
        <CloseEdit
          name={editingSpend.merchant}
          amount={editingSpend.amount}
          categoryId={editingSpend.categoryId}
          categories={snap.categories}
          saveLabel={t('close.edit.save')}
          onCancel={() => setEditing(null)}
          onSave={edit}
        />
      ) : null}
      {typingCash ? (
        <CashCustom
          title={t('close.cash.otherTitle')}
          addLabel={t('close.cash.add')}
          categories={snap.categories}
          initialCategoryId={categoryFor('food')}
          onCancel={() => setTypingCash(false)}
          onAdd={(amount, categoryId) => {
            setTypingCash(false);
            const name = snap.categories.find((c) => c.id === categoryId)?.name ?? t('source.cash');
            addCash(name, amount, categoryId, 'custom');
          }}
        />
      ) : null}
    </View>
  );
}
