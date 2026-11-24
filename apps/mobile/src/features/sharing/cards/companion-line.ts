import type { I18n } from '../../../i18n/i18n';

/** The hero cards' moments in the companion's catalogue (`companion.<moment>.<persona>`). */
export type CardMoment = 'goalCard' | 'habitCard' | 'streakCard';

/**
 * The companion's own line for a card, in the person's chosen personality (cheeky until they
 * choose). Serious mode prints none: the layout leaves it out.
 */
export function companionLine(
  t: I18n['t'],
  moment: CardMoment,
  persona: 'soft' | 'cheeky' | 'roast' | undefined,
): string {
  return t(`companion.${moment}.${persona ?? 'cheeky'}`);
}
