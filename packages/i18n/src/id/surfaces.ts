import type { Entry } from '../catalogue-types';
import type { enSurfaces } from '../en-surfaces';

// Widgets and the Live Activity are tiny: the shortest natural word wins.
export const idSurfaces: { readonly [Key in keyof typeof enSurfaces]: Entry } = {
  'surfaces.scanQr': 'Pindai QR',
  'surfaces.safeTodayShort': 'aman hari ini',
  'surfaces.today': 'Hari ini',
  'surfaces.left': 'sisa',
  'surfaces.amountLeft': 'Sisa {amount}',
  'surfaces.spent': '{amount} terpakai',
  'surfaces.ofLine': 'dari {amount}',
  'surfaces.brandSafe': '6pm · Aman hari ini',
  'surfaces.pending': { other: '{count} tertunda' },
  'surfaces.more': { other: '+{count} lagi' },
  'surfaces.listEmpty': 'Belum ada pengeluaran hari ini',
  'surfaces.openApp': 'Buka 6pm',
  'surfaces.setUp': 'Buka 6pm untuk mengatur',
  'surfaces.activity.waiting': 'Menunggu · ketuk kalau sudah bayar',
  'surfaces.activity.to': '{amount} ke {merchant}',
  'surfaces.activity.toMerchant': 'ke {merchant}',
  'surfaces.activity.toMerchantBank': 'ke {merchant} · {bank} dibuka',
  'surfaces.activity.waitingBank': 'Menunggu · {bank}',
  'surfaces.activity.paid': 'Dibayar',
  'surfaces.context.today': 'Hari ini',
  'surfaces.context.yesterday': 'Kemarin',
  'surfaces.context.safeAfter': 'Aman hari ini sekarang {amount}',
};
