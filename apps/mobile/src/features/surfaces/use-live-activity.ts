import * as Sentry from '@sentry/react-native';
import { usePathname } from 'expo-router';
import { useEffect, useMemo, useRef } from 'react';
import { AppState, Platform } from 'react-native';

import { DEFAULT_CLOSE_AT, hoursOf, type MoneyFormat } from '@6pm/domain';
import { paletteFor } from '@6pm/theme';

import { surfaces } from '../../../modules/surfaces';
import { useMoney } from '../../data/money-provider';
import { dayOf, waitingOf } from '../../data/money-store';
import { useI18n } from '../../i18n/i18n';
import { phoneNumberStyle } from '../../money/device-money';
import { useClock } from '../../ui/theme/clock';
import { useTravel } from '../travel/travel-provider';
import { pendingPayState, travelState } from './activity-state';
import { closeActivityPlan, closeActivityState, type ClosePlan } from './close-activity-plan';
import { liveActivityPlan, pendingPayments, type ActivityPlan } from './live-activity-plan';
import { travelActivityPlan } from './travel-activity-plan';
import type { WidgetLook } from './surface-palette';

/** Scan's own route: while it is open it is still asking "Did it go through?". */
const SCAN_ROUTE = '/scan';

/**
 * Runs the Live Activity plans whenever the money, the trip, the route or the foreground changes:
 * the newest waiting QR payment of the money day gets one activity, which ends once it is
 * answered, and a trip under way gets one of its own. One run at a time, each reading what iOS
 * has running at that moment.
 */
export function useLiveActivity(look: WidgetLook, format: MoneyFormat) {
  const money = useMoney();
  const { t } = useI18n();
  const hour = Math.floor(useClock().hour);
  const pathname = usePathname();
  const { trip } = useTravel();

  const palette = useMemo(
    () =>
      paletteFor({
        look: look.look,
        hour,
        serious: look.serious,
        ...(look.config ? { config: look.config } : {}),
      }),
    [look, hour],
  );
  const inputs = useRef({ money, t, format, palette, look, trip, held: pathname === SCAN_ROUTE });
  inputs.current = { money, t, format, palette, look, trip, held: pathname === SCAN_ROUTE };
  const running = useRef<Promise<unknown>>(Promise.resolve());

  useEffect(() => {
    const native = surfaces;
    if (!native) return;
    const run = () => {
      running.current = running.current
        .then(async () => {
          const now = inputs.current;
          const running = await native.listActivities();
          const foreground = AppState.currentState === 'active';
          const enabled = native.activitiesEnabled();
          const pay = liveActivityPlan({
            running,
            pending: pendingPayments(now.money),
            closed: now.money.closedDays.some((d) => d.day === now.money.today),
            foreground,
            enabled,
            held: now.held,
            stateOf: (spend) =>
              JSON.stringify(
                pendingPayState(spend, {
                  t: now.t,
                  format: now.format,
                  palette: now.palette,
                  serious: now.look.serious,
                }),
              ),
          });
          const day = dayOf(now.money);
          const state =
            now.trip === null || day === null
              ? null
              : travelState(now.trip, day, {
                  t: now.t,
                  palette: now.palette,
                  format: now.format,
                  phone: phoneNumberStyle(),
                });
          const travel = travelActivityPlan({
            running,
            trip:
              now.trip === null || state === null
                ? null
                : { key: now.trip.key, stateJson: JSON.stringify(state) },
            foreground,
            enabled,
          });
          const closeAt = now.money.plan?.closeAt ?? DEFAULT_CLOSE_AT;
          const waiting = waitingOf(now.money).length;
          const closeState = closeActivityState({
            day: now.money.today,
            waiting,
            t: now.t,
            palette: paletteFor({
              look: now.look.look,
              hour: hoursOf(closeAt),
              serious: now.look.serious,
              ...(now.look.config ? { config: now.look.config } : {}),
            }),
          });
          // Before the month is set up there is no close to come to.
          const close = closeActivityPlan({
            running,
            today: now.money.today,
            closed: day === null || now.money.closedDays.some((d) => d.day === now.money.today),
            closeAt,
            now: new Date(),
            foreground,
            enabled,
            canSchedule:
              Platform.OS === 'ios' && Number.parseInt(String(Platform.Version), 10) >= 26,
            stateJson: JSON.stringify(closeState),
            alertTitle: closeState.title,
            alertBody: closeState.detail,
          });
          await apply(native, pay);
          await apply(native, travel);
          await apply(native, close);
        })
        .catch((error: unknown) => Sentry.captureException(error));
    };
    run();
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') run();
    });
    return () => sub.remove();
  }, [money, t, format, palette, look, trip, pathname]);
}

async function apply(native: NonNullable<typeof surfaces>, plan: ActivityPlan | ClosePlan) {
  for (const { id, finalStateJson } of plan.end) await native.endActivity(id, finalStateJson);
  for (const { id, stateJson } of plan.update) await native.updateActivity(id, stateJson);
  if (!plan.start) return;
  const timing = 'timing' in plan.start ? plan.start.timing : null;
  await native.startActivity(plan.start.kind, plan.start.key, plan.start.stateJson, timing);
}
