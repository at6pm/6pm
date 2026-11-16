import { useState } from 'react';

import {
  addDays,
  moneyNextOf,
  replanWorded,
  type DailyNumber,
  type LocalDate,
  type StreakMilestone,
} from '@6pm/domain';
import { localeOf } from '@6pm/i18n';

import { useMoney } from '../../data/money-provider';
import { useI18n } from '../../i18n/i18n';
import { useMoneyFormat } from '../../money/use-money-format';
import { ShareChip } from '../sharing/share-chip';
import { StreakSunset } from '../sharing/streak-sunset';
import { useMarkStreakOffered } from '../sharing/streak-offer';
import { monthDots } from './month-dots';
import { CloseReveal } from './close-reveal';

/**
 * The chip comes in 600 ms after the reveal settles: the number starts rolling at 700 ms and
 * rolls for about a second.
 */
const CHIP_AFTER_MS = 2300;

/**
 * Tomorrow's number for the day just closed, with the month's dots and the companion's line; on a
 * streak milestone, the streak as sunsets and the chip that shares its card.
 */
export function CloseRevealStep({
  day,
  number,
  milestone: found,
  onDone,
}: {
  readonly day: LocalDate;
  readonly number: DailyNumber;
  /** The streak milestone tonight reaches (`useStreakMilestone`, read as the close opened). */
  readonly milestone: StreakMilestone | null;
  readonly onDone: () => void;
}) {
  // Kept as the reveal first drew it: a milestone read late never swaps the dots for the suns.
  const [milestone] = useState(found);
  useMarkStreakOffered(milestone);
  const { t, language } = useI18n();
  const money = useMoneyFormat();
  const snap = useMoney();
  const plan = snap.plan;
  if (!plan) return null;
  const locale = localeOf(language);
  const on = new Date(`${day}T12:00:00`);
  const tomorrow = new Date(`${addDays(day, 1)}T12:00:00`);
  const monthName = new Intl.DateTimeFormat(locale, { month: 'long' }).format(on);
  const monthDays = monthDots(day, snap.closedDays);
  // Companion keys are composed from the event and persona; every one takes the same placeholders.
  const lineFor = t as unknown as (key: string, params: Record<string, string | number>) => string;
  // A day that takes the cycle past its plan never hears that the month still lands, and a
  // tomorrow that reads the same as today ("43k, not 43k") is not news.
  const event =
    number.spent === 0
      ? 'zero'
      : number.overspent
        ? 'pastPlan'
        : number.replan && replanWorded(number, (amount) => money.short(amount))
          ? 'replan'
          : 'reveal';

  return (
    <CloseReveal
      kicker={t('close.reveal.kicker', {
        date: new Intl.DateTimeFormat(locale, { weekday: 'short', day: 'numeric', month: 'short' })
          .format(tomorrow)
          .toUpperCase(),
      })}
      from={Math.max(0, number.safe)}
      to={number.tomorrow}
      line={
        plan.serious
          ? null
          : lineFor(`companion.${event}.${plan.persona}`, {
              t: money.short(number.tomorrow),
              b: money.short(number.line),
              day: new Intl.DateTimeFormat(locale, { weekday: 'long' }).format(on),
            })
      }
      mood={event === 'replan' || event === 'pastPlan' ? 'nod' : 'happy'}
      sub={t('close.reveal.free', {
        free: money.short(number.free),
        days: moneyNextOf(day, plan).daysLeft,
      })}
      month={monthName.toUpperCase()}
      monthDays={monthDays}
      streak={t('close.reveal.streak', {
        closed: monthDays.filter((d) => d !== 'open').length,
        days: Number(day.slice(8, 10)),
        month: monthName,
      })}
      nudge={t('close.reveal.nudge', { time: plan.closeAt })}
      doneLabel={t('close.reveal.done')}
      onDone={onDone}
      milestone={
        milestone === null
          ? null
          : {
              art: <StreakSunset />,
              line: t('shareCards.streak.reveal', { count: milestone }),
              chip: (
                <ShareChip
                  card="streak"
                  of={day}
                  label={t('shareCards.chipPostcard')}
                  delay={CHIP_AFTER_MS}
                />
              ),
            }
      }
    />
  );
}
