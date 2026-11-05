import { useEffect, useMemo, useRef, useState } from 'react';
import { AppState } from 'react-native';

import { addDays, localDateOf, type PlannedNotification } from '@6pm/domain';

import { catchesSince } from '../../data/first-catch';
import { readReadyShown } from '../../data/jar-ready';
import { useMoney, useMoneyStore } from '../../data/money-provider';
import type { MoneySnapshot } from '../../data/money-store';
import {
  readNotificationMemory,
  writeNotificationMemory,
  type NotificationSettings,
} from '../../data/notification-settings';
import { useI18n, type I18n } from '../../i18n/i18n';
import { useMoneyFormat } from '../../money/use-money-format';
import { clockNow } from '../../ui/theme/clock';
import { useLastAlert } from '../capture-guide/last-alert';
import { channelNames } from '../onboarding/close-reminder';
import { useNewYear } from '../pots/use-new-year';
import { nativeReach } from '../surfaces/native-reach';
import { memoryAfter, paydayOf, plannedNotifications, quietWaysOf } from './notification-inputs';
import { useNotificationSettings } from './notification-prefs';
import { scheduleNotifications, type NotificationRequest } from './notification-schedule';
import { toneOf, wordsFor, type WordsContext } from './notification-words';
import { refreshReminderPermission, useReminderPermission } from './reminder-permission';

/** Catches are read this far back for a way gone quiet. */
const LOOK_BACK_DAYS = 30;
/** Changes that land together are scheduled once. */
const SETTLE_MS = 400;

/** Where a notification's tap leads, carried in its data when its id does not say. */
function dataOf(notice: PlannedNotification): Readonly<Record<string, string>> | undefined {
  if (notice.kind === 'reminders' && notice.people.length === 1 && notice.people[0]) {
    return { person: notice.people[0].key };
  }
  if (notice.kind === 'capture') return { way: notice.way };
  return undefined;
}

/** Everything that changes what is scheduled, so a rebuild runs only when one of them moves. */
function keyOf(snapshot: MoneySnapshot, settings: NotificationSettings, extra: string): string {
  return JSON.stringify([
    snapshot.today,
    snapshot.plan,
    snapshot.closedDays.map((d) => d.day),
    snapshot.pots.map((p) => [p.id, p.name, p.goal, p.neededBy, p.archivedAt, p.paused]),
    snapshot.potSaved,
    snapshot.owed.map((o) => [o.id, o.amount, o.remindAt, o.settledAt]),
    snapshot.cycleSpends.filter((s) => s.direction === 'in').map((s) => [s.id, s.status]),
    snapshot.waitingBefore.filter((s) => s.direction === 'in').map((s) => [s.id, s.status]),
    snapshot.bills.map((b) => [b.amount, b.lastMonth]),
    settings,
    extra,
  ]);
}

/**
 * Keeps 6pm's notifications matching the plan: the close reminder on each coming day not closed
 * yet, carrying that day's news, and beside it payday, a way gone quiet and the reminders the
 * person set, as the domain plans them (`planReminders`). Rebuilt whole on launch, each time the
 * app comes back, after a close, and whenever the plan, a jar, money in, who owes what, a switch,
 * the language, the tone or the permission changes. Nothing is scheduled before a plan exists or
 * while notifications are not allowed.
 */
export function CloseReminderSync() {
  const i18n = useI18n();
  const money = useMoneyFormat();
  const snapshot = useMoney();
  const store = useMoneyStore();
  const { settings } = useNotificationSettings();
  const { tradition } = useNewYear();
  const lastAlert = useLastAlert();
  const permission = useReminderPermission();
  const [returns, setReturns] = useState(0);
  const latest = useRef({ snapshot, i18n, money, tradition, lastAlert });
  latest.current = { snapshot, i18n, money, tradition, lastAlert };

  useEffect(() => {
    void refreshReminderPermission();
    const sub = AppState.addEventListener('change', (state) => {
      if (state !== 'active') return;
      void refreshReminderPermission();
      setReturns((n) => n + 1);
    });
    return () => sub.remove();
  }, []);

  const key = useMemo(
    () =>
      settings === null
        ? null
        : keyOf(
            snapshot,
            settings,
            [i18n.language, tradition, lastAlert?.at, money.short(1_000_000)].join('|'),
          ),
    [snapshot, settings, i18n.language, tradition, lastAlert, money],
  );

  useEffect(() => {
    if (key === null || settings === null || permission !== 'granted') return;
    if (latest.current.snapshot.plan === null) return;
    let live = true;
    const timer = setTimeout(() => {
      void rebuild(store, settings, latest.current, () => live).catch(() => undefined);
    }, SETTLE_MS);
    return () => {
      live = false;
      clearTimeout(timer);
    };
  }, [key, settings, permission, returns, store]);

  return null;
}

async function rebuild(
  store: ReturnType<typeof useMoneyStore>,
  settings: NotificationSettings,
  current: {
    readonly snapshot: MoneySnapshot;
    readonly i18n: I18n;
    readonly money: WordsContext['money'];
    readonly tradition: WordsContext['tradition'];
    readonly lastAlert: ReturnType<typeof useLastAlert>;
  },
  live: () => boolean,
): Promise<void> {
  const { snapshot, i18n, money, tradition, lastAlert } = current;
  const { plan } = snapshot;
  if (plan === null) return;
  const now = clockNow();
  const since = addDays(localDateOf(now), -LOOK_BACK_DAYS);
  const [readyShown, memory, catches] = await Promise.all([
    readReadyShown(store.db).catch(() => new Set<string>()),
    readNotificationMemory(store.db),
    catchesSince(store.db, new Date(`${since}T00:00:00`).toISOString()).catch(() => []),
  ]);
  if (!live()) return;
  const quietWays = quietWaysOf({
    catches,
    lastAlert: lastAlert
      ? { day: localDateOf(new Date(lastAlert.at)), bank: lastAlert.bank }
      : null,
    ways: { alert: nativeReach.bankAlerts, applePay: nativeReach.wallet },
    memory,
  });
  const planned = plannedNotifications({
    now,
    snapshot,
    settings,
    readyShown,
    tradition,
    quietWays,
  });
  const ctx: WordsContext = {
    t: i18n.t,
    dayMonth: i18n.dayMonth,
    money,
    tone: toneOf(plan),
    amounts: settings.amounts,
    closeAt: plan.closeAt,
    jarNames: Object.fromEntries(snapshot.pots.map((p) => [p.id, p.name])),
    tradition,
    payday: paydayOf(snapshot),
  };
  const requests: NotificationRequest[] = planned.map((notice) => {
    const data = dataOf(notice);
    return {
      id: notice.id,
      kind: notice.kind,
      at: notice.at,
      body: wordsFor(notice, ctx),
      ...(data ? { data } : {}),
    };
  });
  await scheduleNotifications(requests, channelNames(i18n.language));
  const next = memoryAfter(memory, planned, now);
  if (JSON.stringify(next) !== JSON.stringify(memory)) await writeNotificationMemory(store, next);
}
