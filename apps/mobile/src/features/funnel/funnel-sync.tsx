import * as Application from 'expo-application';
import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState, Platform } from 'react-native';

import type { FunnelChannel, FunnelEvent } from '@6pm/domain';

import { useMoneyStore } from '../../data/money-provider';
import { useI18n } from '../../i18n/i18n';
import { apiBase } from '../api/native-api';
import { createFunnel, readFunnelSwitch, writeFunnelSwitch, type Funnel } from './funnel-counts';
import { createFunnelSend } from './funnel-send';

/** Launch is left alone: the first report waits this long. */
const FIRST_REPORT_MS = 4000;
/** A step a screen noted goes out this soon, so a person who stops mid-onboarding still counts. */
const NOTED_MS = 2000;

let current: Funnel | null = null;
let flush: (() => void) | null = null;
/** Steps noted before the funnel was ready, in order. */
const early: FunnelEvent[] = [];

/** Notes a step a screen reached; it is sent shortly after, if counts are on. */
export function noteFunnel(event: FunnelEvent): void {
  if (current === null) {
    early.push(event);
    return;
  }
  void current.note(event).then(
    () => flush?.(),
    () => undefined,
  );
}

/** Where a person said they heard of 6pm, when the app knows; null when it does not. */
export type MaxChannelReader = () => Promise<FunnelChannel | null>;
let readMaxChannel: MaxChannelReader | null = null;

/** Lets the Max code feature say where a buyer heard of 6pm, without this module knowing it. */
export function setMaxChannelReader(read: MaxChannelReader | null): void {
  readMaxChannel = read;
}

/** Max was bought: the plan, and the channel when a code named one. */
export function noteMaxBought(plan: 'monthly' | 'yearly' | 'lifetime'): void {
  noteFunnel({ step: 'max_bought', detail: plan });
  readMaxChannel?.()
    .then((channel) => {
      if (channel !== null) noteFunnel({ step: 'max_bought_from', detail: channel });
    })
    .catch(() => undefined);
}

/**
 * Starts the counts once the money store is open: a report a few seconds after launch, each time
 * the app comes back to the front, and shortly after a screen notes a step.
 */
export function FunnelSync(): null {
  const store = useMoneyStore();
  const { language } = useI18n();
  const languageRef = useRef(language);
  languageRef.current = language;

  useEffect(() => {
    const funnel = createFunnel({
      db: store.db,
      send: createFunnelSend({
        baseUrl: apiBase(),
        fetch: globalThis.fetch.bind(globalThis),
        platform: Platform.OS,
        version: Application.nativeApplicationVersion,
        language: () => languageRef.current,
      }),
    });
    current = funnel;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const reportIn = (ms: number) => {
      clearTimeout(timer);
      timer = setTimeout(() => void funnel.report().catch(() => undefined), ms);
    };
    flush = () => reportIn(NOTED_MS);
    for (const event of early.splice(0)) void funnel.note(event).catch(() => undefined);
    reportIn(FIRST_REPORT_MS);
    const subscription = AppState.addEventListener('change', (next) => {
      if (next === 'active') reportIn(FIRST_REPORT_MS);
    });
    return () => {
      clearTimeout(timer);
      subscription.remove();
      if (current === funnel) {
        current = null;
        flush = null;
      }
    };
  }, [store]);
  return null;
}

/**
 * Privacy's "Anonymous counts" switch: on unless the person turned it off; null until read. In
 * on-device mode the counts are off whatever it says, and the row is not shown.
 */
export function useFunnelSwitch(): {
  readonly on: boolean | null;
  readonly set: (on: boolean) => void;
} {
  const { db } = useMoneyStore();
  const [on, setOn] = useState<boolean | null>(null);
  useEffect(() => {
    let live = true;
    readFunnelSwitch(db)
      .then((value) => {
        if (live) setOn(value);
      })
      .catch(() => undefined);
    return () => {
      live = false;
    };
  }, [db]);
  const set = useCallback(
    (next: boolean) => {
      setOn(next);
      writeFunnelSwitch(db, next).catch(() => setOn(!next));
    },
    [db],
  );
  return { on, set };
}
