import type { Entry } from '../catalogue-types';
import type { enPhoto } from '../en-photo';

export const esPhoto: { readonly [Key in keyof typeof enPhoto]: Entry } = {
  'photo.kept': 'Con foto',
  'photo.slot': 'FOTO',
  'photo.add': 'Añadir una foto',
  'photo.open': 'Abrir la foto',
  'photo.take': 'Hacer una foto',
  'photo.choose': 'Elegir de Fotos',
  'photo.close': 'Cerrar',
  'photo.hint': 'Desliza hacia abajo para volver a sujetarla',
  'photo.replace': 'Cambiar',
  'photo.remove': 'Quitar',
  'photo.removed': 'Foto quitada. El gasto se queda.',
  'photo.stamp.top': 'GUARDADA',
  'photo.stamp.bottom': 'SOLO EN ESTE TELÉFONO',
  'photo.clipOne': 'SUJETA UNA',
  'photo.cameraOff': 'La cámara está desactivada para 6pm. Actívala en Ajustes.',
  'photo.failed': 'No se pudo guardar esa foto.',
};
