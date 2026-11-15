import type { SetAsideNamed } from '@6pm/domain';

import type { useI18n } from '../../i18n/i18n';

type T = ReturnType<typeof useI18n>['t'];

/**
 * The companion's line for money that just landed: it names only what is set aside in full (the
 * bills, Future you, both, or neither), and says how many more days are in hand only when there is
 * a whole one.
 */
export function landingLine(
  t: T,
  words: {
    readonly name: string;
    readonly amount: string;
    readonly line: string;
    readonly inHand: number;
    readonly named: SetAsideNamed;
  },
): string {
  const { named, inHand, ...rest } = words;
  const base = { ...rest, count: inHand };
  if (named === 'none') {
    return inHand > 0
      ? t('companion.income.inPlain', base)
      : t('companion.income.inPlainNoHand', base);
  }
  const setAside = t(`companion.income.setAside.${named}`);
  return inHand > 0
    ? t('companion.income.in', { ...base, setAside })
    : t('companion.income.inNoHand', { ...base, setAside });
}
