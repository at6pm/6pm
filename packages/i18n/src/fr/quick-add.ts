import type { Entry } from '../catalogue-types';
import type { enQuickAdd } from '../en-quick-add';

export const frQuickAdd: { readonly [Key in keyof typeof enQuickAdd]: Entry } = {
  'quick.face.out': 'Dépensé',
  'quick.face.in': 'Reçu',
  'quick.tool.photo': 'Joindre',
  'quick.tool.split': 'Partager',
  'quick.tool.jar': 'D’un bocal',
  'quick.tool.noJar': 'Pas d’un bocal',
  'quick.todayStays': 'AUJOURD’HUI RESTE {amount}',
  'quick.in.ticket': '6pm · Rentrée',
  'quick.in.whoFrom': 'De qui',
  'quick.in.name': 'Nom',
  'quick.in.who': 'De qui vient-il ?',
  'quick.in.into': 'Arrivé sur',
  'quick.in.days': 'Dans tes jours',
  'quick.in.daysLast': 'Dans tes jours, comme la dernière fois',
  'quick.in.jarLast': 'Dans {jar}, comme la dernière fois',
  'quick.in.pay': 'Ta paie',
  'quick.in.payLast': 'Ta paie, comme la dernière fois',
  'quick.in.landing': {
    one: '+{count} JOUR · COUVERT JUSQU’AU {date}',
    other: '+{count} JOURS · COUVERT JUSQU’AU {date}',
  },
  'quick.in.work': 'TRAVAIL',
  'voice.missed': 'Je n’ai pas compris.',
  'voice.heardFirst': 'J’ai entendu {said}. Dis d’abord le montant : « 45k, phở ».',
  'voice.sayFirst': 'Dis d’abord le montant : « 45k, phở ».',
  'voice.nothingHeard': 'Je n’ai rien entendu. Le micro est-il autorisé ?',
  'voice.tryAgain': 'Redire',
  'voice.toKeypad': 'Revenir au pavé',
};
