import { hoursOf, SURFACES_VERSION, type CloseActivityState, type LocalDate } from '@6pm/domain';
import { CLOSE_SLIP, planInk, type Palette } from '@6pm/theme';

import type { RunningActivity } from '../../../modules/surfaces';
import type { I18n } from '../../i18n/i18n';
import type { ActivityPlan } from './live-activity-plan';
import { momentOf } from './surface-cards';
import { glyphOf } from './surface-glyph';

/** The close stays on the Lock Screen this long after it is due: 18:00 to 21:00. */
const CLOSE_HOURS = 3;
/** Slips drawn for the waiting spends, at most. */
const MOST_SLIPS = 4;

/** The close's Live Activity, worded in the app's language and coloured by the look at six. */
export function closeActivityState(input: {
  readonly day: LocalDate;
  readonly waiting: number;
  readonly t: I18n['t'];
  readonly palette: Palette;
}): CloseActivityState {
  const { day, waiting, t, palette } = input;
  return {
    v: SURFACES_VERSION,
    day,
    title: t('widgets.close.title'),
    detail: waiting > 0 ? t('widgets.close.waiting', { count: waiting }) : t('widgets.close.none'),
    slips: Math.min(MOST_SLIPS, waiting),
    start: t('widgets.close.start'),
    path: '/app/close',
    icon: glyphOf('wb_twilight'),
    accent: palette.accent,
    onAccent: planInk.onAccent,
    paper: CLOSE_SLIP,
  };
}

export interface ClosePlanInput {
  readonly running: readonly RunningActivity[];
  /** The money day. */
  readonly today: LocalDate;
  readonly closed: boolean;
  /** 'HH:MM': when the person closes. */
  readonly closeAt: string;
  readonly now: Date;
  /** iOS only starts (or asks for) an activity while the app is in the foreground. */
  readonly foreground: boolean;
  readonly enabled: boolean;
  /** iOS 26 and later start an activity at a time of the app's choosing. */
  readonly canSchedule: boolean;
  readonly stateJson: string;
  /** What the activity says as it arrives. */
  readonly alertTitle: string;
  readonly alertBody: string;
}

export interface ClosePlan extends Omit<ActivityPlan, 'start'> {
  readonly start: {
    readonly kind: 'close';
    readonly key: string;
    readonly stateJson: string;
    readonly timing: {
      readonly startAt?: string;
      readonly staleAt: string;
      readonly alertTitle: string;
      readonly alertBody: string;
    };
  } | null;
}

/**
 * The close at six on the Lock Screen: one activity for the money day, from the close until three
 * hours after it. It is asked for ahead of time where iOS can start it by itself (iOS 26), and
 * otherwise started when the app is opened in that window; it is updated as spends wait for it,
 * and it ends once the day is closed, the window is over, or the day has turned.
 */
export function closeActivityPlan(input: ClosePlanInput): ClosePlan {
  const due = momentOf(input.today, hoursOf(input.closeAt));
  const over = new Date(due.getTime() + CLOSE_HOURS * 60 * 60 * 1000);
  const wanted = !input.closed && input.now < over;
  const update: { id: string; stateJson: string }[] = [];
  const end: { id: string; finalStateJson: null }[] = [];
  let kept = false;
  for (const activity of input.running) {
    if (activity.kind !== 'close') continue;
    if (wanted && !kept && activity.key === input.today) {
      kept = true;
      if (activity.stateJson !== input.stateJson) {
        update.push({ id: activity.id, stateJson: input.stateJson });
      }
    } else {
      end.push({ id: activity.id, finalStateJson: null });
    }
  }
  const ahead = input.now < due;
  const canStart =
    wanted && !kept && input.foreground && input.enabled && (!ahead || input.canSchedule);
  const start = canStart
    ? {
        kind: 'close' as const,
        key: input.today,
        stateJson: input.stateJson,
        timing: {
          ...(ahead ? { startAt: due.toISOString() } : {}),
          staleAt: over.toISOString(),
          alertTitle: input.alertTitle,
          alertBody: input.alertBody,
        },
      }
    : null;
  return { start, update, end };
}
