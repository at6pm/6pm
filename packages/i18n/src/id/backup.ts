import type { Entry } from '../catalogue-types';
import type { enBackup } from '../en-backup';

// iOS's own names: “Rantai Kunci iCloud” and “Pengaturan”. A backup is a “cadangan”.
export const idBackup: { readonly [Key in keyof typeof enBackup]: Entry } = {
  'backup.title': 'Cadangan',
  'backup.row.off': 'Mati',
  'backup.row.on': 'Di iCloud · {when}',
  'backup.row.found': 'Ada cadangan',
  'backup.row.deleting': 'Menghapus…',
  'backup.ago.now': 'baru saja',
  'backup.ago.minutes': { other: '{count} menit lalu' },
  'backup.ago.hours': { other: '{count} jam lalu' },
  'backup.ago.days': { other: '{count} hari lalu' },

  'backup.status.on': 'Dicadangkan {when}.',
  'backup.status.sub': {
    other: 'iCloud · {count} item · terenkripsi. 6pm tetap jalan tanpanya.',
  },
  'backup.status.never': 'Siap kapan pun kamu mau.',
  'backup.status.neverSub': 'iCloud · terenkripsi. 6pm tetap jalan tanpanya.',
  'backup.off.title': 'Simpan setiap hari, selamanya.',
  'backup.off.sub':
    'Disegel di iPhone ini sebelum dikirim. Kuncinya ada di Rantai Kunci iCloud-mu, jadi kami tidak bisa membaca apa pun.',
  'backup.tooLarge':
    'Cadangan terakhir terlalu besar untuk dikirim. Semuanya masih ada di iPhone ini.',
  'backup.note':
    'Mencadangkan sekali sehari, setelah kamu tutup hari. Untuk memulihkan di iPhone baru, nyalakan Rantai Kunci iCloud di Pengaturan iOS.',
  'backup.paused': 'Pencadangan dijeda tanpa Max. Cadangan terakhirmu tetap aman di iCloud.',
  'backup.empty': 'Belum ada yang bisa dicadangkan. Tutup hari pertamamu, lalu kembali lagi.',

  'backup.turnOn': 'Nyalakan cadangan',
  'backup.now': 'Cadangkan sekarang',
  'backup.working': 'Mencadangkan…',
  'backup.delete': 'Hapus cadangan',
  'backup.deleteConfirm': 'Ketuk lagi untuk menghapus cadanganmu',
  'backup.deleting': 'Menghapus…',
  'backup.deletePending':
    'Cadanganmu akan dihapus begitu 6pm online. Sementara itu tidak ada lagi yang dikirim.',

  'backup.found.title': 'Sudah ada cadangan di iCloud-mu.',
  'backup.found.sub':
    'Asalnya dari iPhone lain atau instalasi sebelumnya. Mencadangkan dari sini akan menggantinya.',
  'backup.found.restore': 'Pulihkan di sini',
  'backup.found.restoreConfirm': 'Ketuk lagi untuk mengganti hari-hari di iPhone ini',
  'backup.found.replace': 'Ganti dengan iPhone ini',

  'backup.restore.link': 'Pulihkan dari cadangan',
  'backup.restore.title': 'Pulihkan dari cadangan',
  'backup.restore.found': 'Cadanganmu dari {date} ditemukan.',
  'backup.restore.sub': { other: '{count} item · terenkripsi di iCloud.' },
  'backup.restore.do': 'Pulihkan hari-hariku',
  'backup.restore.working': 'Memulihkan…',
  'backup.restore.fresh': 'Mulai dari awal saja',
  'backup.restore.freshNote':
    'Mulai dari awal tetap menyimpan cadanganmu sampai cadangan baru pertamamu menggantikannya.',
  'backup.restore.looking': 'Mencari cadanganmu…',
  'backup.restore.none': 'Tidak ada cadangan untuk Rantai Kunci iCloud ini.',
  'backup.restore.unsupported':
    'Cadangan ini dibuat oleh 6pm versi lebih baru. Perbarui app untuk memulihkannya.',
  'backup.restore.wrongKey': 'Kunci di iPhone ini tidak bisa membuka cadangan ini.',
  'backup.restore.damaged': 'Cadangan ini rusak dan tidak bisa dipulihkan.',

  'backup.error.network': 'Tidak bisa terhubung ke 6pm. Coba lagi sebentar lagi.',
  'backup.error.keychain':
    'Rantai Kunci iCloud tidak mau menyimpan kuncinya, jadi belum ada yang dicadangkan. Pastikan sudah menyala di Pengaturan iOS.',
  'backup.error.tooLarge':
    'Cadangan ini terlalu besar untuk dikirim. Semuanya masih ada di iPhone ini.',
  'backup.retry': 'Coba lagi',
  'backup.error.generic': 'Belum berhasil. Coba lagi.',

  'backup.toast.deleted': 'Cadangan dihapus.',
  'companion.backupDone.soft': 'Sudah dicadangkan. Hari-harimu aman.',
  'companion.backupDone.cheeky': 'Sudah dicadangkan. Selasa terburukmu pun sekarang aman.',
  'companion.backupDone.roast': 'Sudah dicadangkan. Semua khilafmu kini abadi di cloud.',
  'companion.backupDone.plain': 'Pencadangan selesai.',
  'companion.backupRestored.soft': 'Selamat datang kembali. Semuanya ada di sini.',
  'companion.backupRestored.cheeky': 'Pulang dari awan. Nggak ada yang hilang.',
  'companion.backupRestored.roast': 'Sudah dipulihkan. Jangan sampai ponselnya hilang lagi, ya.',
  'companion.backupRestored.plain': 'Cadangan dipulihkan.',
};
