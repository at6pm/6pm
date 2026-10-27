import type { Entry } from '../catalogue-types';
import type { enBanks } from '../en-banks';

export const esBanks: { readonly [Key in keyof typeof enBanks]: Entry } = {
  'banks.title': 'Bancos y monederos',
  'banks.sub': 'Así 6pm reconoce sus tickets y sus códigos QR. Elige todos los que uses.',
  'banks.search': 'Busca bancos y monederos',
  'banks.clear': 'Borrar búsqueda',
  'banks.suggested': 'Sugeridos para ti',
  'banks.yours': 'Tuyos y sugeridos',
  'banks.all': 'Todos los bancos y monederos',
  'banks.none': 'Ningún banco ni monedero coincide con “{query}”.',
  'banks.yoursOnly': 'Tuyos',
  'banks.typeHint': 'Busca tu banco o monedero, o escribe su nombre para añadirlo.',
  'banks.byName': 'Añadir por nombre',
  'banks.kind.bank': 'Banco',
  'banks.kind.wallet': 'Monedero',
};
