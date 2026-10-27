import type { Entry } from '../catalogue-types';
import type { enVoice } from '../en-voice';

// Language names are lowercase: they slot into « la dictée en {language} ».
export const frVoice: { readonly [Key in keyof typeof enVoice]: Entry } = {
  'voice.listening': 'J’écoute',
  'voice.sayIt': 'Dis-le',
  'voice.nothingTap': 'Je n’ai pas compris. Touche et redis-le.',
  'voice.noAmount': 'Pas de montant entendu. Dis aussi combien, comme « quarante-cinq k ».',
  'voice.unavailable': 'La voix demande la dictée en {language} sur cet iPhone',
  'voice.language.vi': 'vietnamien',
  'voice.language.en': 'anglais',
  'voice.denied': 'Le micro ou la reconnaissance vocale est désactivé pour 6pm.',
  'voice.openSettings': 'Ouvrir Réglages',
  'voice.tapHint': 'Dis une dépense en espèces',
  'voice.promptTap': 'Dis-le comme dans un texto à un pote',
  'voice.reading': 'Je décrypte',
  'voice.gotIt': 'C’est noté',
  'voice.doneTalking': 'J’ai fini',
  'voice.cancel': 'Annuler',
  'voice.heard': 'Entendu : « {said} »',
  'voice.micHint': 'Dis une dépense',
  'voice.stopHint': 'Arrêter l’écoute',
};
