import type { Entry } from '../catalogue-types';
import type { enNotifications } from '../en-notifications';

export const deNotifications: { readonly [Key in keyof typeof enNotifications]: Entry } = {
  'notify.channel.payday': 'Zahltag',
  'notify.channel.capture': 'Ausgaben erwischen',
  'notify.channel.reminders': 'Deine Erinnerungen',

  'notify.close.leadSix': 'Es ist sechs.',
  'notify.close.leadAt': 'Es ist {time}.',

  'notify.close.jarReady.soft': '{lead} Dein Sparglas {jar} ist bereit.',
  'notify.close.jarReady.cheeky': '{lead} Dein Sparglas {jar} ist bereit. Schau mal rein.',
  'notify.close.jarReady.roast': '{lead} Dein Sparglas {jar} ist bereit. Wer hätte das gedacht.',
  'notify.close.jarReady.plain': '{lead} Das Sparglas {jar} ist bereit.',

  'notify.close.countdown.soft': {
    one: '{lead} Noch 1 Tag bis {festival}.',
    other: '{lead} Noch {count} Tage bis {festival}.',
  },
  'notify.close.countdown.cheeky': {
    one: '{lead} Noch 1 Tag bis {festival}. Fast geschafft.',
    other: '{lead} Noch {count} Tage bis {festival}. Die Laternen hängen schon.',
  },
  'notify.close.countdown.roast': {
    one: '{lead} Noch 1 Tag bis {festival}. Halt dein Portemonnaie fest.',
    other: '{lead} Noch {count} Tage bis {festival}. Halt dein Portemonnaie fest.',
  },
  'notify.close.countdown.plain': {
    one: '{lead} Noch 1 Tag bis {festival}.',
    other: '{lead} Noch {count} Tage bis {festival}.',
  },
  'notify.close.countdownJar.soft': {
    one: '{lead} Noch 1 Tag bis {festival}. Im Spartopf {festival} sind {amount}.',
    other: '{lead} Noch {count} Tage bis {festival}. Im Spartopf {festival} sind {amount}.',
  },
  'notify.close.countdownJar.cheeky': {
    one: '{lead} Noch 1 Tag bis {festival}. Dein Spartopf hält {amount}.',
    other: '{lead} Noch {count} Tage bis {festival}. Dein Spartopf hält {amount}.',
  },
  'notify.close.countdownJar.roast': {
    one: '{lead} Noch 1 Tag bis {festival}. {amount} im Spartopf. Gut aufpassen.',
    other: '{lead} Noch {count} Tage bis {festival}. {amount} im Spartopf. Gut aufpassen.',
  },
  'notify.close.countdownJar.plain': {
    one: '{lead} Noch 1 Tag bis {festival}. Spartopf {festival}: {amount}.',
    other: '{lead} Noch {count} Tage bis {festival}. Spartopf {festival}: {amount}.',
  },

  'notify.close.pay.soft': '{lead} Dein Gehalt wartet auf seinen Platz.',
  'notify.close.pay.cheeky': '{lead} Dein Gehalt ist da. Gib ihm eine Aufgabe.',
  'notify.close.pay.roast': '{lead} Dein Gehalt ist da. Verteil es, bevor es sich verläuft.',
  'notify.close.pay.plain': '{lead} Dein Gehalt wartet darauf, verteilt zu werden.',

  'notify.close.bonus.soft': '{lead} Dein Bonus für {festival} wartet auf seinen Platz.',
  'notify.close.bonus.cheeky': '{lead} Dein Bonus für {festival} ist da. Komm, teil ihn auf.',
  'notify.close.bonus.roast':
    '{lead} Der Bonus für {festival} ist da. Verteil ihn, bevor die Läden ihn finden.',
  'notify.close.bonus.plain': '{lead} Dein Bonus für {festival} wartet darauf, verteilt zu werden.',

  'notify.close.payback.soft': '{lead} {name} hat dir das Geld zurückgezahlt.',
  'notify.close.payback.cheeky': '{lead} {name} hat zurückgezahlt. Freundschaft gerettet.',
  'notify.close.payback.roast': '{lead} {name} hat tatsächlich zurückgezahlt.',
  'notify.close.payback.plain': '{lead} {name} hat zurückgezahlt.',

  'notify.close.moneyIn.soft': '{lead} Geld ist reingekommen. Es wartet auf den Abschluss.',
  'notify.close.moneyIn.cheeky': '{lead} Geld ist reingekommen. Sag ihm, wo es hinsoll.',
  'notify.close.moneyIn.roast':
    '{lead} Geld ist reingekommen. Lass es nicht auf dumme Gedanken kommen.',
  'notify.close.moneyIn.plain': '{lead} Geld ist eingegangen. Verteil es beim Abschluss.',

  'notify.close.yearCard.soft': '{lead} Dein Jahr {year} ist bereit für den Rückblick.',
  'notify.close.yearCard.cheeky': '{lead} Dein Jahr {year} ist fertig. Magst du es sehen?',
  'notify.close.yearCard.roast': '{lead} Dein ganzes Jahr {year}. Traust du dich hinzusehen?',
  'notify.close.yearCard.plain': '{lead} Der Rückblick auf {year} ist bereit.',

  'notify.payday.amounts.soft': 'Zahltag. {jars} in deine Spargläser, {daily} pro Tag bis {date}.',
  'notify.payday.amounts.cheeky':
    'Zahltag! {jars} in deine Spargläser, {daily} pro Tag bis {date}.',
  'notify.payday.amounts.roast':
    'Zahltag. {jars} gespart, bevor du blinzeln konntest, {daily} pro Tag bis {date}.',
  'notify.payday.amounts.plain': 'Zahltag. {jars} in die Spargläser, {daily} pro Tag bis {date}.',
  'notify.payday.noJars': 'Zahltag. {daily} pro Tag bis {date}.',
  'notify.payday.hidden': 'Zahltag. Deine Spargläser sind gefüllt.',
  'notify.payday.hiddenNoJars': 'Zahltag. Ein neuer Monat beginnt.',

  'notify.firstCatch.amounts.soft': 'Die erste erwischt: {amount} · {name}. Mehr braucht es nicht.',
  'notify.firstCatch.amounts.cheeky': 'Die erste erwischt: {amount} · {name}. Leicht, oder?',
  'notify.firstCatch.amounts.roast':
    'Die erste erwischt: {amount} · {name}. Hat nicht mal wehgetan.',
  'notify.firstCatch.amounts.plain': 'Erste Ausgabe erwischt: {amount} · {name}.',
  'notify.firstCatch.hidden': 'Die erste bei {name} erwischt. Mehr braucht es nicht.',
  'notify.firstCatch.noName': 'Die erste erwischt. Mehr braucht es nicht.',

  'notify.quiet.soft': 'Seit {count} Tagen nichts von {way}. Ist die Automation noch an?',
  'notify.quiet.cheeky':
    'Seit {count} Tagen nichts von {way}. Sehr sparsam, oder ist die Automation aus?',
  'notify.quiet.roast':
    'Seit {count} Tagen nichts von {way}. Entweder bist du ein Engel, oder die Automation ist aus.',
  'notify.quiet.plain': 'Seit {count} Tagen nichts von {way}. Prüf, ob die Automation noch an ist.',
  'notify.quiet.yourAlerts': 'deinen Bankmitteilungen',

  'notify.owed.one.soft': '{name} schuldet dir noch {amount}. Frag, wann es dir passt.',
  'notify.owed.one.cheeky': '{name} schuldet dir noch {amount}. Zeit für einen netten Stups?',
  'notify.owed.one.roast': '{name} schuldet dir noch {amount}. Dein Geld vermisst dich.',
  'notify.owed.one.plain': '{name} schuldet dir noch {amount}.',
  'notify.owed.oneHidden': '{name} schuldet dir noch etwas. Frag, wann es dir passt.',
  'notify.owed.noName': 'Dir stehen noch {amount} zu.',
  'notify.owed.noNameHidden': 'Jemand schuldet dir noch etwas. Frag, wann es dir passt.',
  'notify.owed.many': '{count} Leute schulden dir noch {amount}.',
  'notify.owed.manyHidden': '{count} Leute schulden dir noch etwas.',

  'settings.notifications': 'Mitteilungen',
  'settings.notificationsOn': 'An',
  'notify.settings.title': 'Mitteilungen',
  'notify.settings.phone': 'Auf diesem Handy',
  'notify.settings.allowed': 'Erlaubt',
  'notify.settings.turnOn': 'Einschalten',
  'notify.settings.offInSettings': 'In Einstellungen aus',
  'notify.settings.offSub': 'Bis sie an sind, kommt nichts bei dir an.',
  'notify.settings.kinds': 'Was 6pm schickt',
  'notify.kind.close': 'Abschluss-Erinnerung',
  'notify.kind.close.sub': 'Jeden Tag um {time}, mit dem Neuen vom Tag',
  'notify.kind.payday': 'Zahltag',
  'notify.kind.payday.sub': 'Am Morgen, an dem dein Gehalt kommt, um 08:30',
  'notify.kind.capture': 'Ausgaben erwischen',
  'notify.kind.capture.sub': 'Deine erste erwischte Ausgabe, und wenn ein Weg verstummt',
  'notify.kind.reminders': 'Deine Erinnerungen',
  'notify.kind.reminders.sub': 'Wer dir etwas schuldet, an dem Tag, den du wählst',
  'notify.settings.lockScreen': 'Sperrbildschirm',
  'notify.settings.amounts': 'Beträge auf dem Sperrbildschirm',
  'notify.settings.amounts.sub': 'Aus: Die Texte lassen die Zahlen weg',
  'notify.settings.note':
    'Einmal am Tag ist das Ritual: Die Abschluss-Erinnerung bringt das Neue vom Tag. Höchstens eine weitere am Tag, und zwischen 22:00 und 08:00 nur dein Abschluss.',

  'owed.remind.button': 'Erinnere mich',
  'owed.remind.threeDays': 'In 3 Tagen',
  'owed.remind.week': 'In einer Woche',
  'owed.remind.payday': 'Am Zahltag',
  'owed.remind.set': 'Erinnerung: {date}',
  'owed.remind.cancel': 'Nicht erinnern',
  'owed.remind.toast': 'Ich erinnere dich: {date}, 10:00.',
  'owed.remind.off': 'Deine Erinnerungen sind in den Einstellungen aus.',
};
