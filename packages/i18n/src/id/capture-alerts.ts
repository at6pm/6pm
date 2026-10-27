import type { Entry } from '../catalogue-types';
import type { enCaptureAlerts } from '../en-capture-alerts';

export const idCaptureAlerts: { readonly [Key in keyof typeof enCaptureAlerts]: Entry } = {
  'native.intents.catchAlert.title': 'Tangkap notifikasi bank',
  'native.intents.catchAlert.description':
    'Membaca notifikasi bank atau e-wallet di iPhone-mu dan menaruh uang yang masuk atau keluar di Kotak masuk 6pm. Kode OTP, pembayaran gagal, dan promo dilewati.',
  'native.intents.catchAlert.alertTitle': 'Judul',
  'native.intents.catchAlert.subtitle': 'Subjudul',
  'native.intents.catchAlert.body': 'Isi',
  'native.intents.catchAlert.date': 'Tanggal',
  'native.intents.catchAlert.app': 'App',
  'capture.alerts.name': 'Notifikasi bank',
  'capture.alerts.sub': 'Notifikasi bank dan e-wallet tercatat sendiri',
  'capture.alerts.headline': 'Notifikasi bank dan e-wallet-mu tercatat sendiri.',
  'capture.alerts.time': 'Sekitar semenit, sekali saja',
  'capture.alerts.step1': 'Di Pintasan, buat otomatisasi untuk notifikasi',
  'capture.alerts.step1Chip': 'Otomatisasi → Notifikasi',
  'capture.alerts.step2': 'Pilih app bank dan e-wallet-mu',
  'capture.alerts.step3': 'Buat agar menjalankan “Tangkap notifikasi bank”',
  'capture.alerts.step3Chip': 'Tangkap notifikasi bank',
  'capture.alerts.tip':
    'Kode OTP, pembayaran gagal, dan promo dilewati. Pembayaran yang sudah tertangkap lewat Apple Pay atau email tidak dicatat dua kali.',
  'capture.alerts.privacy': 'Notifikasi dibaca di iPhone-mu dan tidak pernah keluar darinya.',
  'capture.alerts.cameIn': '{amount} masuk',
  'capture.alerts.skip.code': 'kode OTP, dilewati',
  'capture.alerts.skip.failed': 'pembayaran gagal, dilewati',
  'capture.alerts.skip.promo': 'promo, dilewati',
  'capture.alerts.skip.balance': 'info saldo, dilewati',
  'capture.alerts.skip.security': 'info keamanan, dilewati',
  'capture.alerts.skip.unread': 'bukan pembayaran, dilewati',
  'capture.alerts.actionAdd': 'Ambil pintasan 6pm',
  'capture.alerts.actionOpen': 'Buka Pintasan',
  'capture.walk.alerts.s1Title': 'Buka Otomatisasi dan ketuk +',
  'capture.walk.alerts.s1Body':
    'Di Pintasan, ketuk Pustaka, lalu Otomatisasi, lalu +. Kalau muncul “Jelaskan pintasan”, ketuk Edit.',
  'capture.walk.alerts.s2Title': 'Tambahkan pemicu Notifikasi',
  'capture.walk.alerts.s2Body':
    'Di panel bawah, ketuk Otomatisasi, lalu Notifikasi. Kartu “Saat saya menerima notifikasi dari App” akan muncul.',
  'capture.walk.alerts.s3Title': 'Pilih bank dan e-wallet-mu',
  'capture.walk.alerts.s3Body':
    'Ketuk App dan pilih bankmu. Ketuk + untuk menambahkan setiap app bank dan e-wallet lain yang kamu pakai untuk bayar.',
  'capture.walk.alerts.s4Title': 'Tambahkan “Tangkap notifikasi bank”',
  'capture.walk.alerts.s4Body':
    'Ketuk Cari, ketik “notifikasi bank”, lalu ketuk Tangkap notifikasi bank dari 6pm. Atur Judul, Subjudul, Isi, dan Tanggal ke milik Notifikasi itu sendiri.',
  'capture.walk.alerts.s5Title': 'Biarkan Beri Tahu mati, lalu kembali',
  'capture.walk.alerts.s5Body':
    'Ketuk › di pemicu: biarkan Otomatisasi menyala dan Beri Tahu mati, supaya notifikasi ditangkap diam-diam. Kembali berarti tersimpan.',
  'capture.walk.alerts.s6Title': 'Coba sekarang',
  'capture.walk.alerts.s6Body':
    'Bayar sedikit dari salah satu app itu. Begitu notifikasinya datang, pembayarannya sudah ada di Kotak masuk.',
  'capture.walk.alerts.l1Title': 'Tambahkan pintasan 6pm',
  'capture.walk.alerts.l1Body':
    'Ketuk “Ambil pintasan 6pm” di atas, lalu Tambah Pintasan. Namanya “Catch a bank alert”.',
  'capture.walk.alerts.l2Body':
    'Buka di Pintasan, ketuk App di atas dan pilih bankmu, lalu + untuk setiap bank dan e-wallet lain.',
  'capture.walk.alerts.mistake1':
    'Judul, Isi, atau Tanggal dibiarkan kosong. Ketuk masing-masing dan pilih milik Notifikasi, kalau tidak notifikasi tidak mencatat apa-apa.',
  'capture.walk.alerts.mistake2':
    'Beri Tahu menyala. Setiap notifikasi jadi memberi tahu kamu sekali lagi, bukannya ditangkap diam-diam.',
  'capture.walk.alerts.mistake3':
    'Cuma satu app yang dipilih. Centang setiap bank dan e-wallet yang kamu pakai, termasuk MoMo dan ZaloPay.',
  'capture.walk.ios.notification': 'Notifikasi',
  'capture.walk.ios.notificationEx': '“Saat saya menerima notifikasi dari Berita”',
  'capture.walk.ios.whenNotified': 'Saat saya menerima notifikasi dari',
  'capture.walk.ios.notificationTitle': 'Notifikasi › Judul',
  'capture.walk.ios.notificationBody': 'Notifikasi › Isi',
  'capture.walk.ios.notificationDate': 'Notifikasi › Tanggal',
  'capture.walk.ios.notificationSummary': 'Saat saya menerima notifikasi dari MB Bank atau MoMo',
  'capture.walk.ios.alertSearch': 'notifikasi bank',
  'capture.walk.ios.now': 'sekarang',
  'capture.walk.test.alertRow': 'Notifikasi bank · perlu dicek',
  'capture.siri.name': 'Bilang ke Siri',
  'capture.siri.sub': 'Bilang “Log in 6pm”, lalu apa yang dibeli',
  'capture.siri.headline': 'Catat pengeluaran lewat suara, tanpa membuka 6pm.',
  'capture.siri.time': 'Tidak perlu diatur',
  'capture.siri.step1': 'Bilang “Hey Siri, log in 6pm”',
  'capture.siri.step1Chip': 'Log in 6pm',
  'capture.siri.step2': 'Siri tanya berapa. Sebutkan apa dan berapa',
  'capture.siri.step2Chip': '“phở forty-five k”',
  'capture.siri.step3': 'Langsung masuk pengeluaran hari ini',
  'capture.siri.step3Chip': 'Hari ini',
  'capture.siri.tip':
    'Siri belum bisa bahasa Vietnam atau Indonesia, jadi bicara dalam bahasa Inggris saja. Untuk bahasa Vietnam, tahan Tambah cepat.',
  'capture.backTap.name': 'Ketuk Belakang',
  'capture.backTap.sub': 'Ketuk punggung iPhone dua kali untuk mencatat pengeluaran',
  'capture.backTap.headline': 'Dua ketukan di punggung, Tambah cepat langsung terbuka.',
  'capture.backTap.time': 'Tiga puluh detik, sekali saja',
  'capture.backTap.step1': 'Buka Pengaturan, lalu Aksesibilitas, Sentuh, Ketuk Belakang',
  'capture.backTap.step1Chip': 'Ketuk Belakang',
  'capture.backTap.step2': 'Pilih Ketuk Dua Kali, lalu Tambah cepat dari 6pm',
  'capture.backTap.step2Chip': 'Ketuk Dua Kali → Tambah cepat',
  'capture.backTap.step3': 'Ketuk punggung iPhone dua kali. Tambah cepat terbuka',
  'capture.backTap.step3Chip': 'Tambah cepat',
  'capture.backTap.tip':
    'Tidak ada Tambah cepat? Di Pintasan, ketuk +, tambahkan Tambah cepat dari 6pm, lalu simpan. Ketuk Tiga Kali juga bisa.',
  'capture.walk.ios.notificationSubtitle': 'Notifikasi › Subjudul',
  'capture.walk.ios.notify': 'Beri Tahu',
  'capture.walk.ios.cancel': 'Batal',
};
