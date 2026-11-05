import {
  DEFAULT_CLOSE_AT,
  type CloseLine,
  type LunarTradition,
  type MoneyFormat,
  type PaydayPreview,
  type PlannedNotification,
} from '@6pm/domain';

import type { I18n } from '../../i18n/i18n';

/** The companion's voice for the words: the person's tone, or serious mode's plain one. */
export type Tone = 'soft' | 'cheeky' | 'roast' | 'plain';

export function toneOf(plan: { readonly persona: Tone; readonly serious: boolean } | null): Tone {
  if (plan === null) return 'cheeky';
  return plan.serious ? 'plain' : plan.persona;
}

/** What the words need beyond the plan of what to send. */
export interface WordsContext {
  readonly t: I18n['t'];
  readonly dayMonth: I18n['dayMonth'];
  readonly money: Pick<MoneyFormat, 'short'>;
  readonly tone: Tone;
  /** Amounts in the words: off, the lock screen shows none. */
  readonly amounts: boolean;
  readonly closeAt: string;
  /** Each jar's name, by id. */
  readonly jarNames: Readonly<Record<string, string>>;
  readonly tradition: LunarTradition | null;
  /** What payday's notification says, when one is planned. */
  readonly payday: PaydayPreview | null;
}

const festivalOf = (ctx: WordsContext): string =>
  ctx.t(`season.festival.${ctx.tradition ?? 'tet'}`);

/** "It's six." at 18:00, "It's 19:30." at any other close time. */
function leadOf(ctx: WordsContext): string {
  return ctx.closeAt === DEFAULT_CLOSE_AT
    ? ctx.t('notify.close.leadSix')
    : ctx.t('notify.close.leadAt', { time: ctx.closeAt });
}

/** The close reminder's one line for its day. */
export function closeWords(line: CloseLine, ctx: WordsContext): string {
  const { t, tone } = ctx;
  const lead = leadOf(ctx);
  switch (line.kind) {
    case 'plain':
      return ctx.closeAt === DEFAULT_CLOSE_AT
        ? t('reminder.close.six')
        : t('reminder.close.at', { time: ctx.closeAt });
    case 'jarReady': {
      const jar = ctx.jarNames[line.jarId];
      if (jar === undefined) return closeWords({ kind: 'plain' }, ctx);
      return t(`notify.close.jarReady.${tone}`, { lead, jar });
    }
    case 'countdown': {
      const festival = festivalOf(ctx);
      if (line.jarId !== null && ctx.amounts) {
        return t(`notify.close.countdownJar.${tone}`, {
          lead,
          festival,
          count: line.left,
          amount: ctx.money.short(line.held),
        });
      }
      return t(`notify.close.countdown.${tone}`, { lead, festival, count: line.left });
    }
    case 'money':
      if (line.what === 'pay') return t(`notify.close.pay.${tone}`, { lead });
      if (line.what === 'bonus') {
        return t(`notify.close.bonus.${tone}`, { lead, festival: festivalOf(ctx) });
      }
      if (line.what === 'payback' && line.name !== null) {
        return t(`notify.close.payback.${tone}`, { lead, name: line.name });
      }
      return t(`notify.close.moneyIn.${tone}`, { lead });
    case 'yearCard':
      return t(`notify.close.yearCard.${tone}`, { lead, year: line.year });
  }
}

/** Payday's words: the jars and the day's line with amounts allowed, else no numbers at all. */
export function paydayWords(ctx: WordsContext): string {
  const { t, payday } = ctx;
  const jars = payday?.jars ?? 0;
  if (!ctx.amounts || payday === null) {
    return jars > 0 ? t('notify.payday.hidden') : t('notify.payday.hiddenNoJars');
  }
  const date = ctx.dayMonth(new Date(`${payday.until}T12:00:00`));
  const daily = ctx.money.short(payday.daily);
  return jars > 0
    ? t(`notify.payday.amounts.${ctx.tone}`, { jars: ctx.money.short(jars), daily, date })
    : t('notify.payday.noJars', { daily, date });
}

/** "Linh still owes you 300k.", or, for several people on one day, how many and how much. */
export function owedWords(
  people: Extract<PlannedNotification, { kind: 'reminders' }>['people'],
  ctx: WordsContext,
): string {
  const { t } = ctx;
  const [first] = people;
  if (people.length > 1 || first === undefined) {
    const total = people.reduce((sum, p) => sum + p.amount, 0);
    return ctx.amounts
      ? t('notify.owed.many', { count: people.length, amount: ctx.money.short(total) })
      : t('notify.owed.manyHidden', { count: people.length });
  }
  const amount = ctx.money.short(first.amount);
  if (first.name === null) {
    return ctx.amounts ? t('notify.owed.noName', { amount }) : t('notify.owed.noNameHidden');
  }
  return ctx.amounts
    ? t(`notify.owed.one.${ctx.tone}`, { name: first.name, amount })
    : t('notify.owed.oneHidden', { name: first.name });
}

/** "Nothing from MB in 3 days. Is the automation still on?" */
export function quietWords(
  notice: Extract<PlannedNotification, { kind: 'capture' }>,
  ctx: WordsContext,
): string {
  const way =
    notice.way === 'applePay' ? 'Wallet' : (notice.bank ?? ctx.t('notify.quiet.yourAlerts'));
  return ctx.t(`notify.quiet.${ctx.tone}`, { way, count: notice.days });
}

/**
 * The first catch's words, for the alert reader and the Wallet shortcut to fill in on the phone
 * with what they caught (`{amount}`, `{name}`): amounts only when the lock screen may show them.
 */
export function firstCatchWords(ctx: Pick<WordsContext, 't' | 'tone' | 'amounts'>): {
  readonly named: string;
  readonly noName: string;
} {
  const amount = '{amount}';
  const name = '{name}';
  return {
    named: ctx.amounts
      ? ctx.t(`notify.firstCatch.amounts.${ctx.tone}`, { amount, name })
      : ctx.t('notify.firstCatch.hidden', { name }),
    noName: ctx.t('notify.firstCatch.noName'),
  };
}

/** Every notification's words, by kind. */
export function wordsFor(notice: PlannedNotification, ctx: WordsContext): string {
  switch (notice.kind) {
    case 'close':
      return closeWords(notice.line, ctx);
    case 'payday':
      return paydayWords(ctx);
    case 'reminders':
      return owedWords(notice.people, ctx);
    case 'capture':
      return quietWords(notice, ctx);
  }
}
