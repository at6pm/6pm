import type { Entry } from '../catalogue-types';
import type { enAskLedger } from '../en-ask-ledger';

// `{range}` and `{against}` are the lowercase spans below, so each answer reads as one sentence.
export const idAskLedger: { readonly [Key in keyof typeof enAskLedger]: Entry } = {
  'ask.range.today': 'hari ini',
  'ask.range.yesterday': 'kemarin',
  'ask.range.thisWeek': 'minggu ini',
  'ask.range.lastWeek': 'minggu lalu',
  'ask.range.thisCycle': 'sejak gajian',
  'ask.range.lastCycle': 'siklus gaji lalu',
  'ask.range.thisMonth': 'bulan ini',
  'ask.range.lastMonth': 'bulan lalu',
  'ask.range.last7Days': 'dalam seminggu terakhir',
  'ask.range.last30Days': 'dalam sebulan terakhir',
  'ask.range.dates': 'dari {from} sampai {to}',

  'ask.answer.spent': { other: 'Kamu menghabiskan {total} {range}, dari {count} pengeluaran.' },
  'ask.answer.spentOn': {
    other: 'Kamu menghabiskan {total} untuk {category} {range}, {count} kali.',
  },
  'ask.answer.spentAt': {
    other: 'Kamu menghabiskan {total} di {merchant} {range}, {count} kunjungan.',
  },
  'ask.answer.spentNone': 'Tidak ada pengeluaran {range}.',
  'ask.answer.spentNoneOn': 'Tidak ada pengeluaran untuk {category} {range}.',
  'ask.answer.spentNoneAt': 'Tidak ada pengeluaran di {merchant} {range}.',
  'ask.answer.breakdown': 'Dari {total} {range}, paling banyak untuk {top}.',
  'ask.answer.compared.up': 'Jadinya {now} {range}, naik dari {before} {against}.',
  'ask.answer.compared.down': 'Jadinya {now} {range}, turun dari {before} {against}.',
  'ask.answer.compared.same': 'Kurang lebih sama: {now} {range}, {before} {against}.',
  'ask.answer.listed': { other: '{count} pengeluaran {range}, total {total}.' },
  'ask.answer.listedMore': 'Dan {more} lagi.',
  'ask.answer.listedNone': 'Tidak ada pengeluaran seperti itu {range}.',
  'ask.answer.bills': { other: 'Tersisa {count} tagihan sebelum gajian, total {total}.' },
  'ask.answer.billsNone': 'Tidak ada tagihan tersisa sebelum gajian.',
  'ask.answer.how': 'Ini yang menonjol saat ini.',
  'ask.answer.howNothing': 'Semuanya tenang. Belum ada yang menonjol.',
  'ask.answer.noSuchCategory':
    'Aku nggak menemukan kategori {category}. Tanya soal salah satu kategorimu, ya.',
  'ask.answer.noRange': 'Belum ada yang bisa dilihat untuk itu.',
  'ask.answer.chat': 'Kapan saja. Tanya aku soal uangmu kapan pun kamu mau.',
  'ask.answer.partial': 'Ini menghitung yang disimpan 6pm sejak {since}.',
  'ask.row.total': 'Jumlah',
  'ask.row.before': 'Sebelumnya',
  'ask.answer.goalPace.months': {
    other:
      'Dengan {monthly} sebulan untuk kamu di masa depan, {amount} untuk {what} butuh sekitar {count} bulan, kira-kira {month}.',
  },
  'ask.answer.goalPace.years': {
    other:
      'Dengan {monthly} sebulan untuk kamu di masa depan, {amount} untuk {what} butuh sekitar {count} tahun, kira-kira {month}.',
  },
  'ask.answer.goalPace.note': 'Celengan khusus untuk itu menjaga uangnya terpisah dari yang lain.',
  'ask.answer.goalNoPace':
    'Belum ada yang masuk ke kamu di masa depan tiap bulan, jadi belum ada laju untuk menghitung {amount} untuk {what}. Sedikit tiap bulan sudah jadi awal.',
  'ask.answer.goalAmount':
    'Kira-kira berapa harga {what}? Sebutkan harganya, misalnya “{example}”, nanti aku hitungkan.',
  'ask.row.reachedBy': 'Sekitar',
};
