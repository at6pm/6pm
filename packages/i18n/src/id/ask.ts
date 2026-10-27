import type { Entry } from '../catalogue-types';
import type { enAsk } from '../en-ask';

// Ask speaks as the companion (“aku”, “kamu”) but keeps answers plain: the number first, then why.
export const idAsk: { readonly [Key in keyof typeof enAsk]: Entry } = {
  'ask.title': 'Tanya 6pm',
  'ask.sub': 'Muat nggak, gimana kalau, kapan cukup',
  'ask.back': 'Kembali',
  'ask.intro':
    'Tanya apa yang muat, bagaimana belanja besar mengubah hari-harimu, atau kapan celengan penuh. Aku tunjukkan hitungannya.',
  'ask.try': 'Coba',
  'ask.placeholder': 'Tanya, atau ucapkan saja…',
  'ask.send': 'Kirim',
  'ask.speak': 'Tanya dengan suara',
  'ask.listening': 'Mendengarkan…',
  'ask.suggest.afford': 'Bisa makan malam {amount} hari Sabtu?',
  'ask.suggest.weekend': 'Berapa untuk akhir pekan ini?',
  'ask.suggest.spend': 'Gimana kalau beli jaket {amount}?',
  'ask.suggest.pot': 'Kapan {pot} cukup?',
  'ask.suggest.save': 'Perlu menabung lebih banyak?',
  'ask.meter': 'Sisa {left} dari {total} pertanyaan gratis hari ini',
  'ask.unlimitedWith': 'Tanpa batas dengan',
  'ask.locked.title': 'Jatah {total} pertanyaan hari ini habis',
  'ask.locked.sub': 'Tambah lagi besok, atau tanpa batas dengan Max',
  'ask.locked.cta': 'Ambil Max',
  'ask.bar.now': 'Sekarang',
  'ask.bar.after': 'Sesudah',
  'ask.bar.perDay': '{amount} sehari',
  'ask.bar.nothing': 'tidak tersisa',
  'ask.row.free': 'Bebas sampai gajian',
  'ask.row.this': 'Yang ini',
  'ask.row.leftPerDay': 'Sisa per hari',
  'ask.row.safeToday': 'Aman hari ini',
  'ask.row.tomorrow': 'Besok',
  'ask.row.futureYou': 'Kamu di masa depan tiap bulan',
  'ask.row.moving': 'Ditabung lagi',
  'ask.row.inPot': 'Di celengan',
  'ask.row.goal': 'Target',
  'ask.row.perMonth': 'Tiap bulan',
  'ask.answer.fitsToday': 'Bisa, gampang. Masih muat di {safe} hari ini, jadi besok tidak berubah.',
  'ask.answer.fits': 'Bisa. Hari-hari sesudahnya berubah dari {from} jadi {to} sampai gajian.',
  'ask.answer.tight': 'Bisa, tapi mepet: hari-hari sesudahnya turun dari {from} jadi {to}.',
  'ask.answer.tight.pots': 'Ambil {take} dari celenganmu, dan tiap hari tetap {withPots}.',
  'ask.answer.notThisMonth':
    'Bulan ini belum bisa. Itu lebih dari seluruh uang bebasmu. Muat setelah gajian pada {payday}.',
  'ask.answer.notThisMonth.pots': 'Atau ambil sebagian dari celengan.',
  'ask.answer.weekend.two':
    'Sekitar {total} untuk {first} dan {second}, kalau hari-hari sebelumnya sesuai rencana.',
  'ask.answer.weekend.one':
    'Sekitar {total} untuk {first}, kalau hari-hari sebelumnya sesuai rencana.',
  'ask.answer.weekend.none':
    'Gajian pada {payday} datang sebelum akhir pekan, jadi angka baru mulai saat itu.',
  'ask.answer.saveMore':
    'Menyisihkan {amount} lagi untuk kamu di masa depan akan memakan sekitar {perDay} sehari sampai gajian.',
  'ask.answer.saveMore.none':
    'Menyisihkan {amount} lagi untuk kamu di masa depan hampir tidak mengubah hari-harimu.',
  'ask.answer.saveMore.note': 'Kamu bisa melakukannya dari Rencana.',
  'ask.answer.potFull': 'Dengan {monthly} sebulan, celengan {pot} penuh pada {month}.',
  'ask.answer.potFull.done': 'Celengan {pot} sudah penuh.',
  'ask.answer.potFull.idle':
    'Saat ini tidak ada yang masuk ke celengan {pot} tiap bulan, jadi tidak akan penuh sendiri.',
  'ask.answer.noSuchPot':
    'Aku nggak menemukan celengan {pot}. Tanya soal salah satu celenganmu, atau buat di Rencana.',
  'ask.answer.noPots': 'Belum ada celengan. Buat satu di Rencana, nanti aku kabari kapan penuhnya.',
  'ask.answer.today': 'Kamu bisa memakai {safe} hari ini. Angka besok {tomorrow}.',
  'ask.answer.today.used': 'Angka hari ini sudah habis. Besok {tomorrow}.',
  'ask.answer.help':
    'Aku bisa bilang apa yang muat, bagaimana belanja besar mengubah hari-harimu, atau kapan celengan penuh. Coba “Bisa pakai {amount} hari Sabtu?”',
  'ask.error': 'Ada yang salah, jadi aku belum bisa menjawab. Coba lagi.',
  'ask.answer.offline':
    'Aku tidak bisa terhubung ke server, jadi sekarang hanya bisa membaca pertanyaan sederhana.',
};
