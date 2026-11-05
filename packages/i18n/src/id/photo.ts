import type { Entry } from '../catalogue-types';
import type { enPhoto } from '../en-photo';

export const idPhoto: { readonly [Key in keyof typeof enPhoto]: Entry } = {
  'photo.kept': 'Ada foto',
  'photo.slot': 'FOTO',
  'photo.add': 'Tambah foto',
  'photo.open': 'Buka foto',
  'photo.take': 'Ambil foto',
  'photo.choose': 'Pilih dari Foto',
  'photo.close': 'Tutup',
  'photo.hint': 'Usap ke bawah untuk menjepitnya lagi',
  'photo.replace': 'Ganti',
  'photo.remove': 'Lepas',
  'photo.removed': 'Foto dilepas. Pengeluarannya tetap ada.',
  'photo.stamp.top': 'DISIMPAN',
  'photo.stamp.bottom': 'DI HP INI SAJA',
  'photo.clipOne': 'JEPIT FOTO',
  'photo.cameraOff': 'Kamera untuk 6pm mati. Nyalakan di Pengaturan.',
  'photo.failed': 'Foto itu tidak bisa disimpan.',
};
