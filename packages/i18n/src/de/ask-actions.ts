import type { Entry } from '../catalogue-types';
import type { enAskActions } from '../en-ask-actions';

// The spoken examples stay Vietnamese, as in English: they are what the parser reads.
export const deAskActions: { readonly [Key in keyof typeof enAskActions]: Entry } = {
  'ask.action.add': 'Hinzufügen',
  'ask.action.notNow': 'Nicht jetzt',
  'ask.action.confirmSpend': '{name}, {amount}, zu {category} hinzufügen?',
  'ask.action.added': 'Erledigt. {name}, {amount}, zählt für heute.',
  'ask.action.cancelled': 'Okay, nichts geändert.',
  'ask.action.failed': 'Das wurde nicht gesichert. Versuch’s mit „Schnell erfassen“.',
  'ask.action.confirmPot': 'Ein Spartopf für {name}: {goal}. Einrichten?',
  'ask.action.confirmPotBy': 'Ein Spartopf für {name}: {goal} bis {month}. Einrichten?',
  'ask.action.setUp': 'Einrichten',
  'ask.action.potLocked':
    'Kostenlos gibt’s einen eigenen Spartopf, und deiner ist schon belegt. Mit Max ist Platz für mehr.',
  'ask.action.seeMax': 'Max ansehen',
  'ask.action.potGoal': 'Wie viel brauchst du für {name}? Sag’s mir, etwa „10tr“.',
  'ask.action.showMe': 'Zeig mir, wie',
  'ask.action.openQuickAdd': '„Schnell erfassen“ öffnen',
  'ask.howTo.ways':
    'Sechs Wege rein: „Schnell erfassen“ (getippt oder gesagt), einen Bankbeleg mit 6pm teilen, Beleg-E-Mails weiterleiten, einen VietQR scannen und zahlen, Apple Pay-Zahlungen, die von selbst ankommen, und die Widgets und Steuerelemente. Was 6pm erwischt, wartet in deinem Eingang bis zum Tagesabschluss.',
  'ask.howTo.quickAdd':
    '„Schnell erfassen“ nimmt eine Ausgabe getippt oder laut gesagt, etwa „trà sữa 45k“. Oder sag es mir einfach hier: „vừa ăn phở 50k“.',
  'ask.howTo.dailyNumber':
    'Deine Tageszahl ist das freie Geld in diesem Gehaltszyklus, nach Fixkosten, Zukunfts-Ich und Spartöpfen, verteilt auf die Tage bis zum Zahltag. Bleibst du drunter, wächst die von morgen; gehst du drüber, schrumpft sie ein wenig.',
  'ask.howTo.negative':
    'Sie rutscht unter null, wenn du in diesem Zyklus mehr ausgibst, als freies Geld da ist. Nichts geht kaputt: Der Plan verteilt es auf die restlichen Tage. Lass es ein paar Tage ruhiger angehen oder nimm im Plan etwas aus einem Spartopf.',
  'ask.howTo.pot':
    'Ein Spartopf ist Geld, das für eine Sache zurückgelegt wird, etwa eine Reise oder Tết. 6pm legt jeden Monat ein bisschen hinein und hält es aus deiner Tageszahl heraus, damit es da ist, wenn du es brauchst.',
  'ask.howTo.close':
    'Um 18 Uhr schließt du den Tag ab: Behalte oder überspring, was erwischt wurde, und sieh, wo du gelandet bist. Verpasst du es, geht nichts verloren; erwischte Ausgaben warten und zählen, bis du entscheidest.',
  'ask.howTo.budget':
    '6pm hat kein Budget pro Kategorie. Deine Tageszahl ist das Budget: Fixkosten, Zukunfts-Ich und Spartöpfe sind schon zurückgehalten. Willst du für etwas weniger ausgeben, starte einen Spartopf oder gib deinem Zukunfts-Ich im Plan mehr.',
};
