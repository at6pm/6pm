import type { Entry } from '../catalogue-types';
import type { enSharing } from '../en-sharing';

// Apple's names as the iPhone shows them in Indonesian: Foto, Pengaturan, Bagikan.
export const idSharing: { readonly [Key in keyof typeof enSharing]: Entry } = {
  'sharing.saveImage': 'Simpan gambar',
  'sharing.share': 'Bagikan',
  'sharing.saved': 'Tersimpan di Foto.',
  'sharing.photosOff': 'Akses Foto untuk 6pm mati.',
  'sharing.openSettings': 'Buka Pengaturan',
  'sharing.failed': 'Gambar belum bisa dibuat. Coba lagi.',
};
