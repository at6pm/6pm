import type { Entry } from '../catalogue-types';
import type { enBanks } from '../en-banks';

// A wallet here is an e-wallet ("dompet digital"), not Apple's Wallet app.
export const idBanks: { readonly [Key in keyof typeof enBanks]: Entry } = {
  'banks.title': 'Bank dan dompet digital',
  'banks.sub': 'Supaya 6pm mengenali struk dan kode QR-nya. Pilih semua yang kamu pakai.',
  'banks.search': 'Cari bank dan dompet digital',
  'banks.clear': 'Hapus pencarian',
  'banks.suggested': 'Disarankan untukmu',
  'banks.yours': 'Milikmu dan saran',
  'banks.all': 'Semua bank dan dompet digital',
  'banks.none': 'Tidak ada bank atau dompet digital yang cocok dengan “{query}”.',
  'banks.yoursOnly': 'Milikmu',
  'banks.typeHint': 'Cari bank atau dompet digitalmu, atau ketik namanya untuk menambahkan.',
  'banks.byName': 'Tambah dengan nama',
  'banks.kind.bank': 'Bank',
  'banks.kind.wallet': 'Dompet digital',
};
