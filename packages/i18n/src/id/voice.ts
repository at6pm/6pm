import type { Entry } from '../catalogue-types';
import type { enVoice } from '../en-voice';

export const idVoice: { readonly [Key in keyof typeof enVoice]: Entry } = {
  'voice.listening': 'Mendengarkan',
  'voice.sayIt': 'Ucapkan',
  'voice.nothingTap': 'Aku belum menangkapnya. Ketuk dan ucapkan lagi.',
  'voice.noAmount':
    'Jumlahnya belum terdengar. Sebutkan juga berapa, misalnya “empat puluh lima ribu”.',
  'voice.unavailable': 'Suara butuh dikte {language} di iPhone ini',
  'voice.language.vi': 'bahasa Vietnam',
  'voice.language.en': 'bahasa Inggris',
  'voice.denied': 'Mikrofon atau pengenalan ucapan sedang mati untuk 6pm.',
  'voice.openSettings': 'Buka Pengaturan',
  'voice.tapHint': 'Ucapkan pengeluaran tunai',
  'voice.promptTap': 'Ucapkan seperti chat ke teman',
  'voice.reading': 'Sedang memahami',
  'voice.gotIt': 'Dapat',
  'voice.doneTalking': 'Selesai bicara',
  'voice.cancel': 'Batal',
  'voice.heard': 'Terdengar “{said}”',
  'voice.micHint': 'Ucapkan pengeluaran',
  'voice.stopHint': 'Berhenti mendengarkan',
};
