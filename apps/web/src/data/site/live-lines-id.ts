import type { LiveLines } from './live-lines';

export const liveLinesId: LiveLines = {
  clock: (time, left) => `Di tempatmu jam ${time.replace(':', '.')} · tutup hari ${left} lagi`,
  closeNow: 'Sudah jam enam. Saatnya tutup hari.',
  duration: (h, m) => (h ? `${h} j ${m} mnt` : `${m} mnt`),
  countdown: (d, h, m) => `${d} hr ${h} j ${m} mnt menuju peluncuran`,
  out: 'Sudah rilis',
  sent: 'Kamu sudah masuk daftar. Sampai jumpa jam enam.',
  notAnEmail: 'Sepertinya itu belum alamat email.',
  busy: 'Terlalu banyak percobaan dari sini. Tunggu semenit, lalu coba lagi.',
  unreachable: 'Daftarnya nggak bisa dihubungi. Cek koneksimu, lalu coba lagi.',
};
