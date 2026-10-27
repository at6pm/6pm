import type { Entry } from '../catalogue-types';
import type { enYearBook } from '../en-year-book';

// The year book is "buku tahunan"; it is bound ("dijilid") on 31 December.
export const idYearBook: { readonly [Key in keyof typeof enYearBook]: Entry } = {
  'yearBook.binds': 'Dijilid 31 Desember. Dua belas diari dalam satu buku.',
  'yearBook.bound': 'Dijilid 31 Desember. Ketuk untuk membagikannya sebagai PDF.',
  'yearBook.binding': 'Menjilid buku tahunanmu…',
  'yearBook.failed': 'Buku tahunan belum bisa dijilid. Coba lagi sebentar lagi.',
  'yearBook.shareTitle': 'Buku tahunan {year}',
  'yearBook.cover.kicker': '6PM · DIARI UANG',
  'yearBook.cover.sub': { other: '{count} diari uang, dijilid 31 Desember.' },
  'yearBook.cover.closed': { other: '{count} HARI DITUTUP JAM 6PM' },
  'yearBook.summary.kicker': 'BUKU TAHUNAN · {year}',
  'yearBook.summary.headline.spare': 'Kamu menutup {year} dengan sisa {amount}.',
  'yearBook.summary.headline.over': 'Tahun ini sedikit lewat rencana. {next} mulai dari awal.',
  'yearBook.summary.futureYouSub': 'disisihkan tahun ini',
  'yearBook.summary.contents': 'ISI DIARI',
};
