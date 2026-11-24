import type { Entry } from '../catalogue-types';
import type { enMaxCodes } from '../en-max-codes';

export const idMaxCodes: { readonly [Key in keyof typeof enMaxCodes]: Entry } = {
  'maxCodes.section': '6pm Max',
  'maxCodes.give': 'Beri teman Max',
  'maxCodes.give.sub': 'Kirim link penawaran Max',
  'maxCodes.give.message':
    '6pm memberi tahu berapa yang bisa kubelanjakan hari ini dan mencatat pengeluaranku sendiri. Ini penawaran 6pm Max untukmu: {url}',
  'maxCodes.give.failed': 'Tidak bisa membuka berbagi. Coba lagi.',
  'maxCodes.redeem': 'Tukarkan kode',
  'maxCodes.head.friend': 'Temanmu mengirimimu Max.',
  'maxCodes.head.code': 'Penawaran Max untukmu.',
  'maxCodes.playHint': 'Di Google Play, ketuk metode pembayaran, lalu Tukarkan kode.',
  'maxCodes.playHint.code':
    'Kode {code} disalin. Di Google Play, ketuk metode pembayaran, lalu Tukarkan kode.',
};
