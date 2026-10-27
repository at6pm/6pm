import type { Entry } from '../catalogue-types';
import type { enVoice } from '../en-voice';

export const deVoice: { readonly [Key in keyof typeof enVoice]: Entry } = {
  'voice.listening': 'Ich höre zu',
  'voice.sayIt': 'Sag es',
  'voice.nothingTap': 'Das hab ich nicht verstanden. Tipp und sag es noch mal.',
  'voice.noAmount': 'Kein Betrag gehört. Sag auch, wie viel, etwa „fünfundvierzigtausend“.',
  'voice.unavailable': 'Spracheingabe braucht {language} als Diktiersprache auf diesem iPhone',
  'voice.language.vi': 'Vietnamesisch',
  'voice.language.en': 'Englisch',
  'voice.denied': 'Mikrofon oder Spracherkennung ist für 6pm aus.',
  'voice.openSettings': 'Einstellungen öffnen',
  'voice.tapHint': 'Barausgabe ansagen',
  'voice.promptTap': 'Sag es so, wie du es einem Freund schreiben würdest',
  'voice.reading': 'Ich sortiere das',
  'voice.gotIt': 'Verstanden',
  'voice.doneTalking': 'Fertig gesprochen',
  'voice.cancel': 'Abbrechen',
  'voice.heard': 'Gehört: „{said}“',
  'voice.micHint': 'Ausgabe ansagen',
  'voice.stopHint': 'Zuhören beenden',
};
