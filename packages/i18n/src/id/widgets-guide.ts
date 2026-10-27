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
  'widgetsGuide.howToAdd': 'Cara menambahkan',
  'widgetsGuide.whenItShows': 'Kapan muncul',

  'widgetsGuide.home.title': 'Widget Layar Utama',
  'widgetsGuide.home.what': 'Angka aman hari ini, sekali lirik. Ketuk untuk membuka 6pm.',
  'widgetsGuide.home.small': 'Kecil',
  'widgetsGuide.home.medium': 'Sedang',
  'widgetsGuide.home.large': 'Besar',
  'widgetsGuide.home.smallWhat': 'Angka amanmu untuk hari ini.',
  'widgetsGuide.home.mediumWhat': 'Angkanya, dengan Pindai QR dan Tambah cepat di sebelahnya.',
  'widgetsGuide.home.largeWhat': 'Sisa hari ini, dan pengeluaran terbaru hari ini.',
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
  'widgetsGuide.lock.step3': 'Ketuk 6pm, lalu pilih cincin atau kartu.',

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
  'widgetsGuide.live.what': 'Muncul sendiri saat pembayaran QR menunggu, dan saat kamu bepergian.',
  'widgetsGuide.live.step1':
    'Pindai QR lalu bayar di aplikasi bankmu. Pembayarannya menunggu di Layar Terkunci.',
  'widgetsGuide.live.step2': 'Ketuk Dibayar setelah uangnya terkirim. Tertutup sendiri.',
  'widgetsGuide.live.step3':
    'Tidak muncul? Di Pengaturan, buka 6pm lalu nyalakan Aktivitas Langsung.',
};
