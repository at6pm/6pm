import type { Entry } from '../catalogue-types';
import type { enTogether } from '../en-together';

// A shared pot is a "gemeinsamer Spartopf"; Apple's sign-in keeps its German name, "Mit Apple anmelden".
export const deTogether: { readonly [Key in keyof typeof enTogether]: Entry } = {
  'together.title': 'Gemeinsam budgetieren',
  'together.card.subOn': 'Lade jemanden zu einem gemeinsamen Spartopf ein.',
  'together.card.subPaired': {
    one: 'Mit {name} · 1 gemeinsamer Spartopf',
    other: 'Mit {name} · {count} gemeinsame Spartöpfe',
  },
  'together.card.open': 'Gemeinsam budgetieren öffnen',
  'together.you': 'Du',
  'together.partner': 'Partner',

  'together.intro.title': 'Gemeinsam darauf sparen.',
  'together.intro.sub':
    'Teil einen Spartopf mit der Person, mit der du sparst. Ihr zahlt beide ein, und jeder sieht, wer was beigesteuert hat. Deine eigenen Tage bleiben auf deinem Handy.',
  'together.intro.note':
    '„Mit Apple anmelden“ brauchst du nur für „Gemeinsam budgetieren“. 6pm fragt nach deinem Vornamen, nie nach deiner E-Mail.',
  'together.signIn.failed': 'Anmelden mit Apple hat nicht geklappt. Versuch es noch mal.',
  'together.signIn.unavailable': '„Mit Apple anmelden“ ist auf diesem iPhone nicht verfügbar.',

  'together.waiting.title': 'Bisher nur du.',
  'together.waiting.sub':
    'Schick den Link an die Person, mit der du sparst. Sobald sie dabei ist, sieht sie eure gemeinsamen Spartöpfe.',
  'together.paired.title': 'Du und {name}',
  'together.paired.sub': { one: '1 gemeinsamer Spartopf', other: '{count} gemeinsame Spartöpfe' },
  'together.invite': 'Jemanden einladen',
  'together.invite.again': 'Neuen Einladungslink senden',
  'together.invite.message': 'Spar mit mir in 6pm: {url}',
  'together.invite.note': 'Ein Einladungslink funktioniert einmal, 7 Tage lang.',
  'together.offline': 'Offline. Das hast du zuletzt gesehen.',

  'together.pots.title': 'Gemeinsame Spartöpfe',
  'together.newPot': 'Neuer gemeinsamer Spartopf',
  'together.newPotSub': 'Ihr zahlt beide ein.',
  'together.jar.add': '{amount} in {name} einzahlen',
  'together.jar.split': 'Du {mine} · {partner} {theirs}',
  'together.jar.mine': 'Du hast {mine} eingezahlt',

  'together.pot.edit': 'Spartopf bearbeiten',
  'together.pot.start': 'Spartopf starten',
  'together.pot.save': 'Sichern',
  'together.pot.sumMonthly': 'Etwa {amount} im Monat, ihr beide zusammen',
  'together.pot.sumSub': 'Was du einzahlst, zählt wie eine Aufstockung deiner eigenen Spartöpfe.',
  'together.pot.sumNone': 'Kein Datum, keine Eile',
  'together.pot.sumNoneSub': 'Zahl ein, wann immer du magst.',
  'together.pot.amount': 'Einzahlen',
  'together.pot.addButton': '{amount} einzahlen',
  'together.pot.entries': 'Wer was eingezahlt hat',
  'together.pot.empty': 'Noch nichts drin.',
  'together.pot.entry': '{who} · {day}',
  'together.pot.takeBack': 'Zurücknehmen',
  'together.pot.takeBackLabel': '{amount} zurücknehmen',
  'together.pot.delete': 'Gemeinsamen Spartopf löschen',
  'together.pot.deleteConfirm': 'Noch mal tippen, um ihn für euch beide zu löschen',
  'together.pot.deleted': '{name} gelöscht',
  'together.pot.gone':
    'Diesen Spartopf gibt es nicht mehr. Vielleicht hat ihn die andere Person gelöscht.',

  'together.leave': '„Gemeinsam budgetieren“ verlassen',
  'together.leaveConfirm': 'Noch mal tippen zum Verlassen',
  'together.leave.note':
    'Wenn du gehst, endet es für euch beide, und die gemeinsamen Spartöpfe werden von unserem Server gelöscht. Was ihr eingezahlt habt, behält jeder auf seinem eigenen Handy.',
  'together.deleteAccount': 'Konto für „Gemeinsam budgetieren“ löschen',
  'together.deleteConfirm': 'Noch mal tippen, um dein Konto zu löschen',
  'together.delete.note':
    'Löscht deine Anmeldung und alles, was du teilst, und teilt Apple mit, dass 6pm deinen Apple Account nicht mehr nutzt. Deine eigenen Tage bleiben auf diesem Handy.',
  'together.kept.title': 'Auf diesem iPhone behalten',
  'together.kept.sub':
    'Was du in gemeinsame Spartöpfe eingezahlt hast: {amount}. Das bleibt hier, auch wenn ein Spartopf weg ist.',

  'together.join.title': '„Gemeinsam budgetieren“ beitreten',
  'together.join.sub':
    'Jemand hat dich eingeladen, in 6pm Spartöpfe zu teilen. Melde dich mit Apple an, um mitzumachen. Deine eigenen Tage bleiben auf deinem Handy.',
  'together.join.button': 'Beitreten',
  'together.join.expired': 'Diese Einladung ist abgelaufen. Frag nach einem neuen Link.',
  'together.join.used': 'Diese Einladung wurde schon benutzt. Frag nach einem neuen Link.',
  'together.join.full': 'Dort teilen schon zwei Personen Spartöpfe.',
  'together.join.own':
    'Das ist deine eigene Einladung. Schick sie an die Person, mit der du sparst.',
  'together.join.paired':
    'Du teilst schon Spartöpfe. Verlass zuerst „Gemeinsam budgetieren“ und öffne den Link dann noch mal.',
  'together.join.missing': 'Dieser Einladungslink funktioniert nicht. Frag nach einem neuen.',

  'together.error.offline': '6pm war nicht erreichbar. Nichts wurde geändert.',
  'together.error.failed': 'Das hat nicht geklappt. Nichts wurde geändert.',
  'together.ended':
    '„Gemeinsam budgetieren“ ist beendet. Was du eingezahlt hast, bleibt auf diesem Handy.',
  'together.left': 'Du hast „Gemeinsam budgetieren“ verlassen.',
  'together.deleted': 'Konto für „Gemeinsam budgetieren“ gelöscht.',
  'together.joined': 'Du bist dabei. Gemeinsam budgetieren mit {name}.',
};
