import type { Entry } from '../catalogue-types';
import type { enSharing } from '../en-sharing';

export const esSharing: { readonly [Key in keyof typeof enSharing]: Entry } = {
  'sharing.saveImage': 'Guardar imagen',
  'sharing.share': 'Compartir',
  'sharing.saved': 'Guardada en Fotos.',
  'sharing.photosOff': '6pm no tiene acceso a Fotos.',
  'sharing.openSettings': 'Abrir Ajustes',
  'sharing.failed': 'No se pudo crear la imagen. Inténtalo de nuevo.',
};
