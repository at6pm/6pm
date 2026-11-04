import { isFutureYouPot, type PotRow } from '@6pm/domain';

import type { I18n } from '../../i18n/i18n';

/**
 * A jar's name as the screens say it. Future you's jar is always named in the phone's language,
 * never by the text its row keeps; every other jar by the name its person gave it.
 */
export function jarName(pot: Pick<PotRow, 'id' | 'name'>, t: I18n['t']): string {
  return isFutureYouPot(pot) ? t('pots.futureYou') : pot.name;
}
