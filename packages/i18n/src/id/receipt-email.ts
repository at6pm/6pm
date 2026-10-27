import type { Entry } from '../catalogue-types';
import type { enReceiptEmail } from '../en-receipt-email';

export const idReceiptEmail: { readonly [Key in keyof typeof enReceiptEmail]: Entry } = {
  'receiptEmail.copy': 'Salin alamat',
  'receiptEmail.share': 'Bagikan alamat 6pm-mu',
  'receiptEmail.offline': 'Alamatmu muncul begitu kamu online',
  'receiptEmail.from': 'Dari {address}',
  'receiptEmail.deviceMode': 'Mati selama AI tetap di iPhone ini',
  'receiptEmail.deviceMode.body':
    'Email struk butuh server kami untuk membaca emailmu, jadi fitur ini mati selama 6pm menjaga AI tetap di iPhone ini. Bagikan atau pindai struknya saja.',
  'receiptEmail.check.title': '{provider} minta konfirmasi penerusan dari {address}',
  'receiptEmail.check.titleNoAddress': '{provider} minta konfirmasi penerusan ke 6pm',
  'receiptEmail.check.code': 'Kode konfirmasi',
  'receiptEmail.check.copy': 'Salin',
  'receiptEmail.check.copyLabel': 'Salin kode konfirmasi',
  'receiptEmail.check.copied': 'Kode disalin.',
  'receiptEmail.check.hint':
    'Buka halaman konfirmasi, atau tempel kodenya di setelan {provider}. Setelah itu struk yang diteruskan masuk ke sini.',
  'receiptEmail.check.open': 'Buka halaman konfirmasi',
  'receiptEmail.check.openFailed': 'Halamannya tidak bisa dibuka. Salin kodenya saja.',
  'receiptEmail.check.hintNoCode':
    'Buka halaman konfirmasi dan ketuk Konfirmasi. Setelah itu struk yang diteruskan masuk ke sini.',
  'receiptEmail.check.openFailedNoCode': 'Halamannya tidak bisa dibuka. Coba lagi sebentar lagi.',
  'receiptEmail.check.done': 'Selesai',
};
