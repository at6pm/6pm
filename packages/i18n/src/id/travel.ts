import type { Entry } from '../catalogue-types';
import type { enTravel } from '../en-travel';

// Travel mode is "Mode perjalanan"; the home currency shows "di bawahnya" (underneath).
export const idTravel: { readonly [Key in keyof typeof enTravel]: Entry } = {
  'travel.settings.label': 'Mode perjalanan',
  'travel.settings.sub': 'Menyala sendiri di luar negeri',
  'travel.settings.locationOff': 'Izinkan lokasi agar tahu kamu sedang di luar negeri',
  'travel.settings.stale': 'Kurs dari {date}',
  'travel.settings.noRates': 'Menunggu kurs hari ini',
  'travel.pill': '{place} · {symbol} dengan {home} di bawahnya',
  'travel.activity.place': '{place} · hari ini',
  'travel.activity.left': 'sisa {amount}',
  'travel.activity.over': 'lewat {amount}',
  'travel.activity.of': 'dari {line} · ≈ {vnd}',
  'travel.activity.leftOf': 'sisa dari {line} · ≈ {home}',
  'travel.activity.overOf': 'lewat dari {line} · ≈ {home}',
  'travel.activity.leftHome': 'sisa · ≈ {home}',
  'travel.activity.overHome': 'lewat · ≈ {home}',
  'travel.activity.log': 'Catat {symbol}',
  'travel.quick.underneath': 'sekitar {amount}',
  'travel.quick.underneathStale': 'sekitar {amount} · kurs dari {date}',
  'travel.quick.currency': 'Ganti mata uang',
  'travel.scan.body':
    'Bayar di aplikasi bankmu: sebagian besar bank Vietnam menerimanya. 6pm mencatatnya dalam {symbol} dengan ₫ di bawahnya.',
  'travel.scan.bodyAway':
    'Bayar dengan cara yang biasa dipakai di sana. 6pm mencatatnya dalam {symbol} dengan {home} di bawahnya.',
  'travel.scan.keep': 'Dibayar · simpan {amount}',
  'travel.scan.logIn': 'Catat dalam {symbol}',
};
