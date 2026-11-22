import type { Entry } from '../catalogue-types';
import type { enQuickAdd } from '../en-quick-add';

export const deQuickAdd: { readonly [Key in keyof typeof enQuickAdd]: Entry } = {
  'quick.face.out': 'Ausgabe',
  'quick.face.in': 'Einnahme',
  'quick.tool.photo': 'Foto',
  'quick.tool.split': 'Teilen',
  'quick.tool.jar': 'Aus einem Glas',
  'quick.tool.noJar': 'Nicht aus einem Glas',
  'quick.todayStays': 'HEUTE BLEIBT {amount}',
  'quick.in.ticket': '6pm · Einnahme',
  'quick.in.whoFrom': 'Von wem',
  'quick.in.name': 'Name',
  'quick.in.who': 'Von wem kam es?',
  'quick.in.into': 'Eingegangen auf',
  'quick.in.days': 'In deine Tage',
  'quick.in.daysLast': 'In deine Tage, wie letztes Mal',
  'quick.in.jarLast': 'Ins {jar}, wie letztes Mal',
  'quick.in.pay': 'Dein Lohn',
  'quick.in.payLast': 'Dein Lohn, wie letztes Mal',
  'quick.in.landing': {
    one: '+{count} TAG · REICHT BIS {date}',
    other: '+{count} TAGE · REICHT BIS {date}',
  },
  'quick.in.work': 'ARBEIT',
  'voice.missed': 'Das hab ich nicht verstanden.',
  'voice.heardFirst': 'Ich habe {said} gehört. Sag zuerst den Betrag: „45k, Pho“.',
  'voice.sayFirst': 'Sag zuerst den Betrag: „45k, Pho“.',
  'voice.nothingHeard': 'Ich habe nichts gehört. Ist das Mikro erlaubt?',
  'voice.tryAgain': 'Noch mal',
  'voice.toKeypad': 'Zurück zum Ziffernblock',
};
