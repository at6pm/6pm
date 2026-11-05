import type { Entry } from '../catalogue-types';
import type { enPhoto } from '../en-photo';

export const dePhoto: { readonly [Key in keyof typeof enPhoto]: Entry } = {
  'photo.kept': 'Foto dabei',
  'photo.slot': 'FOTO',
  'photo.add': 'Foto hinzufügen',
  'photo.open': 'Foto öffnen',
  'photo.take': 'Foto aufnehmen',
  'photo.choose': 'Aus Fotos wählen',
  'photo.close': 'Schließen',
  'photo.hint': 'Nach unten wischen, um es wieder anzuklammern',
  'photo.replace': 'Ersetzen',
  'photo.remove': 'Entfernen',
  'photo.removed': 'Foto entfernt. Die Ausgabe bleibt.',
  'photo.stamp.top': 'NUR AUF',
  'photo.stamp.bottom': 'DIESEM TELEFON',
  'photo.clipOne': 'FOTO ANKLAMMERN',
  'photo.cameraOff': 'Die Kamera ist für 6pm aus. Schalte sie in den Einstellungen ein.',
  'photo.failed': 'Dieses Foto konnte nicht behalten werden.',
};
