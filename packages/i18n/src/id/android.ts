import type { Entry } from '../catalogue-types';
import type { enAndroid } from '../en-android';

// Android's own wording: “ponsel ini” for the phone, Google Play for purchases, the gallery for
// pictures, and no Apple product to point at.
export const idAndroid: { readonly [Key in keyof typeof enAndroid]: Entry } = {
  'ask.howTo.ways':
    'Tiga jalan masuk: Tambah cepat (diketik atau diucapkan), memindai QR atau struk, dan meneruskan email struk. Yang ditangkap 6pm menunggu di Kotak masuk sampai tutup hari.',
  'capture.share.headline':
    'Simpan struknya sebagai gambar, lalu pilih di Pindai. Aku yang baca jumlahnya.',
  'capture.wallet.headline':
    'Apple Pay tidak ada di ponsel ini. Teruskan email struk dari kartumu, dan semuanya muncul sendiri.',
  'capture.widgets.headline':
    'Ponsel ini tidak punya widget 6pm. Tahan tombol pindai, dan Tambah cepat terbuka.',

  'backup.row.on': 'Terenkripsi · {when}',
  'backup.status.sub': {
    other: '{count} item · terenkripsi. 6pm tetap jalan tanpanya.',
  },
  'backup.status.neverSub': 'Terenkripsi. 6pm tetap jalan tanpanya.',
  'backup.off.sub':
    'Disegel di ponsel ini sebelum dikirim. Kuncinya tetap di ponsel ini, jadi kami tidak bisa membaca apa pun.',
  'backup.tooLarge':
    'Cadangan terakhir terlalu besar untuk dikirim. Semuanya masih ada di ponsel ini.',
  'backup.note':
    'Mencadangkan sekali sehari, setelah kamu tutup hari. Kuncinya tidak pernah meninggalkan ponsel ini, jadi cadangan hanya bisa dibuka di sini, bukan di ponsel baru.',
  'backup.paused': 'Pencadangan dijeda tanpa Max. Cadangan terakhirmu tetap aman dan terenkripsi.',
  'backup.found.title': 'Sudah ada cadangan untuk ponsel ini.',
  'backup.found.sub':
    'Asalnya dari instalasi sebelumnya. Mencadangkan dari sini akan menggantinya.',
  'backup.found.restoreConfirm': 'Ketuk lagi untuk mengganti hari-hari di ponsel ini',
  'backup.found.replace': 'Ganti dengan ponsel ini',
  'backup.restore.sub': { other: '{count} item · terenkripsi.' },
  'backup.restore.none': 'Tidak ada cadangan untuk ponsel ini.',
  'backup.restore.wrongKey': 'Kunci di ponsel ini tidak bisa membuka cadangan ini.',
  'backup.error.keychain':
    'Ponsel ini tidak mau menyimpan kuncinya, jadi belum ada yang dicadangkan. Coba lagi.',
  'backup.error.tooLarge':
    'Cadangan ini terlalu besar untuk dikirim. Semuanya masih ada di ponsel ini.',

  'capture.email.sub': 'Belum ada alamat penerusan di ponsel ini',
  'capture.scan.tip': 'Tahan tombol pindai untuk Tambah cepat saat tidak ada kode untuk dipindai.',
  'onboarding.catch.add.body':
    'Tahan tombol pindai untuk Tambah cepat, lalu ucapkan “kopi {amount}”.',
  'today.list.empty': 'Belum ada yang tertangkap. Pindai QR atau struk, atau ketuk + saat belanja.',

  'looks.restore.none': 'Tidak ada yang bisa dipulihkan di akun Google ini.',
  'looks.restore.failed': 'Tidak bisa terhubung ke Google Play. Coba lagi.',
  'looks.legal':
    'Tampilan adalah pembelian sekali bayar di akun Google-mu. Max adalah langganan yang bisa kamu batalkan kapan saja di Google Play. Harga ditampilkan oleh Google Play.',
  'look.buying': 'Menunggu Google Play…',
  'look.noteStoreOff': 'Google Play tidak merespons, jadi tampilan ini belum bisa dibeli.',
  'max.cta.waiting': 'Menunggu Google Play…',
  'max.terms.storeOff': 'Max belum bisa dibeli sekarang: Google Play tidak merespons.',
  'max.sub.backup': 'Cadangan terenkripsi, riwayat lengkap, CSV dan Sheets.',
  'max.note.backup': 'Cadangan terenkripsi, CSV dan Sheets',
  'max.welcome.win.more': 'Celengan, perjalanan, dan Buku tahunan',

  'privacy.ai.device.title': 'Hanya di ponsel ini',
  'privacy.ai.device.unavailable': 'Memori ponsel ini tidak cukup untuk model sendiri.',
  'settings.ai.device': 'Di ponsel ini',
  'privacy.leaves.device.none': 'Tidak ada AI. Semuanya dihitung di ponsel ini.',
  'receiptEmail.deviceMode': 'Mati selama AI tetap di ponsel ini',
  'receiptEmail.deviceMode.body':
    'Email struk butuh server kami untuk membaca emailmu, jadi fitur ini mati selama 6pm menjaga AI tetap di ponsel ini. Pindai struknya saja.',
  'settings.privacyBody':
    'Uangmu tetap di ponsel ini, terenkripsi. Untuk membaca pertanyaan Tanya 6pm dan menulis kalimat temanmu, 6pm mengirim ke Anthropic, sebuah layanan AI, pertanyaannya atau beberapa fakta tentang harimu: jumlah, tempat, dan nama kategori, tidak pernah daftar pengeluaranmu. Foto struk yang tidak bisa dibaca ponselmu juga dikirim ke sana. Anthropic tidak melatih model dengannya dan menghapusnya dalam 30 hari. Saat kamu mengucapkan pengeluaran, suaramu dikirim ke Deepgram untuk diubah jadi teks. Di bagian AI di atas, kamu bisa menjaga semua ini tetap di ponsel ini. Cadangan hanya keluar kalau kamu menyalakannya, dengan enkripsi end-to-end. Laporan crash dikirim ke Sentry tanpa jumlah, nama, atau catatan, dan RevenueCat menangani pembelian.',

  'scan.handoff.store': '{wallet} belum ada di ponsel ini',
  'scan.handoff.savedQr':
    'QR disimpan ke galeri: pindai dari fotomu di app bank. Nanti aku tanya waktu kamu kembali.',
  'sharing.saved': 'Tersimpan di galeri.',
  'sharing.photosOff': 'Akses foto untuk 6pm sedang mati.',

  'startup.failedSub':
    'Tidak ada yang hilang. Coba lagi, dan kalau terus terjadi, mulai ulang ponselmu.',
  'voice.unavailable': 'Suara butuh dikte {language} di ponsel ini',

  'onboarding.privacy.phone': 'Hanya di ponsel ini',
  'onboarding.privacy.backupSub': 'Dikunci dengan kunci yang tak pernah meninggalkan ponsel ini',

  'capture.alerts.time': 'Sepuluh detik, sekali',
  'capture.alerts.step1': 'Nyalakan 6pm di Akses notifikasi',
  'capture.alerts.step1Chip': 'Akses notifikasi → 6pm',
  'capture.alerts.step2': 'Biarkan notifikasi aplikasi bank dan dompetmu tetap menyala',
  'capture.alerts.step3': 'Tiap pembayaran menunggu di Kotak masuk sampai tutup hari',
  'capture.alerts.step3Chip': 'Kotak masuk',
  'capture.alerts.tip':
    'Kode, pembayaran gagal, dan promo dilewati. Pembayaran yang sudah tertangkap lewat email tidak ditambahkan dua kali.',
  'capture.alerts.privacy':
    'Dibaca di ponsel ini dan tidak dikirim ke mana pun. 6pm hanya membaca notifikasi bank dan dompetmu.',
  'capture.alerts.actionAdd': 'Izinkan akses notifikasi',
  'capture.alerts.actionOpen': 'Setelan akses notifikasi',
};
