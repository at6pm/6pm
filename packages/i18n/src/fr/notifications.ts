import type { Entry } from '../catalogue-types';
import type { enNotifications } from '../en-notifications';

export const frNotifications: { readonly [Key in keyof typeof enNotifications]: Entry } = {
  'notify.channel.payday': 'Jour de paie',
  'notify.channel.capture': 'Repérage des dépenses',
  'notify.channel.reminders': 'Tes rappels',

  'notify.close.leadSix': 'Il est 18 h.',
  'notify.close.leadAt': 'Il est {time}.',

  'notify.close.jarReady.soft': '{lead} Ton bocal {jar} est prêt.',
  'notify.close.jarReady.cheeky': '{lead} Ton bocal {jar} est prêt. Va jeter un œil.',
  'notify.close.jarReady.roast': '{lead} Ton bocal {jar} est prêt. Qui l’eût cru.',
  'notify.close.jarReady.plain': '{lead} Le bocal {jar} est prêt.',

  'notify.close.countdown.soft': {
    one: '{lead} {festival} dans 1 jour.',
    other: '{lead} {festival} dans {count} jours.',
  },
  'notify.close.countdown.cheeky': {
    one: '{lead} {festival} dans 1 jour. On y est presque.',
    other: '{lead} {festival} dans {count} jours. Les lanternes sont de sortie.',
  },
  'notify.close.countdown.roast': {
    one: '{lead} {festival} dans 1 jour. Tiens bien ton portefeuille.',
    other: '{lead} {festival} dans {count} jours. Tiens bien ton portefeuille.',
  },
  'notify.close.countdown.plain': {
    one: '{lead} {festival} dans 1 jour.',
    other: '{lead} {festival} dans {count} jours.',
  },
  'notify.close.countdownJar.soft': {
    one: '{lead} {festival} dans 1 jour. Ta cagnotte {festival} contient {amount}.',
    other: '{lead} {festival} dans {count} jours. Ta cagnotte {festival} contient {amount}.',
  },
  'notify.close.countdownJar.cheeky': {
    one: '{lead} {festival} dans 1 jour. Ta cagnotte garde {amount} au chaud.',
    other: '{lead} {festival} dans {count} jours. Ta cagnotte garde {amount} au chaud.',
  },
  'notify.close.countdownJar.roast': {
    one: '{lead} {festival} dans 1 jour. {amount} dans la cagnotte. Veille sur elle.',
    other: '{lead} {festival} dans {count} jours. {amount} dans la cagnotte. Veille sur elle.',
  },
  'notify.close.countdownJar.plain': {
    one: '{lead} {festival} dans 1 jour. La cagnotte {festival} contient {amount}.',
    other: '{lead} {festival} dans {count} jours. La cagnotte {festival} contient {amount}.',
  },

  'notify.close.pay.soft': '{lead} Ta paie attend d’être rangée.',
  'notify.close.pay.cheeky': '{lead} Ta paie est tombée. Viens lui trouver un rôle.',
  'notify.close.pay.roast': '{lead} Ta paie est arrivée. Range-la avant qu’elle file.',
  'notify.close.pay.plain': '{lead} Ta paie attend d’être répartie.',

  'notify.close.bonus.soft': '{lead} Ta prime de {festival} attend d’être rangée.',
  'notify.close.bonus.cheeky': '{lead} Ta prime de {festival} est là. Viens la partager.',
  'notify.close.bonus.roast':
    '{lead} Prime de {festival} arrivée. Range-la avant que les boutiques la repèrent.',
  'notify.close.bonus.plain': '{lead} Ta prime de {festival} attend d’être répartie.',

  'notify.close.payback.soft': '{lead} {name} t’a rendu l’argent.',
  'notify.close.payback.cheeky': '{lead} {name} t’a rendu l’argent. L’amitié est sauve.',
  'notify.close.payback.roast': '{lead} {name} t’a vraiment rendu l’argent.',
  'notify.close.payback.plain': '{lead} {name} a remboursé.',

  'notify.close.moneyIn.soft': '{lead} De l’argent est arrivé. Il attend la clôture.',
  'notify.close.moneyIn.cheeky': '{lead} De l’argent est arrivé. Viens lui dire où aller.',
  'notify.close.moneyIn.roast': '{lead} De l’argent est arrivé. Qu’il ne se fasse pas d’idées.',
  'notify.close.moneyIn.plain': '{lead} De l’argent est arrivé. Range-le à la clôture.',

  'notify.close.yearCard.soft': '{lead} Ton année {year} est prête à être revue.',
  'notify.close.yearCard.cheeky': '{lead} Ton année {year} est prête. Tu veux voir ?',
  'notify.close.yearCard.roast': '{lead} Ton année {year}, en entier. Tu oses regarder ?',
  'notify.close.yearCard.plain': '{lead} Le bilan de {year} est prêt.',

  'notify.payday.amounts.soft':
    'Jour de paie. {jars} dans tes bocaux, {daily} par jour jusqu’au {date}.',
  'notify.payday.amounts.cheeky':
    'Jour de paie ! {jars} dans tes bocaux, {daily} par jour jusqu’au {date}.',
  'notify.payday.amounts.roast':
    'Jour de paie. {jars} mis de côté en un clin d’œil, {daily} par jour jusqu’au {date}.',
  'notify.payday.amounts.plain':
    'Jour de paie. {jars} dans les bocaux, {daily} par jour jusqu’au {date}.',
  'notify.payday.noJars': 'Jour de paie. {daily} par jour jusqu’au {date}.',
  'notify.payday.hidden': 'Jour de paie. Tes bocaux sont remplis.',
  'notify.payday.hiddenNoJars': 'Jour de paie. Un nouveau mois commence.',

  'notify.firstCatch.amounts.soft':
    'Première dépense attrapée : {amount} · {name}. C’est tout ce qu’il faut.',
  'notify.firstCatch.amounts.cheeky':
    'Première dépense attrapée : {amount} · {name}. Facile, non ?',
  'notify.firstCatch.amounts.roast': 'Première dépense attrapée : {amount} · {name}. Même pas mal.',
  'notify.firstCatch.amounts.plain': 'Première dépense : {amount} · {name}.',
  'notify.firstCatch.hidden': 'Première dépense attrapée chez {name}. C’est tout ce qu’il faut.',
  'notify.firstCatch.noName': 'Première dépense attrapée. C’est tout ce qu’il faut.',

  'notify.quiet.soft':
    'Aucune nouvelle de {way} depuis {count} jours. L’automatisation est toujours activée ?',
  'notify.quiet.cheeky':
    'Aucune nouvelle de {way} depuis {count} jours. Très sage, ou l’automatisation est coupée ?',
  'notify.quiet.roast':
    'Aucune nouvelle de {way} depuis {count} jours. Soit tu es un ange, soit l’automatisation est coupée.',
  'notify.quiet.plain':
    'Aucune nouvelle de {way} depuis {count} jours. Vérifie que l’automatisation est activée.',
  'notify.quiet.yourAlerts': 'tes alertes bancaires',

  'notify.owed.one.soft': '{name} te doit encore {amount}. Demande quand ça t’arrange.',
  'notify.owed.one.cheeky': '{name} te doit encore {amount}. Un petit rappel amical ?',
  'notify.owed.one.roast': '{name} te doit encore {amount}. Ton argent s’ennuie de toi.',
  'notify.owed.one.plain': '{name} te doit encore {amount}.',
  'notify.owed.oneHidden': '{name} te doit encore de l’argent. Demande quand ça t’arrange.',
  'notify.owed.noName': 'On te doit encore {amount}.',
  'notify.owed.noNameHidden': 'Quelqu’un te doit encore de l’argent. Demande quand ça t’arrange.',
  'notify.owed.many': '{count} personnes te doivent encore {amount}.',
  'notify.owed.manyHidden': '{count} personnes te doivent encore de l’argent.',

  'settings.notifications': 'Notifications',
  'settings.notificationsOn': 'Activées',
  'notify.settings.title': 'Notifications',
  'notify.settings.phone': 'Sur ce téléphone',
  'notify.settings.allowed': 'Autorisées',
  'notify.settings.turnOn': 'Activer',
  'notify.settings.offInSettings': 'Coupées dans Réglages',
  'notify.settings.offSub': 'Rien ne t’arrive tant qu’elles sont coupées.',
  'notify.settings.kinds': 'Ce que 6pm envoie',
  'notify.kind.close': 'Rappel de clôture',
  'notify.kind.close.sub': 'Chaque jour à {time}, avec les nouvelles du jour',
  'notify.kind.payday': 'Jour de paie',
  'notify.kind.payday.sub': 'Le matin où ta paie tombe, à 08:30',
  'notify.kind.capture': 'Repérage des dépenses',
  'notify.kind.capture.sub': 'Ta première dépense attrapée, et un moyen devenu silencieux',
  'notify.kind.reminders': 'Tes rappels',
  'notify.kind.reminders.sub': 'Qui te doit de l’argent, le jour que tu choisis',
  'notify.settings.lockScreen': 'Écran verrouillé',
  'notify.settings.amounts': 'Montants sur l’écran verrouillé',
  'notify.settings.amounts.sub': 'Désactivé, les messages taisent les chiffres',
  'notify.settings.note':
    'Une par jour, c’est le rituel : le rappel de clôture apporte les nouvelles du jour. Au plus une autre par jour, et rien entre 22:00 et 08:00 à part ta clôture.',

  'owed.remind.button': 'Me le rappeler',
  'owed.remind.threeDays': 'Dans 3 jours',
  'owed.remind.week': 'Dans une semaine',
  'owed.remind.payday': 'Le jour de paie',
  'owed.remind.set': 'Rappel : {date}',
  'owed.remind.cancel': 'Ne pas me le rappeler',
  'owed.remind.toast': 'Je te le rappelle : {date}, 10:00.',
  'owed.remind.off': 'Tes rappels sont coupés dans Réglages.',
};
