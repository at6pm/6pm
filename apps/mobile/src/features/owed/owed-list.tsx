import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Text, View } from 'react-native';
import Animated, { FadeIn, FadeOut, LinearTransition } from 'react-native-reanimated';

import {
  owedByBill,
  owedByPerson,
  remindAtFor,
  type OwedBill,
  type OwedPerson,
  type OwedRow,
  type RemindChoice,
} from '@6pm/domain';
import { owedInk } from '@6pm/theme';

import { useMoney } from '../../data/money-provider';
import { owedLineOf } from '../../data/owed-actions';
import { useI18n } from '../../i18n/i18n';
import { useMoneyFormat } from '../../money/use-money-format';
import { haptics } from '../../ui/haptics';
import { Symbol } from '../../ui/icons/symbol';
import { easeOut } from '../../ui/motion/curves';
import { edgeSheetRoot } from '../../ui/navigation/edge-sheet';
import { SheetScreen } from '../../ui/navigation/sheet-screen';
import { PaperEdge } from '../../ui/paper-edge';
import { PressScale } from '../../ui/primitives/press-scale';
import { useTheme } from '../../ui/theme/theme';
import { body, display, mono, tabular } from '../../ui/type/fonts';
import { useToast } from '../../ui/toast/toast-host';
import { useOfferUndo } from '../../ui/undo/undo-host';
import { accountReady } from '../../data/receiving-account';
import { askForReminders } from '../onboarding/close-reminder';
import { useNotificationSettings } from '../reminders/notification-prefs';
import { refreshReminderPermission } from '../reminders/reminder-permission';
import { shareMessage } from './ask-share';
import { CoverSheet } from './cover-sheet';
import { Avatar, PaidStamp } from './owed-parts';
import { flyOff, STAMP_HOLD_MS, stampIn } from './owed-motion';
import { noteSettled, slipWhat, wasPaid } from './owed-words';
import { useOwed, useOwedActions, useReceivingAccount } from './use-owed';

const reflow = LinearTransition.duration(300).easing(easeOut);
/** Each strip lies a little askew, as torn paper does. */
const TILTS = [-0.6, 0.4, -0.3, 0.5] as const;
/** The room right of a strip: Ask, or what happened. */
const RIGHT = 100;

/**
 * Strips that just left the list stay a beat: stamped PAID when they were paid (in cash, or money
 * in from the close), then they fly off; covered ones only slide away.
 */
function useLeaving(rows: readonly OwedRow[]) {
  const [leaving, setLeaving] = useState<readonly OwedRow[]>([]);
  const before = useRef(rows);
  useEffect(() => {
    const here = new Set(rows.map((r) => r.id));
    const gone = before.current.filter((r) => !here.has(r.id));
    before.current = rows;
    if (gone.length === 0) return;
    if (gone.some((r) => wasPaid(r.id) === true)) haptics.success();
    setLeaving((list) => [...list, ...gone]);
    const ids = new Set(gone.map((r) => r.id));
    setTimeout(() => setLeaving((list) => list.filter((r) => !ids.has(r.id))), STAMP_HOLD_MS);
  }, [rows]);
  return leaving;
}

/** One person's strip of a bill: their avatar, their name and what they owe, torn top and foot. */
function StripRow({
  strip,
  tilt,
  leaving,
  onOpen,
  onAsk,
}: {
  readonly strip: OwedPerson;
  readonly tilt: number;
  readonly leaving: ReadonlySet<string>;
  readonly onOpen: () => void;
  readonly onAsk: () => void;
}) {
  const { t } = useI18n();
  const money = useMoneyFormat();
  const name = strip.name ?? t('owed.someone');
  const gone = strip.lines.every((l) => leaving.has(l.id));
  const paid = gone && strip.lines.some((l) => wasPaid(l.id) !== false);
  return (
    <Animated.View
      layout={reflow}
      entering={FadeIn.duration(250)}
      exiting={flyOff}
      style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}
    >
      {/* The press scales the strip; the tilt stays on the paper around it. */}
      <View
        style={{
          flex: 1,
          minWidth: 0,
          transform: [{ rotate: `${tilt}deg` }],
          boxShadow: `0 8px 14px ${owedInk.slipShadow}`,
        }}
      >
        <PressScale
          scaleTo={0.98}
          accessibilityRole="button"
          accessibilityLabel={`${name}, ${money.spoken(strip.total)}`}
          onPress={onOpen}
          disabled={gone}
        >
          <View style={{ transform: [{ scaleY: -1 }] }}>
            <PaperEdge color={owedInk.paper} height={6} step={12} shadow={false} />
          </View>
          <View
            style={{
              backgroundColor: owedInk.paper,
              paddingTop: 5,
              paddingBottom: 7,
              paddingLeft: 10,
              paddingRight: 14,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 10,
            }}
          >
            <Avatar name={strip.name} size={32} />
            <Text
              numberOfLines={1}
              style={{ ...body(16, 650), color: owedInk.ink, flex: 1, minWidth: 0 }}
            >
              {name}
            </Text>
            <Text style={{ ...display(24, 500, -0.02), ...tabular, color: owedInk.ink }}>
              {money.short(strip.total)}
            </Text>
          </View>
          <PaperEdge color={owedInk.paper} height={6} step={12} shadow={false} />
          {paid ? (
            <Animated.View
              entering={stampIn}
              pointerEvents="none"
              style={{ position: 'absolute', right: 86, top: 7 }}
            >
              <PaidStamp size={11} />
            </Animated.View>
          ) : null}
        </PressScale>
      </View>
      <View style={{ width: RIGHT, alignItems: 'flex-end' }}>
        {gone ? null : <AskButton onPress={onAsk} />}
      </View>
    </Animated.View>
  );
}

/** Ask, beside a strip: the QR to pay it. */
function AskButton({ onPress }: { readonly onPress: () => void }) {
  const { palette } = useTheme();
  const { t } = useI18n();
  return (
    <PressScale
      accessibilityRole="button"
      onPress={onPress}
      hitSlop={6}
      style={{
        height: 36,
        paddingLeft: 10,
        paddingRight: 13,
        borderRadius: 99,
        backgroundColor: palette.btnBg,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
      }}
    >
      <Symbol name="qr_code_2" size={18} color={palette.btnFg} />
      <Text style={{ ...body(14.5, 650), color: palette.btnFg }}>{t('owed.list.ask')}</Text>
    </PressScale>
  );
}

/**
 * One bill on the list: what it was and when, said once, and what the user paid for it when that
 * spend is still at hand; then a strip per person who owes a share of it.
 */
function BillGroup({
  bill,
  what,
  paid,
  leaving,
  onOpen,
  onAsk,
}: {
  readonly bill: OwedBill;
  /** "LẨU · THU 12" */
  readonly what: string;
  /** What the user paid for the whole bill, or null when that spend is no longer at hand. */
  readonly paid: number | null;
  readonly leaving: ReadonlySet<string>;
  readonly onOpen: (strip: OwedPerson) => void;
  readonly onAsk: (strip: OwedPerson) => void;
}) {
  const { palette } = useTheme();
  const { t } = useI18n();
  const money = useMoneyFormat();
  return (
    <Animated.View
      layout={reflow}
      entering={FadeIn.duration(250)}
      exiting={FadeOut.duration(250)}
      style={{ gap: 10 }}
    >
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          gap: 10,
          marginHorizontal: 2,
          paddingHorizontal: 4,
        }}
      >
        <Text
          numberOfLines={1}
          style={{ ...mono(11, 400, 0.14), color: palette.inkSoft, flexShrink: 1 }}
        >
          {what}
        </Text>
        {paid === null ? null : (
          <Text numberOfLines={1} style={{ ...mono(11, 400, 0.14), color: palette.inkSoft }}>
            {t('owed.list.youPaid', { amount: money.number(paid) })}
          </Text>
        )}
      </View>
      {bill.strips.map((strip, i) => (
        <StripRow
          key={strip.key}
          strip={strip}
          tilt={TILTS[i % TILTS.length] ?? 0}
          leaving={leaving}
          onOpen={() => onOpen(strip)}
          onAsk={() => onAsk(strip)}
        />
      ))}
    </Animated.View>
  );
}

/**
 * Owed to you: what everyone still owes, and in how many strips; then each bill, newest first,
 * said once over its strips, each strip a person and what they owe, with Ask beside it. A tap on
 * a strip offers Cover it, Paid in cash and Ask again. Paid strips are stamped and fly off; the
 * total recounts.
 */
export function OwedList() {
  const router = useRouter();
  const { palette } = useTheme();
  const { t, language, weekdayDate } = useI18n();
  const money = useMoneyFormat();
  const snap = useMoney();
  const owed = useOwedActions();
  const offerUndo = useOfferUndo();
  const toast = useToast();
  const { account } = useReceivingAccount();
  const { rows, total, count } = useOwed();
  const { settings } = useNotificationSettings();
  const { ask: askKey } = useLocalSearchParams<{ ask?: string }>();
  const [covering, setCovering] = useState<OwedPerson | null>(null);
  const leaving = useLeaving(rows);
  const leavingIds = useMemo(() => new Set(leaving.map((r) => r.id)), [leaving]);
  const people = useMemo(
    () => owedByPerson([...rows, ...leaving].map(owedLineOf)),
    [rows, leaving],
  );
  // The bills, each said once, newest first: a strip per person who owes a share of it.
  const bills = useMemo(() => owedByBill([...rows, ...leaving].map(owedLineOf)), [rows, leaving]);
  // The spend each bill was split from, from this cycle's spends (older ones show the day only).
  const spends = useMemo(
    () => new Map(snap.cycleSpends.map((s) => [s.id, s] as const)),
    [snap.cycleSpends],
  );
  const merchants = useMemo(
    () => new Map(snap.cycleSpends.map((s) => [s.id, s.merchant] as const)),
    [snap.cycleSpends],
  );

  // Outside Vietnam there is no VietQR: the Ask is a plain message with the amount. A first Ask
  // with no account opens the receiving account, and goes on to the Ask once it is typed.
  const ask = (person: OwedPerson) => {
    if (money.currency.code !== 'VND') {
      const spend = merchants.get(person.lines[0]?.spendId ?? '') ?? t('owed.list.title');
      void shareMessage(
        t('owed.ask.messagePlain', { spend, amount: money.full(person.total) }),
      ).catch(() => undefined);
      return;
    }
    if (!accountReady(account ?? null)) {
      toast(t('owed.ask.noAccount'));
      router.push({ pathname: '/receiving-account', params: { then: person.key } });
      return;
    }
    router.push({ pathname: '/owed-ask', params: { key: person.key } });
  };

  // "Remind me": every strip of theirs comes back at 10:00 on the day chosen, as one reminder.
  const remind = (person: OwedPerson, choice: RemindChoice | null) => {
    const ids = person.lines.map((l) => l.id);
    const at = choice === null ? null : remindAtFor(choice, snap.today, snap.cycle.payday);
    void owed.setRemindAt(ids, at?.toISOString() ?? null);
    if (at === null) return;
    if (settings !== null && !settings.on.reminders) {
      toast(t('owed.remind.off'));
      return;
    }
    toast(t('owed.remind.toast', { date: weekdayDate(at) }));
    void askForReminders()
      .then(() => refreshReminderPermission())
      .catch(() => undefined);
  };
  const remindAtOf = (person: OwedPerson): Date | null => {
    const ids = new Set(person.lines.map((l) => l.id));
    const set = rows
      .filter((r) => ids.has(r.id) && r.remindAt !== null)
      .map((r) => new Date(r.remindAt ?? ''))
      .filter((d) => d.getTime() > Date.now());
    return set.length === 0 ? null : new Date(Math.min(...set.map((d) => d.getTime())));
  };

  // Opened from a reminder: that person's Ask is ready (or their sheet, where there is no QR).
  const opened = useRef(false);
  const openAsk = useRef<(person: OwedPerson) => void>(() => undefined);
  openAsk.current = (person) => {
    if (money.currency.code === 'VND') ask(person);
    else setCovering(person);
  };
  useEffect(() => {
    if (opened.current || !askKey) return;
    const person = people.find((p) => p.key === askKey);
    if (!person) return;
    // Only the first time the people are there: later changes keep the screen as it is.
    opened.current = true;
    openAsk.current(person);
  }, [askKey, people]);

  const settle = (person: OwedPerson, paid: boolean) => {
    const ids = person.lines.map((l) => l.id);
    const amount = money.short(person.total);
    noteSettled(ids, paid);
    const work = paid
      ? owed.paidInCash(ids, person.name)
      : owed.cover(
          ids,
          person.name ? t('owed.cover.note', { name: person.name }) : t('owed.cover.noteNoName'),
        );
    void work.then((done) => {
      if (!done) return;
      offerUndo(
        t(paid ? 'owed.undo.cash' : 'owed.undo.covered', { amount }),
        t('undo.action'),
        () => void owed.unsettle(done),
      );
    });
  };

  return (
    <View collapsable={false} style={edgeSheetRoot}>
      <SheetScreen title={t('owed.list.title')} gap={14} fit>
        {people.length > 0 ? (
          <View
            style={{ flexDirection: 'row', alignItems: 'baseline', gap: 8, paddingHorizontal: 2 }}
          >
            <Text style={{ ...display(52, 500, -0.03), ...tabular, color: palette.ink }}>
              {money.short(total)}
            </Text>
            <Text style={{ ...body(14), color: palette.inkSoft }}>
              {t('owed.list.strips', { count })}
            </Text>
          </View>
        ) : null}
        <View style={{ height: 8 }} />
        {people.length === 0 ? (
          <Animated.Text
            entering={FadeIn.duration(250)}
            style={{ ...body(15), color: palette.inkSoft, textAlign: 'center', paddingTop: 24 }}
          >
            {t('owed.list.empty')}
          </Animated.Text>
        ) : (
          bills.map((bill) => (
            <BillGroup
              key={bill.spendId}
              bill={bill}
              what={slipWhat(bill, spends.get(bill.spendId)?.merchant, language)}
              // The spend at hand holds only the user's kept share, and settled shares are not
              // loaded here, so the whole bill is not known: say nothing rather than a wrong sum.
              paid={null}
              leaving={leavingIds}
              onOpen={(strip) => {
                haptics.tick();
                setCovering(strip);
              }}
              onAsk={(strip) => {
                haptics.tap();
                ask(strip);
              }}
            />
          ))
        )}
      </SheetScreen>
      {covering ? (
        <CoverSheet
          person={covering}
          what={slipWhat(
            covering.lines[0] ?? { day: snap.today },
            merchants.get(covering.lines[0]?.spendId ?? ''),
            language,
          )}
          onCover={() => settle(covering, false)}
          onCash={() => settle(covering, true)}
          onAsk={() => {
            const person = covering;
            setCovering(null);
            ask(person);
          }}
          remindAt={remindAtOf(covering)}
          onRemind={(choice) => remind(covering, choice)}
          onClose={() => setCovering(null)}
        />
      ) : null}
    </View>
  );
}
