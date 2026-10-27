import type { Entry } from '../catalogue-types';
import type { enTogether } from '../en-together';

// “Anggaran bersama” is the feature's name; a shared pot is a “celengan bersama”. Apple's button is
// “Masuk dengan Apple”.
export const idTogether: { readonly [Key in keyof typeof enTogether]: Entry } = {
  'together.title': 'Anggaran bersama',
  'together.card.subOn': 'Ajak seseorang berbagi celengan.',
  'together.card.subPaired': { other: 'Bersama {name} · {count} celengan bersama' },
  'together.card.open': 'Buka Anggaran bersama',
  'together.you': 'Kamu',
  'together.partner': 'Partnermu',

  'together.intro.title': 'Menabung bareng.',
  'together.intro.sub':
    'Bagikan celengan dengan orang yang menabung bersamamu. Kalian berdua mengisinya, dan masing-masing bisa melihat siapa menyetor berapa. Hari-harimu sendiri tetap di ponselmu.',
  'together.intro.note':
    'Masuk dengan Apple hanya dipakai untuk Anggaran bersama. 6pm hanya meminta nama depanmu, tidak pernah emailmu.',
  'together.signIn.failed': 'Gagal masuk dengan Apple. Coba lagi.',
  'together.signIn.unavailable': 'Masuk dengan Apple tidak tersedia di iPhone ini.',

  'together.waiting.title': 'Baru kamu sendiri.',
  'together.waiting.sub':
    'Kirim tautannya ke orang yang menabung bersamamu. Begitu bergabung, dia bisa melihat celengan bersama kalian.',
  'together.paired.title': 'Kamu dan {name}',
  'together.paired.sub': { other: '{count} celengan bersama' },
  'together.invite': 'Ajak seseorang',
  'together.invite.again': 'Kirim tautan undangan baru',
  'together.invite.message': 'Yuk menabung bareng di 6pm: {url}',
  'together.invite.note': 'Tautan undangan hanya berlaku sekali, selama 7 hari.',
  'together.offline': 'Sedang offline. Ini yang terakhir kamu lihat.',

  'together.pots.title': 'Celengan bersama',
  'together.newPot': 'Celengan bersama baru',
  'together.newPotSub': 'Kalian berdua mengisinya.',
  'together.jar.add': 'Tambah {amount} ke {name}',
  'together.jar.split': 'Kamu {mine} · {partner} {theirs}',
  'together.jar.mine': 'Kamu menyetor {mine}',

  'together.pot.edit': 'Ubah celengan bersama',
  'together.pot.start': 'Mulai celengan bersama',
  'together.pot.save': 'Simpan',
  'together.pot.sumMonthly': 'Sekitar {amount} sebulan, kalian berdua',
  'together.pot.sumSub': 'Setoranmu dihitung seperti menambah celenganmu sendiri.',
  'together.pot.sumNone': 'Tanpa tanggal, tanpa buru-buru',
  'together.pot.sumNoneSub': 'Isi kapan saja kamu mau.',
  'together.pot.amount': 'Setor',
  'together.pot.addButton': 'Setor {amount}',
  'together.pot.entries': 'Siapa menyetor berapa',
  'together.pot.empty': 'Belum ada isinya.',
  'together.pot.entry': '{who} menyetor · {day}',
  'together.pot.takeBack': 'Tarik kembali',
  'together.pot.takeBackLabel': 'Tarik kembali {amount}',
  'together.pot.delete': 'Hapus celengan bersama',
  'together.pot.deleteConfirm': 'Ketuk lagi untuk menghapusnya bagi kalian berdua',
  'together.pot.deleted': '{name} dihapus',
  'together.pot.gone': 'Celengan ini sudah tidak ada. Mungkin partnermu menghapusnya.',

  'together.leave': 'Keluar dari Anggaran bersama',
  'together.leaveConfirm': 'Ketuk lagi untuk keluar',
  'together.leave.note':
    'Keluar akan mengakhirinya untuk kalian berdua dan menghapus celengan bersama dari server kami. Masing-masing tetap menyimpan setorannya, di ponsel sendiri.',
  'together.deleteAccount': 'Hapus akun Anggaran bersama',
  'together.deleteConfirm': 'Ketuk lagi untuk menghapus akunmu',
  'together.delete.note':
    'Menghapus info masukmu dan semua yang kamu bagikan, serta memberi tahu Apple bahwa 6pm tidak lagi memakai Apple ID-mu. Hari-harimu sendiri tetap di ponsel ini.',
  'together.kept.title': 'Tersimpan di iPhone ini',
  'together.kept.sub':
    'Setoranmu ke celengan bersama: {amount}. Tetap di sini meski celengannya sudah tidak ada.',

  'together.join.title': 'Gabung Anggaran bersama',
  'together.join.sub':
    'Seseorang mengajakmu berbagi celengan di 6pm. Masuk dengan Apple untuk bergabung. Hari-harimu sendiri tetap di ponselmu.',
  'together.join.button': 'Gabung',
  'together.join.expired': 'Undangan ini sudah kedaluwarsa. Minta tautan baru.',
  'together.join.used': 'Undangan ini sudah dipakai. Minta tautan baru.',
  'together.join.full': 'Sudah ada dua orang yang berbagi celengan di sana.',
  'together.join.own': 'Ini undanganmu sendiri. Kirim ke orang yang menabung bersamamu.',
  'together.join.paired':
    'Kamu sudah berbagi celengan. Keluar dari Anggaran bersama dulu, lalu buka tautannya lagi.',
  'together.join.missing': 'Tautan undangan ini tidak berfungsi. Minta yang baru.',

  'together.error.offline': 'Tidak bisa terhubung ke 6pm. Tidak ada yang berubah.',
  'together.error.failed': 'Belum berhasil. Tidak ada yang berubah.',
  'together.ended': 'Anggaran bersama sudah berakhir. Setoranmu tetap di ponsel ini.',
  'together.left': 'Kamu sudah keluar dari Anggaran bersama.',
  'together.deleted': 'Akun Anggaran bersama dihapus.',
  'together.joined': 'Kamu sudah masuk. Anggaran bersama dengan {name}.',
};
