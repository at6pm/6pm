import type { Entry } from '../catalogue-types';
import type { enBanks } from '../en-banks';

export const deBanks: { readonly [Key in keyof typeof enBanks]: Entry } = {
  'banks.title': 'Banken und Wallets',
  'banks.sub': 'Damit 6pm ihre Belege und QR-Codes erkennt. Wähl alle, die du nutzt.',
  'banks.search': 'Banken und Wallets suchen',
  'banks.clear': 'Suche löschen',
  'banks.suggested': 'Vorschläge für dich',
  'banks.yours': 'Deine und Vorschläge',
  'banks.all': 'Alle Banken und Wallets',
  'banks.none': 'Keine Bank und kein Wallet passt zu „{query}“.',
  'banks.yoursOnly': 'Deine',
  'banks.typeHint':
    'Such deine Bank oder dein Wallet oder tipp den Namen ein, um sie hinzuzufügen.',
  'banks.byName': 'Per Name hinzufügen',
  'banks.kind.bank': 'Bank',
  'banks.kind.wallet': 'E-Wallet',
};
