import type { Entry } from '../catalogue-types';
import type { enAskLedger } from '../en-ask-ledger';

// `{range}` never opens a sentence, so it can stay lowercase wherever it lands.
export const deAskLedger: { readonly [Key in keyof typeof enAskLedger]: Entry } = {
  'ask.range.today': 'heute',
  'ask.range.yesterday': 'gestern',
  'ask.range.thisWeek': 'diese Woche',
  'ask.range.lastWeek': 'letzte Woche',
  'ask.range.thisCycle': 'seit dem Zahltag',
  'ask.range.lastCycle': 'im letzten Gehaltszyklus',
  'ask.range.thisMonth': 'diesen Monat',
  'ask.range.lastMonth': 'letzten Monat',
  'ask.range.last7Days': 'in den letzten 7 Tagen',
  'ask.range.last30Days': 'in den letzten 30 Tagen',
  'ask.range.dates': 'vom {from} bis {to}',

  'ask.answer.spent': {
    one: 'Du hast {range} {total} ausgegeben, mit einer einzigen Ausgabe.',
    other: 'Du hast {range} {total} ausgegeben, verteilt auf {count} Ausgaben.',
  },
  'ask.answer.spentOn': {
    one: 'Du hast {range} {total} für {category} ausgegeben, einmal.',
    other: 'Du hast {range} {total} für {category} ausgegeben, {count}-mal.',
  },
  'ask.answer.spentAt': {
    one: 'Du hast {range} {total} bei {merchant} ausgegeben, bei einem Besuch.',
    other: 'Du hast {range} {total} bei {merchant} ausgegeben, bei {count} Besuchen.',
  },
  'ask.answer.spentNone': 'Du hast {range} nichts ausgegeben.',
  'ask.answer.spentNoneOn': 'Du hast {range} nichts für {category} ausgegeben.',
  'ask.answer.spentNoneAt': 'Du hast {range} nichts bei {merchant} ausgegeben.',
  'ask.answer.breakdown': 'Von {total} {range} entfiel das meiste auf {top}.',
  'ask.answer.compared.up': 'Das sind {now} {range} – mehr als {before} {against}.',
  'ask.answer.compared.down': 'Das sind {now} {range} – weniger als {before} {against}.',
  'ask.answer.compared.same': 'Etwa gleich: {now} {range}, {before} {against}.',
  'ask.answer.listed': {
    one: 'Eine Ausgabe {range}: {total}.',
    other: '{count} Ausgaben {range}, {total} insgesamt.',
  },
  'ask.answer.listedMore': 'Und {more} weitere.',
  'ask.answer.listedNone': 'Keine solchen Ausgaben {range}.',
  'ask.answer.bills': {
    one: 'Bis zum Zahltag ist noch ein Fixkostenposten offen: {total}.',
    other: 'Bis zum Zahltag sind noch {count} Fixkostenposten offen, {total} insgesamt.',
  },
  'ask.answer.billsNone': 'Bis zum Zahltag sind keine Fixkosten mehr offen.',
  'ask.answer.how': 'Das fällt gerade auf.',
  'ask.answer.howNothing': 'Bisher alles ruhig. Noch fällt nichts auf.',
  'ask.answer.noSuchCategory':
    'Ich finde keine Kategorie „{category}“. Frag nach einer von deinen.',
  'ask.answer.noRange': 'Dafür gibt es noch nichts anzuschauen.',
  'ask.answer.chat': 'Jederzeit. Frag mich zu deinem Geld, wann immer du magst.',
  'ask.answer.partial': 'Gezählt wird, was 6pm seit dem {since} festgehalten hat.',
  'ask.row.total': 'Summe',
  'ask.row.before': 'Vorher',
  'ask.answer.goalPace.months': {
    one: 'Mit {monthly} im Monat für Zukunfts-Ich dauern {amount} für {what} etwa einen Monat, bis ungefähr {month}.',
    other:
      'Mit {monthly} im Monat für Zukunfts-Ich dauern {amount} für {what} etwa {count} Monate, bis ungefähr {month}.',
  },
  'ask.answer.goalPace.years': {
    other:
      'Mit {monthly} im Monat für Zukunfts-Ich dauern {amount} für {what} etwa {count} Jahre, bis ungefähr {month}.',
  },
  'ask.answer.goalPace.note': 'Ein eigener Spartopf dafür hält das Geld vom Rest getrennt.',
  'ask.answer.goalNoPace':
    'Bisher geht monatlich nichts an Zukunfts-Ich, also gibt es kein Tempo, um {amount} für {what} hochzurechnen. Ein bisschen jeden Monat, und schon gibt es eins.',
  'ask.answer.goalAmount':
    'Was kostet {what} ungefähr? Nenn mir den Preis, etwa „{example}“, und ich rechne es aus.',
  'ask.row.reachedBy': 'Etwa',
};
