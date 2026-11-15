import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Text, View } from 'react-native';
import Animated, { FadeIn, FadeOut, LinearTransition } from 'react-native-reanimated';

import {
  owedByPerson,
  remindAtFor,
  type OwedPerson,
  type OwedRow,
  type RemindChoice,
} from '@6pm/domain';

import { useMoney } from '../../data/money-provider';
import { owedLineOf } from '../../data/owed-actions';
import { useI18n } from '../../i18n/i18n';
import { useMoneyFormat } from '../../money/use-money-format';
import { haptics } from '../../ui/haptics';
import { Symbol } from '../../ui/icons/symbol';
import { useMeasuredWidth } from '../../ui/layout/use-measured-width';
import { easeOut } from '../../ui/motion/curves';
import { edgeSheetRoot } from '../../ui/navigation/edge-sheet';
import { SheetScreen } from '../../ui/navigation/sheet-screen';
import { PressScale } from '../../ui/primitives/press-scale';
import { useTheme } from '../../ui/theme/theme';
import { body, display, tabular } from '../../ui/type/fonts';
import { useToast } from '../../ui/toast/toast-host';
import { useOfferUndo } from '../../ui/undo/undo-host';
import { accountReady } from '../../data/receiving-account';
import { askForReminders } from '../onboarding/close-reminder';
import { useNotificationSettings } from '../reminders/notification-prefs';
import { refreshReminderPermission } from '../reminders/reminder-permission';
import { shareMessage } from './ask-share';
import { CoverSheet } from './cover-sheet';
import { Avatar, PaidStamp, Slip } from './owed-parts';
import { flyOff, STAMP_HOLD_MS, stampIn } from './owed-motion';
import { noteSettled, slipWhat, wasPaid } from './owed-words';
import { useOwed, useOwedActions, useReceivingAccount } from './use-owed';

const SLIP = 98;
const reflow = LinearTransition.duration(300).easing(easeOut);

/** Where each of up to three strips lies on a card, oldest first: share of the room, top, tilt. */
const LAYOUTS: readonly (readonly (readonly [number, number, number])[])[] = [
  [],
  [[0.06, 8, -1]],
  [
    [0, 20, -3],
    [1, 6, 3],
  ],
  [
    [0, 22, -3],
    [0.5, 12, 1],
    [1, 4, 3],
  ],
];

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

function PersonCard({
  person,
  leaving,
  merchants,
  onOpen,
  onAsk,
}: {
  readonly person: OwedPerson;
  readonly leaving: ReadonlySet<string>;
  readonly merchants: ReadonlyMap<string, string>;
  readonly onOpen: () => void;
  readonly onAsk: () => void;
}) {
  const { palette } = useTheme();
  const { t, language } = useI18n();
  const money = useMoneyFormat();
  const { width, ready, onLayout } = useMeasuredWidth(0);
  const staying = person.lines.filter((l) => !leaving.has(l.id));
  const total = staying.reduce((sum, l) => sum + l.amount, 0);
  // Oldest first, so the newest lies on top; at most three are drawn.
  const shown = [...person.lines].slice(0, 3).reverse();
  const layout = LAYOUTS[shown.length] ?? [];
  const name = person.name ?? t('owed.someone');
  return (
    <Animated.View layout={reflow} entering={FadeIn.duration(250)} exiting={FadeOut.duration(250)}>
      <PressScale
        scaleTo={0.98}
        accessibilityRole="button"
        accessibilityLabel={`${name}, ${money.spoken(total)}`}
        onPress={onOpen}
        style={{
          borderRadius: 26,
          backgroundColor: palette.cell,
          boxShadow: palette.cardShadow,
          paddingTop: 14,
          paddingHorizontal: 14,
          paddingBottom: 16,
          minHeight: 96,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 14,
        }}
      >
        <View style={{ width: 54, alignItems: 'center', gap: 6 }}>
          <Avatar name={person.name} size={40} />
          <Text numberOfLines={1} style={{ ...body(14, 650), color: palette.ink }}>
            {name}
          </Text>
        </View>
        <View onLayout={onLayout} style={{ flex: 1, height: 70 }}>
          {ready
            ? shown.map((line, i) => {
                const [at = 0, top = 0, tilt = 0] = layout[i] ?? [];
                const gone = leaving.has(line.id);
                const paid = gone && wasPaid(line.id) !== false;
                return gone ? (
                  <Animated.View
                    key={line.id}
                    exiting={flyOff}
                    style={{
                      position: 'absolute',
                      left: Math.max(0, width - SLIP) * at,
                      top,
                      transform: [{ rotate: `${tilt}deg` }],
                    }}
                  >
                    <Slip
                      what={slipWhat(line, merchants.get(line.spendId), language)}
                      amount={money.short(line.amount)}
                      stamp={
                        paid ? (
                          <Animated.View entering={stampIn}>
                            <PaidStamp />
                          </Animated.View>
                        ) : undefined
                      }
                    />
                  </Animated.View>
                ) : (
                  <Animated.View
                    key={line.id}
                    layout={reflow}
                    exiting={flyOff}
                    style={{
                      position: 'absolute',
                      left: Math.max(0, width - SLIP) * at,
                      top,
                      transform: [{ rotate: `${tilt}deg` }],
                    }}
                  >
                    <Slip
                      what={slipWhat(line, merchants.get(line.spendId), language)}
                      amount={money.short(line.amount)}
                    />
                  </Animated.View>
                );
              })
            : null}
        </View>
        <View style={{ alignItems: 'flex-end', gap: 8 }}>
          <Text
            style={{
              ...display(24, 500),
              ...tabular,
              color: palette.ink,
              minWidth: 62,
              textAlign: 'right',
            }}
          >
            {money.short(total)}
          </Text>
          <PressScale
            accessibilityRole="button"
            onPress={onAsk}
            hitSlop={6}
            style={{
              height: 32,
              paddingLeft: 9,
              paddingRight: 12,
              borderRadius: 99,
              backgroundColor: palette.btnBg,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 4,
            }}
          >
            <Symbol name="qr_code_2" size={17} color={palette.btnFg} />
            <Text style={{ ...body(13, 650), color: palette.btnFg }}>{t('owed.list.ask')}</Text>
          </PressScale>
        </View>
      </PressScale>
    </Animated.View>
  );
}

/**
 * Owed to you: what everyone still owes, and in how many strips; one card per person holding
 * their strips, with what they come to and Ask. A tap on a card offers Cover it, Paid in cash and
 * Ask again. Paid strips are stamped and fly off; the total recounts.
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
  // The shop each strip was a share of, from this cycle's spends (older ones show the day only).
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
          people.map((person) => (
            <PersonCard
              key={person.key}
              person={person}
              leaving={leavingIds}
              merchants={merchants}
              onOpen={() => {
                haptics.tick();
                setCovering(person);
              }}
              onAsk={() => {
                haptics.tap();
                ask(person);
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
