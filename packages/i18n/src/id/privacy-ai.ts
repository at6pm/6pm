import type { Entry } from '../catalogue-types';
import type { enPrivacyAi } from '../en-privacy-ai';

export const idPrivacyAi: { readonly [Key in keyof typeof enPrivacyAi]: Entry } = {
  'privacy.ai.title': 'Di mana 6pm sebaiknya berpikir?',
  'privacy.ai.sub':
    'Tempat pertanyaan dan kalimat temanmu diolah. Bisa diganti kapan saja di Pengaturan.',
  'privacy.ai.server.title': 'Di server kami, dengan Claude',
  'privacy.ai.server.text':
    'Jawaban paling tajam, dan suara yang paham bahasa Vietnam. Hanya satu pertanyaan atau beberapa fakta yang keluar dari ponselmu, tidak pernah daftar pengeluaranmu.',
  'privacy.ai.server.tag': 'Disarankan',
  'privacy.ai.device.title': 'Hanya di iPhone ini',
  'privacy.ai.device.text':
    'Tidak ada AI yang keluar dari ponselmu. Model diunduh sekali, lewat Wi‑Fi.',
  'privacy.ai.device.unavailable': 'Memori iPhone ini tidak cukup untuk model sendiri.',
  'privacy.ai.models': 'Model AI',
  'privacy.model.fast': 'Paling cepat dan ringan',
  'privacy.model.words': 'Kalimat terbaik',
  'privacy.model.reading': 'Paling paham pertanyaan',
  'privacy.model.size': '{size} GB',
  'privacy.model.download': 'Unduh',
  'privacy.model.downloading': '{percent}%',
  'privacy.model.verifying': 'Memeriksa',
  'privacy.model.ready': 'Siap',
  'privacy.model.failed': 'Coba lagi',
  'privacy.model.delete': 'Hapus',
  'privacy.model.later': 'Kamu bisa lanjut selama model diunduh.',
  'settings.ai': 'AI',
  'settings.ai.server': 'Di server kami',
  'settings.ai.device': 'Di iPhone ini',
  'privacy.leaves.title': 'Yang keluar dari ponselmu',
  'privacy.leaves.server.ask': 'Pertanyaan, dengan nama kategori dan celenganmu, untuk membacanya',
  'privacy.leaves.server.lines': 'Beberapa fakta dalam satu kalimat temanmu',
  'privacy.leaves.server.receipts': 'Foto struk yang tidak bisa dibaca ponselmu',
  'privacy.leaves.server.voice': 'Suaramu saat bicara, untuk diubah jadi teks',
  'privacy.leaves.device.none': 'Tidak ada AI. Semuanya dihitung di iPhone ini.',
  'privacy.leaves.device.network':
    'Kurs (hanya tanggal), pembaruan app, dan pembelian tetap memakai internet.',
  'privacy.leaves.device.emails': 'Email struk mati dalam mode ini.',
};
