import { useEffect, useMemo, useRef, useState } from 'react';
import { Text, View } from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';

import {
  requestCandidates,
  type MoneyInAsk,
  type OwedRow,
  type RequestCandidate,
  type SpendRow,
} from '@6pm/domain';
import { localeOf } from '@6pm/i18n';
import { owedInk, requestInk } from '@6pm/theme';

import { useMoney, useMoneyActions, useMoneyStore } from '../../data/money-provider';
import { openOwedOf, owedLineOf } from '../../data/owed-actions';
import { readPayers, requestActions } from '../../data/request-actions';
import { useI18n } from '../../i18n/i18n';
import { useMoneyFormat } from '../../money/use-money-format';
import { Companion } from '../../ui/companion/companion';
import { haptics } from '../../ui/haptics';
import { Symbol } from '../../ui/icons/symbol';
import { PaperEdge } from '../../ui/paper-edge';
import { PressScale } from '../../ui/primitives/press-scale';
import { useTheme } from '../../ui/theme/theme';
import { body, display, leading, mono } from '../../ui/type/fonts';
import { WordFitText } from '../../ui/type/word-fit-text';
import { Avatar, PaidStamp, Slip } from './owed-parts';
import { stampIn } from './owed-motion';
import { CodeChip } from './request-parts';
import { askedOn, dayMonthOf, requestWhat } from './request-words';
import { slipWhat } from './owed-words';

type RequestAsk = Extract<MoneyInAsk, { kind: 'request' | 'byHand' }>;

/** The money as the bank printed it: time, sender and amount, its note under it, code inked. */
function Receipt({ spend, code }: { readonly spend: SpendRow; readonly code: string | null }) {
  const money = useMoneyFormat();
  const { language } = useI18n();
  const time = new Intl.DateTimeFormat(localeOf(language), {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(new Date(spend.at));
  const memo = (spend.memo ?? spend.note ?? '').trim();
  const at = code ? memo.toUpperCase().indexOf(code) : -1;
  return (
    <View style={{ alignSelf: 'flex-start', transform: [{ rotate: '-1.5deg' }] }}>
      <View
        style={{
          boxShadow: `0 10px 18px ${owedInk.slipShadow}`,
          gap: 6,
          paddingTop: 12,
          paddingHorizontal: 16,
          paddingBottom: 10,
          backgroundColor: requestInk.paper,
        }}
      >
        <View style={{ flexDirection: 'row', gap: 14, alignItems: 'baseline' }}>
          <Text style={{ ...mono(12.5), color: requestInk.paperSoft }}>{time}</Text>
          <Text
            numberOfLines={1}
            style={{ ...mono(12.5), color: requestInk.paperInk, flexShrink: 1 }}
          >
            + {spend.merchant.toUpperCase()}
          </Text>
          <Text style={{ ...mono(12.5, 600), color: requestInk.paperInk }}>
            {money.number(spend.amount)}
          </Text>
        </View>
        {memo ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', paddingLeft: 56 }}>
            <Text numberOfLines={1} style={{ ...mono(11), color: requestInk.paperSoft }}>
              “{at >= 0 ? memo.slice(0, at) : memo}
            </Text>
            {at >= 0 && code ? <CodeChip code={code} /> : null}
            {at >= 0 && code ? (
              <Text
                numberOfLines={1}
                style={{ ...mono(11), color: requestInk.paperSoft, flexShrink: 1 }}
              >
                {memo.slice(at + code.length)}”
              </Text>
            ) : (
              <Text style={{ ...mono(11), color: requestInk.paperSoft }}>”</Text>
            )}
          </View>
        ) : null}
      </View>
      <PaperEdge color={requestInk.paper} />
    </View>
  );
}

function Buttons({
  yes,
  no,
  yesReady = true,
  onAnswer,
}: {
  readonly yes: string;
  readonly no: string;
  readonly yesReady?: boolean;
  readonly onAnswer: (yes: boolean) => void;
}) {
  const { palette } = useTheme();
  return (
    <>
      <PressScale
        scaleTo={0.97}
        accessibilityRole="button"
        accessibilityState={{ disabled: !yesReady }}
        onPress={() => yesReady && onAnswer(true)}
        style={{
          height: 56,
          borderRadius: 99,
          backgroundColor: palette.btnBg,
          opacity: yesReady ? 1 : 0.45,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Text style={{ ...body(17, 650), color: palette.btnFg }}>{yes}</Text>
      </PressScale>
      <PressScale
        scaleTo={0.97}
        accessibilityRole="button"
        onPress={() => onAnswer(false)}
        style={{
          height: 56,
          borderRadius: 99,
          borderWidth: 1,
          borderColor: palette.inkSoft,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Text style={{ ...body(17, 600), color: palette.ink }}>{no}</Text>
      </PressScale>
    </>
  );
}

/**
 * 7d, the code finds its strip: no question to ask. The strip is stamped paid as the card rises
 * (the PAID stamp's curve, a success haptic) and the card says what the money becomes. "Keep it"
 * settles it; "Not this one" lifts the stamp and the money is an ordinary card.
 */
function CodeMatch({
  spend,
  row,
  heldBack,
  onAnswer,
}: {
  readonly spend: SpendRow;
  readonly row: OwedRow;
  readonly heldBack: number;
  readonly onAnswer: (yes: boolean) => void;
}) {
  const { palette } = useTheme();
  const { t, language } = useI18n();
  const money = useMoneyFormat();
  useEffect(() => {
    haptics.success();
  }, []);
  const name = row.name ?? t('owed.someone');
  const work = row.work === true;
  return (
    <Animated.View entering={FadeInDown.duration(450)} style={{ flex: 1, gap: 18, paddingTop: 56 }}>
      <WordFitText style={{ ...leading(display(40, 500, -0.01), 42), color: palette.ink }}>
        {row.job
          ? t('request.close.paid', { name, job: row.job })
          : t('request.close.paidNoJob', { name })}
      </WordFitText>
      <Receipt spend={spend} code={row.code ?? null} />
      <View style={{ flexDirection: 'row', gap: 14, alignItems: 'center' }}>
        <View style={{ transform: [{ rotate: '-1deg' }] }}>
          <Slip
            big
            width={150}
            what={requestWhat(row, language)}
            amount={money.short(row.amount)}
            stamp={
              <Animated.View entering={stampIn}>
                <PaidStamp size={11} />
              </Animated.View>
            }
          />
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, paddingTop: 6 }}>
            <CodeChip code={row.code ?? ''} size={10} />
            <Text style={{ ...mono(10, 400, 0.1), color: palette.inkSoft }}>
              {t('request.close.asked', {
                date: dayMonthOf(askedOn(row), language).toLocaleUpperCase(localeOf(language)),
              })}
            </Text>
          </View>
        </View>
        <Text style={{ ...body(13.5), lineHeight: 19, color: palette.inkSoft, flex: 1 }}>
          {work ? t('request.close.byCode') : t('request.close.byCodePlain')}
          {heldBack > 0 ? ` ${t('request.close.heldBack', { amount: money.short(heldBack) })}` : ''}
        </Text>
      </View>
      <View
        style={{
          alignSelf: 'flex-start',
          borderRadius: 99,
          backgroundColor: palette.cell,
          paddingHorizontal: 14,
          paddingVertical: 9,
        }}
      >
        <Text style={{ ...body(14, 650), color: palette.ink }}>
          {work ? t('request.close.asWork') : t('request.close.intoDays')}
        </Text>
      </View>
      <View style={{ flex: 1 }} />
      <Buttons yes={t('request.close.keep')} no={t('request.close.notThis')} onAnswer={onAnswer} />
    </Animated.View>
  );
}

/** One open strip to pick: who, how much, and why it may fit. */
function CandidateRow({
  candidate,
  row,
  merchant,
  picked,
  onPick,
}: {
  readonly candidate: RequestCandidate;
  readonly row: OwedRow | undefined;
  readonly merchant: string | undefined;
  readonly picked: boolean;
  readonly onPick: () => void;
}) {
  const { palette } = useTheme();
  const { t, language } = useI18n();
  const money = useMoneyFormat();
  const { line } = candidate;
  const what = row?.code != null ? (row.job ?? '') : slipWhat(line, merchant, language);
  const sub =
    candidate.fit === 'heldBack'
      ? t('request.hand.lessHeld', { job: what, amount: money.short(line.amount) })
      : what;
  return (
    <PressScale
      scaleTo={0.98}
      accessibilityRole="radio"
      accessibilityState={{ checked: picked }}
      onPress={onPick}
      style={{
        minHeight: 60,
        borderRadius: 20,
        backgroundColor: palette.cell,
        borderWidth: 2,
        borderColor: picked ? palette.ink : 'transparent',
        paddingHorizontal: 12,
        paddingVertical: 10,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
      }}
    >
      <Avatar name={line.name} size={32} square={row?.company === true} />
      <View style={{ flex: 1, gap: 2 }}>
        <Text numberOfLines={1} style={{ ...body(15, 650), color: palette.ink }}>
          {line.name ?? t('owed.someone')} · {money.short(line.amount)}
        </Text>
        {sub ? (
          <Text numberOfLines={1} style={{ ...body(12.5), color: palette.inkSoft }}>
            {sub}
          </Text>
        ) : null}
      </View>
      <View
        style={{
          width: 24,
          height: 24,
          borderRadius: 12,
          borderWidth: 1.5,
          borderColor: palette.inkSoft,
          backgroundColor: picked ? palette.ink : 'transparent',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {picked ? <Symbol name="check" size={16} color={palette.btnFg} /> : null}
      </View>
    </PressScale>
  );
}

/**
 * 7e, no code: match it by hand. 6pm does not guess from the amount: it shows the open strips
 * that fit first, with why, then the rest, and asks. "It's something else" gives the ordinary
 * money-in card.
 */
export function MatchByHand({
  spend,
  onMatched,
  onElse,
  line: companionLine = true,
}: {
  readonly spend: SpendRow;
  /** The strip was picked: settle it (the caller answers the close or closes the sheet). */
  readonly onMatched: (candidate: RequestCandidate) => void;
  readonly onElse: () => void;
  readonly line?: boolean;
}) {
  const snap = useMoney();
  const store = useMoneyStore();
  const { palette } = useTheme();
  const { t } = useI18n();
  const money = useMoneyFormat();
  const [payers, setPayers] = useState<ReadonlyMap<string, ReadonlySet<string>>>(new Map());
  useEffect(() => {
    let live = true;
    readPayers(store)
      .then((read) => live && setPayers(read))
      .catch(() => undefined);
    return () => {
      live = false;
    };
  }, [store]);
  const rows = useMemo(() => openOwedOf(snap), [snap]);
  const byId = useMemo(() => new Map(rows.map((r) => [r.id, r] as const)), [rows]);
  const merchants = useMemo(
    () => new Map(snap.cycleSpends.map((s) => [s.id, s.merchant] as const)),
    [snap.cycleSpends],
  );
  const candidates = useMemo(
    () => requestCandidates(spend, rows.map(owedLineOf), payers).slice(0, 4),
    [spend, rows, payers],
  );
  const [picked, setPicked] = useState<string | null>(null);
  const chosen = candidates.find((c) => c.line.id === picked);
  const firstFit = candidates.find((c) => c.fit !== null)?.line.id ?? null;
  useEffect(() => {
    setPicked((was) => was ?? firstFit);
  }, [firstFit]);
  const from = spend.merchant.trim();
  const amount = money.short(spend.amount);
  return (
    <Animated.View entering={FadeInDown.duration(450)} style={{ flex: 1, gap: 16, paddingTop: 56 }}>
      {companionLine ? (
        <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 6 }}>
          <Companion size={64} mood="think" />
          <View
            style={{
              flexShrink: 1,
              marginBottom: 34,
              paddingVertical: 8,
              paddingHorizontal: 13,
              borderRadius: 16,
              borderBottomLeftRadius: 4,
              backgroundColor: palette.bubbleBg,
            }}
          >
            <Text style={{ ...display(16), color: palette.bubbleFg }}>
              {t('request.hand.line')}
            </Text>
          </View>
        </View>
      ) : null}
      <Receipt spend={spend} code={null} />
      <Text style={{ ...leading(display(30, 500, -0.01), 33), color: palette.ink }}>
        {from
          ? t('request.hand.title', { amount, name: from })
          : t('request.hand.titleNoName', { amount })}
      </Text>
      <View style={{ gap: 10 }}>
        {candidates.length === 0 ? (
          <Animated.Text
            entering={FadeIn.duration(250)}
            style={{ ...body(15), color: palette.inkSoft }}
          >
            {t('request.hand.none')}
          </Animated.Text>
        ) : (
          candidates.map((c) => (
            <CandidateRow
              key={c.line.id}
              candidate={c}
              row={byId.get(c.line.id)}
              merchant={merchants.get(c.line.spendId)}
              picked={picked === c.line.id}
              onPick={() => {
                haptics.tick();
                setPicked(c.line.id);
              }}
            />
          ))
        )}
      </View>
      <View style={{ flex: 1 }} />
      <Buttons
        yes={t('request.hand.match')}
        no={t('request.hand.else')}
        yesReady={chosen !== undefined}
        onAnswer={(yes) => {
          haptics.tap();
          if (yes && chosen) onMatched(chosen);
          else if (!yes) onElse();
        }}
      />
    </Animated.View>
  );
}

/**
 * Settles money in against a strip picked by hand: a request is matched (its work stamp, what was
 * held back); a friend's share is their payback, as the close's own question places it.
 */
export function useSettleCandidate() {
  const store = useMoneyStore();
  const actions = useMoneyActions();
  return (spend: SpendRow, candidate: RequestCandidate) => {
    if (candidate.line.code != null) {
      return requestActions(store).match(spend.id, candidate.line.id, candidate.heldBack);
    }
    return actions.placeMoneyIn(spend.id, {
      moneyIn: 'payback',
      givesBack: candidate.line.spendId,
      owed: [candidate.line.id],
    });
  };
}

/**
 * The close's question when money in is a request's payment (7d) or may be one (7e). Yes answers
 * the card once the match is kept; no makes it an ordinary money-in card.
 */
export function RequestQuestionStep({
  spend,
  ask,
  onAnswer,
  run,
}: {
  readonly spend: SpendRow;
  readonly ask: RequestAsk;
  readonly onAnswer: (yes: boolean) => void;
  readonly run: (task: () => Promise<unknown>) => Promise<boolean>;
}) {
  const snap = useMoney();
  const store = useMoneyStore();
  const settle = useSettleCandidate();
  const answered = useRef(false);
  const once = (task: () => void) => {
    if (answered.current) return;
    answered.current = true;
    task();
  };
  // The strip as the card opened: a match settles it and takes it off the list behind the card.
  const [row] = useState(() =>
    ask.kind === 'request' ? snap.owed.find((r) => r.id === ask.lineId) : undefined,
  );
  const gone = ask.kind === 'request' && row === undefined;
  useEffect(() => {
    // The strip was settled or taken back since the close opened: an ordinary card.
    if (gone) once(() => onAnswer(false));
  }, [gone]);
  if (ask.kind === 'request') {
    if (!row) return null;
    return (
      <CodeMatch
        spend={spend}
        row={row}
        heldBack={ask.heldBack}
        onAnswer={(yes) =>
          once(() => {
            haptics.tap();
            if (!yes) {
              onAnswer(false);
              return;
            }
            void run(() => requestActions(store).match(spend.id, row.id, ask.heldBack));
            onAnswer(true);
          })
        }
      />
    );
  }
  return (
    <MatchByHand
      spend={spend}
      onMatched={(candidate) =>
        once(() => {
          void run(() => settle(spend, candidate));
          onAnswer(true);
        })
      }
      onElse={() => once(() => onAnswer(false))}
    />
  );
}
