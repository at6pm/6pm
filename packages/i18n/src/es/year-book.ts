import type { Entry } from '../catalogue-types';
import type { enYearBook } from '../en-year-book';

export const esYearBook: { readonly [Key in keyof typeof enYearBook]: Entry } = {
  'yearBook.binds': 'Se encuaderna el 31 de diciembre. Doce diarios en uno.',
  'yearBook.bound': 'Encuadernado el 31 de diciembre. Toca para compartirlo en PDF.',
  'yearBook.binding': 'Encuadernando tu anuario…',
  'yearBook.failed': 'No se pudo encuadernar el anuario. Inténtalo de nuevo en un momento.',
  'yearBook.shareTitle': 'El anuario de {year}',
  'yearBook.cover.kicker': '6PM · DIARIOS DEL DINERO',
  'yearBook.cover.sub': {
    one: 'Un diario del dinero, encuadernado el 31 de diciembre.',
    other: '{count} diarios del dinero, encuadernados el 31 de diciembre.',
  },
  'yearBook.cover.closed': {
    one: '{count} DÍA CERRADO A LAS 6PM',
    other: '{count} DÍAS CERRADOS A LAS 6PM',
  },
  'yearBook.summary.kicker': 'EL ANUARIO · {year}',
  'yearBook.summary.headline.spare': 'Terminaste {year} con {amount} de sobra.',
  'yearBook.summary.headline.over':
    'Este año, un poco por encima del plan. {next} empieza de cero.',
  'yearBook.summary.futureYouSub': 'apartado este año',
  'yearBook.summary.contents': 'LOS DIARIOS',
};
