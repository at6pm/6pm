import type { Entry } from '../catalogue-types';
import type { enYearBook } from '../en-year-book';

export const frYearBook: { readonly [Key in keyof typeof enYearBook]: Entry } = {
  'yearBook.binds': 'Relié le 31 décembre. Douze journaux en un.',
  'yearBook.bound': 'Relié le 31 décembre. Touche pour le partager en PDF.',
  'yearBook.binding': 'Reliure de ton album en cours…',
  'yearBook.failed': 'Impossible de relier l’album. Réessaie dans un instant.',
  'yearBook.shareTitle': 'L’album de l’année {year}',
  'yearBook.cover.kicker': '6PM · JOURNAUX D’ARGENT',
  'yearBook.cover.sub': {
    one: '{count} journal d’argent, relié le 31 décembre.',
    other: '{count} journaux d’argent, reliés le 31 décembre.',
  },
  'yearBook.cover.closed': {
    one: '{count} JOUR CLÔTURÉ À 18 H',
    other: '{count} JOURS CLÔTURÉS À 18 H',
  },
  'yearBook.summary.kicker': 'L’ALBUM DE L’ANNÉE · {year}',
  'yearBook.summary.headline.spare': 'Tu termines {year} avec {amount} de marge.',
  'yearBook.summary.headline.over': 'Un peu au-dessus du plan cette année. {next} repart à zéro.',
  'yearBook.summary.futureYouSub': 'mis de côté cette année',
  'yearBook.summary.contents': 'LES JOURNAUX',
};
