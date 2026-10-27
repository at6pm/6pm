import type { Entry } from '../catalogue-types';
import type { enNative } from '../en-native';

export const idNative: { readonly [Key in keyof typeof enNative]: Entry } = {
  'native.permission.camera':
    '6pm menggunakan kamera untuk membaca kode QR dan struk yang kamu pindai. Foto tetap di iPhone-mu kecuali ada struk yang perlu dibaca lebih teliti.',
  'native.permission.microphone':
    '6pm mendengarkan saat kamu mengucapkan pengeluaran. Suaramu dikirim ke layanan ucapan-ke-teks untuk ditulis, atau tetap di iPhone ini dalam mode di perangkat.',
  'native.permission.speech': '6pm mengubah ucapanmu menjadi jumlah dan nama.',
  'native.permission.photos':
    '6pm hanya menyimpan struk tutup hari dan diari uangmu ke Foto. 6pm tidak pernah melihat isi perpustakaanmu.',
  'native.permission.photosAdd':
    '6pm menyimpan struk tutup hari dan diari uangmu ke Foto saat kamu memintanya.',
  'native.permission.location':
    '6pm memeriksa kamu sedang di negara mana agar Mode perjalanan bisa menyala sendiri di luar negeri.',
  'native.surfaces.safeToday.name': 'Aman hari ini',
  'native.surfaces.safeToday.description': 'Yang bisa kamu pakai hari ini, sekali lirik.',
  'native.surfaces.setUp': 'Buka 6pm untuk mengatur',
  'native.surfaces.markPaid.title': 'Dibayar',
  'native.surfaces.todayList.name': 'Hari ini',
  'native.surfaces.todayList.description': 'Pengeluaranmu hari ini, yang terbaru di atas.',
  'native.share.title': 'Tambah ke 6pm',
  'native.share.readFromBank': 'Dibaca di iPhone ini dari struk {bank} kamu',
  'native.share.readHere': 'Dibaca di iPhone ini dari strukmu',
  'native.share.unreadable': 'Struk ini tidak terbaca. Ketik jumlahnya.',
  'native.share.to': 'Ke',
  'native.share.when': 'Kapan',
  'native.share.code': 'Kode',
  'native.share.category': 'Kategori',
  'native.share.unsure': 'Namanya belum pasti. Ketuk untuk memeriksa.',
  'native.share.checkName': 'Periksa nama',
  'native.share.amountHint': 'Jumlah',
  'native.share.nameHint': 'Dibayar ke siapa',
  'native.share.chooseCategory': 'Pilih',
  'native.share.edit': 'Ubah',
  'native.share.done': 'Selesai',
  'native.share.confirm': 'Konfirmasi',
  'native.share.currency': 'Mata uang',
  'native.share.currencyUnsure':
    'Struk ini tidak mencantumkan mata uangnya. Ketuk untuk memeriksa.',
  'native.share.checkCurrency': 'Periksa mata uang',
  'native.share.inDong': 'sekitar {amount}',
  'native.share.noRate':
    'Belum ada kurs. 6pm akan menghitungnya dengan kurs hari itu begitu tersedia.',
  'native.share.unknownCurrency': 'Mata uangnya tidak terbaca. Ketik jumlahnya dalam đồng.',
  'native.share.unknownCurrencyIn': 'Mata uangnya tidak terbaca. Ketik jumlahnya dalam {currency}.',
  'native.share.looking': 'Membaca lebih teliti…',
  'native.share.step': '{n} dari {total}',
  'native.share.skip': 'Lewati',
  'native.intents.logSpend.title': 'Catat di 6pm',
  'native.intents.logSpend.amount': 'Jumlah',
  'native.intents.logSpend.merchant': 'Di mana',
  'native.intents.logSpend.description':
    'Catat pengeluaran di 6pm: tap Apple Pay dari Dompet, atau yang kamu ucapkan ke Siri.',
  'native.intents.logSpend.short': 'Catat pengeluaran',
  'native.intents.logSpend.askAmount': 'Berapa jumlahnya?',
  'native.intents.logSpend.logged': 'Tercatat.',
  'native.intents.logSpend.failed': '6pm belum bisa mencatatnya. Buka 6pm dan coba Tambah cepat.',
  'native.intents.scan.title': 'Pindai QR',
  'native.intents.scan.description': 'Buka Pindai & bayar di 6pm.',
  'native.intents.quickAdd.title': 'Tambah cepat',
  'native.intents.quickAdd.description': 'Buka Tambah cepat di 6pm.',
  // Siri has no Indonesian, so the spoken phrases stay the English ones Siri listens for.
  'native.appShortcuts.logIn': 'Log in ${applicationName}',
  'native.appShortcuts.logSpend': 'Log a spend in ${applicationName}',
  'native.appShortcuts.scan': 'Scan QR in ${applicationName}',
  'native.appShortcuts.scanToPay': 'Scan to pay in ${applicationName}',
  'native.appShortcuts.quickAdd': 'Quick add in ${applicationName}',
};
