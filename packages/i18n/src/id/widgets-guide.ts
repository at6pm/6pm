import type { Entry } from '../catalogue-types';
import type { enWidgetsGuide } from '../en-widgets-guide';

// Steps name iOS controls as the Indonesian iPhone shows them (Tambah Widget, Sesuaikan, Tambah
// Kontrol, Tombol Tindakan). Siri has no Indonesian, so the spoken phrase stays English.
export const idWidgetsGuide: { readonly [Key in keyof typeof enWidgetsGuide]: Entry } = {
  'widgetsGuide.title': 'Widget & kontrol',
  'widgetsGuide.headline': '6pm, sekali lirik atau sekali tekan.',
  'widgetsGuide.lede':
    'Taruh angka aman hari ini di tempat yang biasa kamu lihat, dan buka Pindai QR atau Tambah cepat tanpa mencari aplikasinya.',
  'widgetsGuide.lookMax': 'Digambar dengan tampilanmu.',
  'widgetsGuide.lookFree': 'Gratis, dalam Jam Emas. Dengan Max, ikut tampilanmu.',
  'widgetsGuide.hide.title': 'Sembunyikan jumlah',
  'widgetsGuide.hide.what': 'Widget menampilkan ••• sampai Face ID membuka kunci ponselmu.',
  'widgetsGuide.hide.whatAndroid': 'Widget menampilkan ••• sebagai ganti setiap jumlah.',
  'widgetsGuide.howToAdd': 'Cara menambahkan',
  'widgetsGuide.whenItShows': 'Kapan muncul',

  'widgetsGuide.home.title': 'Widget Layar Utama',
  'widgetsGuide.home.what':
    'Kartu pos kecil harimu: langit asli jam ini, matahari di tempatnya, dan satu angka.',
  'widgetsGuide.home.small': 'Kecil',
  'widgetsGuide.home.medium': 'Sedang',
  'widgetsGuide.home.large': 'Besar',
  'widgetsGuide.home.smallWhat':
    'Angka hari ini di langitnya, satu stoples menghitung mundur, atau malam yang kamu tutup berturut-turut.',
  'widgetsGuide.home.mediumWhat':
    'Angka dengan langitnya dan stoplesmu. Ketuk stoples untuk membukanya.',
  'widgetsGuide.home.largeWhat':
    'Sebulan sebagai matahari: setiap malam yang kamu tutup, dan berapa dalam batas.',
  'widgetsGuide.home.step1':
    'Sentuh dan tahan area kosong di Layar Utama sampai aplikasinya bergoyang.',
  'widgetsGuide.home.step2': 'Ketuk Edit di pojok atas, lalu Tambah Widget.',
  'widgetsGuide.home.step3': 'Cari 6pm, geser ke ukuran yang kamu mau, lalu ketuk Tambah Widget.',

  'widgetsGuide.lock.title': 'Widget Layar Terkunci',
  'widgetsGuide.lock.what': 'Lihat sisa hari ini tanpa membuka kunci ponsel.',
  'widgetsGuide.lock.ring': 'Cincin',
  'widgetsGuide.lock.card': 'Kartu',
  'widgetsGuide.lock.step1': 'Sentuh dan tahan Layar Terkunci, lalu ketuk Sesuaikan.',
  'widgetsGuide.lock.step2': 'Pilih Layar Terkunci, lalu ketuk area di bawah jam.',
  'widgetsGuide.lock.step3': 'Ketuk 6pm, lalu pilih cincin, angka dalam satu baris, atau stoples.',

  'widgetsGuide.control.title': 'Pusat Kontrol',
  'widgetsGuide.control.what':
    'Geser ke bawah, ketuk sekali, dan kamu langsung di Pindai QR atau Tambah cepat.',
  'widgetsGuide.control.needs': 'iOS 18 atau lebih baru',
  'widgetsGuide.control.step1': 'Geser ke bawah dari pojok kanan atas layar.',
  'widgetsGuide.control.step2': 'Sentuh dan tahan area kosong, lalu ketuk Tambah Kontrol.',
  'widgetsGuide.control.step3': 'Cari 6pm dan pilih Pindai QR atau Tambah cepat.',
  'widgetsGuide.control.note':
    'Keduanya juga bisa menggantikan senter atau kamera di bagian bawah Layar Terkunci.',

  'widgetsGuide.action.title': 'Tombol Tindakan',
  'widgetsGuide.action.what': 'Tekan dan tahan tombol di samping untuk membuka Pindai QR.',
  'widgetsGuide.action.needs': 'iPhone 15 Pro dan yang lebih baru',
  'widgetsGuide.action.step1': 'Buka Pengaturan, lalu Tombol Tindakan.',
  'widgetsGuide.action.step2': 'Geser ke Kontrol, lalu ketuk nama kontrol di bawahnya.',
  'widgetsGuide.action.step3': 'Cari 6pm dan pilih Pindai QR atau Tambah cepat.',
  'widgetsGuide.action.note':
    'Lebih suka bicara? Bilang ke Siri “Log in 6pm”, lalu jumlahnya (Siri belum berbahasa Indonesia).',

  'widgetsGuide.live.title': 'Aktivitas Langsung',
  'widgetsGuide.live.what':
    'Jam enam, penutupan muncul di layar kuncimu, dan di sana juga menunggu pembayaran QR atau perjalananmu.',
  'widgetsGuide.live.step1':
    'Pindai QR lalu bayar di aplikasi bankmu. Pembayarannya menunggu di Layar Terkunci.',
  'widgetsGuide.live.step2': 'Ketuk Dibayar setelah uangnya terkirim. Tertutup sendiri.',
  'widgetsGuide.live.step3':
    'Tidak muncul? Di Pengaturan, buka 6pm lalu nyalakan Aktivitas Langsung.',

  'widgetsGuide.home.addSafe': 'Tambah Aman hari ini',
  'widgetsGuide.lock.jar': 'Stoples',
  'widgetsGuide.home.addStreak': 'Tambah Beruntun',
  'widgetsGuide.home.addJar': 'Tambah stoples',
  'widgetsGuide.home.addToday': 'Tambah Bulanku',
  'widgetsGuide.tiles.title': 'Kartu Setelan Cepat',
  'widgetsGuide.tiles.what':
    'Geser ke bawah, ketuk sekali, dan kamu langsung di Pindai QR atau Tambah cepat.',
  'widgetsGuide.tiles.step1': 'Geser ke bawah dua kali dari atas layar.',
  'widgetsGuide.tiles.step2': 'Ketuk ikon pensil untuk mengedit kartu.',
  'widgetsGuide.tiles.step3': 'Cari Pindai QR dan Tambah cepat dari 6pm, lalu seret ke atas.',
  'widgetsGuide.tiles.addScan': 'Tambah kartu Pindai QR',
  'widgetsGuide.tiles.addQuickAdd': 'Tambah kartu Tambah cepat',
  'widgetsGuide.tiles.scanIn': 'Pindai QR sudah ada di Setelan Cepat',
  'widgetsGuide.tiles.quickAddIn': 'Tambah cepat sudah ada di Setelan Cepat',
};
