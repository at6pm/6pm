import type { enExport } from '../en-export';

// CSV headers are plain nouns, as a spreadsheet would label them.
export const idExport: { readonly [Key in keyof typeof enExport]: string } = {
  'export.title': 'Ekspor',
  'export.row.value': 'CSV · Sheets',
  'export.empty': 'Belum ada yang bisa diekspor. Tambahkan pengeluaran dulu.',
  'export.failed': 'File belum bisa dibuat. Coba lagi.',

  'export.csv.date': 'Tanggal',
  'export.csv.time': 'Waktu',
  'export.csv.merchant': 'Tempat',
  'export.csv.category': 'Kategori',
  'export.csv.amount': 'Jumlah ({code})',
  'export.csv.status': 'Status',
  'export.csv.source': 'Sumber',
  'export.csv.wallet': 'Dompet',
  'export.csv.note': 'Catatan',
  'export.csv.detail': 'Rincian',
  'export.csv.forWork': 'Untuk kantor',
  'export.csv.foreignAmount': 'Jumlah valuta asing',
  'export.csv.currency': 'Mata uang',
  'export.csv.yes': 'Ya',
  'export.csv.no': 'Tidak',
};
