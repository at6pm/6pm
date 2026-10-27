import type { Entry } from '../catalogue-types';
import type { enAskActions } from '../en-ask-actions';

// Spoken examples stay in Vietnamese, as the English keeps them (“trà sữa 45k”).
export const idAskActions: { readonly [Key in keyof typeof enAskActions]: Entry } = {
  'ask.action.add': 'Tambah',
  'ask.action.notNow': 'Nanti saja',
  'ask.action.confirmSpend': 'Tambahkan {name}, {amount}, ke {category}?',
  'ask.action.added': 'Ditambahkan. {name}, {amount}, dihitung hari ini.',
  'ask.action.cancelled': 'Oke, tidak ada yang berubah.',
  'ask.action.failed': 'Belum tersimpan. Coba lewat Tambah cepat saja.',
  'ask.action.confirmPot': 'Celengan untuk {name}: {goal}. Buat sekarang?',
  'ask.action.confirmPotBy': 'Celengan untuk {name}: {goal} sebelum {month}. Buat sekarang?',
  'ask.action.setUp': 'Buat',
  'ask.action.potLocked':
    'Versi gratis punya satu celengan sendiri, dan punyamu sudah terpakai. Max memberi ruang untuk lebih banyak.',
  'ask.action.seeMax': 'Lihat Max',
  'ask.action.potGoal': 'Berapa yang dibutuhkan untuk {name}? Sebutkan, misalnya “10tr”.',
  'ask.action.showMe': 'Tunjukkan caranya',
  'ask.action.openQuickAdd': 'Buka Tambah cepat',
  'ask.howTo.ways':
    'Enam jalan masuk: Tambah cepat (diketik atau diucapkan), membagikan struk bank ke 6pm, meneruskan email struk, memindai VietQR untuk bayar, ketukan Apple Pay yang masuk sendiri, serta widget dan kontrol. Yang ditangkap 6pm menunggu di Kotak masuk sampai tutup hari.',
  'ask.howTo.quickAdd':
    'Tambah cepat menerima pengeluaran yang diketik atau diucapkan, misalnya “trà sữa 45k”. Atau bilang saja ke aku di sini: “vừa ăn phở 50k”.',
  'ask.howTo.dailyNumber':
    'Angka harianmu adalah uang bebas di siklus gaji ini, setelah tagihan, kamu di masa depan, dan celengan, dibagi rata ke hari-hari tersisa sampai gajian. Belanja di bawahnya, angka besok naik; lewat, angka besok sedikit turun.',
  'ask.howTo.negative':
    'Angkanya jadi minus kalau pengeluaran siklus ini melebihi uang bebasnya. Tidak ada yang rusak: rencananya menyebarkan selisih itu ke hari-hari tersisa. Kurangi belanja beberapa hari, atau ambil sedikit dari celengan di Rencana.',
  'ask.howTo.pot':
    'Celengan adalah uang yang disisihkan untuk satu hal, seperti liburan atau Tết. 6pm mengisinya sedikit tiap bulan dan memisahkannya dari angka harianmu, jadi uangnya ada saat dibutuhkan.',
  'ask.howTo.close':
    'Jam 6 sore kamu tutup hari: simpan atau lewati yang tertangkap, lalu lihat posisimu. Terlewat pun tidak ada yang hilang; pengeluaran yang tertangkap menunggu, dan tetap dihitung, sampai kamu memutuskan.',
  'ask.howTo.budget':
    '6pm tidak punya anggaran per kategori. Angka harianmu adalah anggarannya: tagihan, kamu di masa depan, dan celengan sudah disisihkan. Untuk mengurangi belanja sesuatu, mulai celengan atau beri kamu di masa depan lebih banyak di Rencana.',
};
