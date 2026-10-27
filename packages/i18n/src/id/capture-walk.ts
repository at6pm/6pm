import type { Entry } from '../catalogue-types';
import type { enCaptureWalk } from '../en-capture-walk';

// The labels inside the pictured screens are the Indonesian iOS and Gmail ones. The shortcut keeps
// its installed name, “Log to 6pm”.
export const idCaptureWalk: { readonly [Key in keyof typeof enCaptureWalk]: Entry } = {
  'capture.walk.stepOf': 'Langkah {step} dari {total}',
  'capture.walk.next': 'Lanjut',
  'capture.walk.back': 'Kembali',
  'capture.walk.again': 'Ulangi dari awal',
  'capture.walk.mistakes': 'Kesalahan umum',

  'capture.walk.wallet.s1Title': 'Tambahkan pintasan 6pm',
  'capture.walk.wallet.s1Body':
    'Ketuk “Tambahkan pintasan 6pm” di bawah, lalu Tambah Pintasan. Namanya “Log to 6pm”.',
  'capture.walk.wallet.s2Title': 'Buka Otomatisasi dan ketuk +',
  'capture.walk.wallet.s2Body':
    'Di Pintasan, ketuk Pustaka, lalu Otomatisasi, lalu +. Kalau muncul “Jelaskan pintasan”, ketuk Edit.',
  'capture.walk.wallet.s3Title': 'Tambahkan pemicu Dompet',
  'capture.walk.wallet.s3Body':
    'Di panel bawah, ketuk Otomatisasi, lalu Dompet. Kartu “Saat Kartu Apa Pun diketuk” akan muncul.',
  'capture.walk.wallet.s4Title': 'Jalankan “Log to 6pm”',
  'capture.walk.wallet.s4Body':
    'Ketuk Cari, ketik “Jalankan Pintasan”, lalu ketuk hasilnya. Lalu ketuk Pintasan dan pilih “Log to 6pm”.',
  'capture.walk.wallet.s5Title': 'Matikan Tampilkan Saat Dijalankan, lalu kembali',
  'capture.walk.wallet.s5Body':
    'Biarkan Otomatisasi menyala. Kembali berarti tersimpan. Untuk menangkap kartu tertentu saja, ketuk Kartu Apa Pun dan pilih.',
  'capture.walk.wallet.s6Title': 'Coba sekarang',
  'capture.walk.wallet.s6Body':
    'Bayar sesuatu dengan Apple Pay di iPhone ini, lalu buka 6pm. Ketukannya ada di Kotak masuk.',
  'capture.walk.wallet.mistake1':
    'Pintasan tanpa kartu “Saat Kartu Apa Pun diketuk” di atasnya. Ia hanya berjalan kalau kamu menjalankannya sendiri.',
  'capture.walk.wallet.mistake2':
    'Jalankan Pintasan dibiarkan tanpa pintasan. Ketuk Pintasan dan pilih “Log to 6pm”, kalau tidak ketukan tidak tercatat.',
  'capture.walk.wallet.mistake3':
    'Tampilkan Saat Dijalankan masih menyala. Setiap ketukan berhenti untuk menampilkan kartu, bukan mencatat diam-diam.',
  'capture.walk.wallet.olderTitle': 'Di iOS 26',
  'capture.walk.wallet.older1': 'Di Pintasan, buka tab Otomatisasi dan ketuk +.',
  'capture.walk.wallet.older2':
    'Ketuk Dompet, pilih kartumu, pilih Jalankan Segera, lalu Berikutnya.',
  'capture.walk.wallet.older3': 'Pilih “Log to 6pm” dari pintasanmu, lalu Selesai.',
  'capture.walk.wallet.handTitle': 'Mau merakit sendiri?',
  'capture.walk.wallet.hand1':
    'Alih-alih Jalankan Pintasan, tambahkan “Log in 6pm” dan matikan Tampilkan Saat Dijalankan.',
  'capture.walk.wallet.hand2':
    'Atur Jumlah ke Transaksi › Jumlah, dan Tempat ke Transaksi › Pedagang.',

  'capture.walk.email.s1Title': 'Di komputer, buka setelan Gmail',
  'capture.walk.email.s1Body':
    'Penerusan tidak bisa diatur di app Gmail. Di Gmail versi web, klik ikon roda gigi, lalu Lihat semua setelan.',
  'capture.walk.email.s2Title': 'Penerusan dan POP/IMAP',
  'capture.walk.email.s2Body': 'Buka tab itu dan klik Tambahkan alamat penerusan.',
  'capture.walk.email.s3Title': 'Tempel alamat 6pm-mu',
  'capture.walk.email.s3Body':
    'Salin dengan tombol di bawah, tempel, lalu Berikutnya dan Lanjutkan.',
  'capture.walk.email.s4Title': 'Masukkan kode dari 6pm',
  'capture.walk.email.s4Body':
    'Gmail mengirim konfirmasi ke alamat 6pm-mu dan 6pm menampilkan kodenya. Ketik di samping Verifikasi.',
  'capture.walk.email.s5Title': 'Buat filter untuk struk',
  'capture.walk.email.s5Body':
    'Jangan teruskan semuanya. Buka opsi penelusuran dan isi pengirim struk di kolom Dari.',
  'capture.walk.email.s6Title': 'Teruskan ke 6pm',
  'capture.walk.email.s6Body':
    'Klik Buat filter, centang Teruskan ke, pilih alamat 6pm-mu, lalu Buat filter sekali lagi.',
  'capture.walk.email.otherTitle': 'Layanan email lain',
  'capture.walk.email.outlook': 'Outlook.com',
  'capture.walk.email.outlook1': 'Di web, buka Pengaturan, lalu Email, lalu Aturan.',
  'capture.walk.email.outlook2':
    'Tambahkan aturan baru: kalau dari pengirim struk, teruskan ke alamat 6pm-mu.',
  'capture.walk.email.outlook3': 'Simpan. Outlook mungkin minta kamu masuk lagi dulu.',
  'capture.walk.email.icloud': 'iCloud Mail',
  'capture.walk.email.icloud1': 'Di icloud.com/mail, buka Pengaturan, lalu Aturan, lalu +.',
  'capture.walk.email.icloud2':
    'Jika pesan berasal dari pengirim struk, teruskan ke alamat 6pm-mu.',
  'capture.walk.email.icloud3': 'Satu aturan per pengirim. Bisa butuh 15 menit sampai berjalan.',

  'capture.walk.share.s1Title': 'Buka struk di app bankmu',
  'capture.walk.share.s1Body': 'Layar setelah transfer, atau satu dari riwayat. Ketuk Bagikan.',
  'capture.walk.share.s2Title': 'Ketuk 6pm',
  'capture.walk.share.s2Body':
    'Geser deretan app kalau belum kelihatan. Kamu juga bisa membagikan satu atau beberapa foto struk.',
  'capture.walk.share.s3Title': 'Cek dan konfirmasi',
  'capture.walk.share.s3Body':
    'Aku membaca jumlah dan penerimanya. Konfirmasi, dan langsung masuk Kotak masuk.',
  'capture.walk.share.inInbox': 'Di Kotak masuk',

  'capture.walk.bank.done': 'Transfer berhasil',
  'capture.walk.bank.from': 'Dari',
  'capture.walk.bank.yourBank': 'Bankmu',
  'capture.walk.bank.share': 'Bagikan',
  'capture.walk.bank.home': 'Beranda',

  'capture.walk.test.paid': 'Selesai',
  'capture.walk.test.inbox': 'Kotak masuk',
  'capture.walk.test.row': 'Apple Pay · perlu dicek',

  'capture.walk.ios.library': 'Pustaka',
  'capture.walk.ios.allShortcuts': 'Semua Pintasan',
  'capture.walk.ios.shareSheet': 'Lembar Berbagi',
  'capture.walk.ios.gallery': 'Galeri',
  'capture.walk.ios.automation': 'Otomatisasi',
  'capture.walk.ios.apps': 'App',
  'capture.walk.ios.edit': 'Edit',
  'capture.walk.ios.noAutomations': 'Tidak Ada Otomatisasi',
  'capture.walk.ios.noAutomationsSub': 'Buat pintasan berjalan secara otomatis.',
  'capture.walk.ios.newShortcut': 'Pintasan Baru',
  'capture.walk.ios.describe': 'Jelaskan pintasan',
  'capture.walk.ios.addActions': 'Tambahkan tindakan dari bawah untuk membuat pintasan.',
  'capture.walk.ios.search': 'Cari',
  'capture.walk.ios.scripting': 'Skrip',
  'capture.walk.ios.sendMessage': 'Kirim Pesan',
  'capture.walk.ios.openApp': 'Buka App',
  'capture.walk.ios.playMusic': 'Putar Musik',
  'capture.walk.ios.app': 'App',
  'capture.walk.ios.appEx': '“Saat Cuaca dibuka atau ditutup”',
  'capture.walk.ios.wallet': 'Dompet',
  'capture.walk.ios.walletEx': '“Saat saya mengetuk Kartu atau Pass Dompet”',
  'capture.walk.ios.screenshot': 'Jepretan Layar',
  'capture.walk.ios.screenshotEx': '“Saat jepretan layar disimpan”',
  'capture.walk.ios.when': 'Saat',
  'capture.walk.ios.isTapped': 'diketuk',
  'capture.walk.ios.anyCard': 'Kartu Apa Pun',
  'capture.walk.ios.showWhenRun': 'Tampilkan Saat Dijalankan',
  'capture.walk.ios.addShortcut': 'Tambah Pintasan',
  'capture.walk.ios.dontAdd': 'Jangan Tambah',
  'capture.walk.ios.runShortcut': 'Jalankan Pintasan',
  'capture.walk.ios.run': 'Jalankan',
  'capture.walk.ios.shortcut': 'Pintasan',
  'capture.walk.ios.shortcutA': 'Perkiraan Tiba di Rumah',
  'capture.walk.ios.shortcutB': 'Timer Cucian',
  'capture.walk.ios.personal': 'Pribadi',
  'capture.walk.ios.walletSummary': 'Saat saya mengetuk pass atau kartu pembayaran Dompet',
  'capture.walk.ios.messages': 'Pesan',
  'capture.walk.ios.mail': 'Mail',
  'capture.walk.ios.image': 'Gambar',
  'capture.walk.ios.copy': 'Salin',
  'capture.walk.ios.saveImage': 'Simpan Gambar',

  'capture.walk.gmail.searchMail': 'Telusuri email',
  'capture.walk.gmail.quickSettings': 'Setelan cepat',
  'capture.walk.gmail.seeAll': 'Lihat semua setelan',
  'capture.walk.gmail.settings': 'Setelan',
  'capture.walk.gmail.general': 'Umum',
  'capture.walk.gmail.labels': 'Label',
  'capture.walk.gmail.filters': 'Filter dan Alamat yang Diblokir',
  'capture.walk.gmail.forwarding': 'Penerusan dan POP/IMAP',
  'capture.walk.gmail.forwardingHead': 'Penerusan:',
  'capture.walk.gmail.addAddress': 'Tambahkan alamat penerusan',
  'capture.walk.gmail.enterAddress': 'Masukkan alamat email penerusan baru:',
  'capture.walk.gmail.next': 'Berikutnya',
  'capture.walk.gmail.cancel': 'Batal',
  'capture.walk.gmail.proceed': 'Lanjutkan',
  'capture.walk.gmail.forwardTo': 'Teruskan salinan email masuk ke',
  'capture.walk.gmail.verify': 'Verifikasi',
  'capture.walk.gmail.code': 'kode konfirmasi',
  'capture.walk.gmail.disable': 'Nonaktifkan penerusan',
  'capture.walk.gmail.from': 'Dari',
  'capture.walk.gmail.subject': 'Subjek',
  'capture.walk.gmail.hasWords': 'Mengandung kata',
  'capture.walk.gmail.createFilter': 'Buat filter',
  'capture.walk.gmail.search': 'Telusuri',
  'capture.walk.gmail.whenArrives': 'Saat pesan sama persis dengan kriteria penelusuran:',
  'capture.walk.gmail.skipInbox': 'Lewati Kotak Masuk (Arsipkan)',
  'capture.walk.gmail.markRead': 'Tandai sebagai sudah dibaca',
  'capture.walk.gmail.forwardIt': 'Teruskan ke:',
  'capture.walk.gmail.inbox': 'Kotak Masuk',
};
