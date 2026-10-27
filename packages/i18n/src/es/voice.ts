import type { Entry } from '../catalogue-types';
import type { enVoice } from '../en-voice';

// Short and friendly; `{language}` is a language name as a Spanish sentence writes it ("español").
export const esVoice: { readonly [Key in keyof typeof enVoice]: Entry } = {
  'voice.listening': 'Escuchando',
  'voice.sayIt': 'Dilo',
  'voice.nothingTap': 'No te he entendido. Toca y repítelo.',
  'voice.noAmount': 'No he oído ningún importe. Di también cuánto, como “cuarenta y cinco mil”.',
  'voice.unavailable': 'La voz necesita el dictado en {language} en este iPhone',
  'voice.language.vi': 'vietnamita',
  'voice.language.en': 'inglés',
  'voice.denied': 'El micrófono o el reconocimiento de voz están desactivados para 6pm.',
  'voice.openSettings': 'Abrir Ajustes',
  'voice.tapHint': 'Di un gasto en efectivo',
  'voice.promptTap': 'Dilo como se lo escribirías a un amigo',
  'voice.reading': 'Entendiéndolo',
  'voice.gotIt': 'Entendido',
  'voice.doneTalking': 'Ya está',
  'voice.cancel': 'Cancelar',
  'voice.heard': 'He oído “{said}”',
  'voice.micHint': 'Di un gasto',
  'voice.stopHint': 'Dejar de escuchar',
};
