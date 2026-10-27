import type { Entry } from '../catalogue-types';
import type { enSharing } from '../en-sharing';

export const deSharing: { readonly [Key in keyof typeof enSharing]: Entry } = {
  'sharing.saveImage': 'Bild sichern',
  'sharing.share': 'Teilen',
  'sharing.saved': 'In Fotos gesichert.',
  'sharing.photosOff': 'Der Fotos-Zugriff ist für 6pm aus.',
  'sharing.openSettings': 'Einstellungen öffnen',
  'sharing.failed': 'Das Bild ließ sich nicht erstellen. Versuch’s noch mal.',
};
