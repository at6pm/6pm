import type { Entry } from '../catalogue-types';
import type { enYearBook } from '../en-year-book';

export const deYearBook: { readonly [Key in keyof typeof enYearBook]: Entry } = {
  'yearBook.binds': 'Wird am 31. Dezember gebunden. Zwölf Tagebücher in einem.',
  'yearBook.bound': 'Am 31. Dezember gebunden. Tippe, um es als PDF zu teilen.',
  'yearBook.binding': 'Dein Jahrbuch wird gebunden …',
  'yearBook.failed': 'Das Jahrbuch ließ sich nicht binden. Versuch es gleich noch mal.',
  'yearBook.shareTitle': 'Das Jahrbuch {year}',
  'yearBook.cover.kicker': '6PM · GELDTAGEBÜCHER',
  'yearBook.cover.sub': {
    one: 'Ein Geldtagebuch, gebunden am 31. Dezember.',
    other: '{count} Geldtagebücher, gebunden am 31. Dezember.',
  },
  'yearBook.cover.closed': {
    one: '{count} TAG UM 6PM ABGESCHLOSSEN',
    other: '{count} TAGE UM 6PM ABGESCHLOSSEN',
  },
  'yearBook.summary.kicker': 'DAS JAHRBUCH · {year}',
  'yearBook.summary.headline.spare': 'Du hast {year} mit {amount} übrig beendet.',
  'yearBook.summary.headline.over': 'Dieses Jahr ein bisschen über Plan. {next} fängt frisch an.',
  'yearBook.summary.futureYouSub': 'dieses Jahr zurückgelegt',
  'yearBook.summary.contents': 'DIE TAGEBÜCHER',
};
