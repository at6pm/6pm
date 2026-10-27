import type { Entry } from '../catalogue-types';
import type { enInsights } from '../en-insights';

// The companion says "ich" and "du", texting-casual. The day's line is "die Linie"; `{compare}`
// carries its own "als"/"wie", so the lines around it never add one.
export const deInsights: { readonly [Key in keyof typeof enInsights]: Entry } = {
  'insight.compare.muchMore': 'deutlich mehr als',
  'insight.compare.more': 'mehr als',
  'insight.compare.about': 'etwa so viel wie',
  'insight.compare.less': 'weniger als',
  'insight.compare.muchLess': 'deutlich weniger als',

  'insight.todayOver.soft.1': 'Heute {over} drüber. Halb so wild: Morgen gibt’s {tomorrow}.',
  'insight.todayOver.soft.2':
    'Ein größerer Tag, {over} drüber. Der Plan gibt nach: Morgen sind es {tomorrow}.',
  'insight.todayOver.cheeky.1': 'Heute {over} drüber. Morgen gibt’s {tomorrow}, ganz frisch.',
  'insight.todayOver.cheeky.2':
    'Heute {over} über der Linie. Plot-Twist: Morgen sind es {tomorrow}.',
  'insight.todayOver.roast.1':
    '{over} drüber. Die Linie hat sich gewehrt. Morgen {tomorrow}, schön sachte.',
  'insight.todayOver.roast.2':
    'Die Linie sagte Nein, der Tag sagte {over} mehr. Morgen {tomorrow}, Runde zwei.',
  'insight.todayOver.plain': 'Heute {over} über der Linie. Die Linie für morgen: {tomorrow}.',

  'insight.todayUnder.soft.1': 'Bisher {spent}, noch {safe} drin. Schön gleichmäßig.',
  'insight.todayUnder.soft.2': 'Heute noch {safe} Luft. Du machst das gut.',
  'insight.todayUnder.cheeky.1': 'Noch {safe} für heute. Klug ausgeben oder behalten – deine Wahl.',
  'insight.todayUnder.cheeky.2': '{spent} weg, {safe} übrig. Läuft.',
  'insight.todayUnder.roast.1':
    'Erst {spent}? Der Geldbeutel ist verwirrt, im guten Sinn. Noch {safe} drin.',
  'insight.todayUnder.roast.2': 'Noch {safe} drin. Fast verdächtig. Weiter so.',
  'insight.todayUnder.plain': 'Heute {spent} ausgegeben, noch {safe} verfügbar.',

  'insight.noSpendYet.soft.1': 'Noch nichts ausgegeben. Die ganzen {line} gehören heute dir.',
  'insight.noSpendYet.soft.2': 'Ein leeres Blatt: {line} für heute.',
  'insight.noSpendYet.cheeky.1': '{line} für heute und noch kein Kratzer dran. Noch.',
  'insight.noSpendYet.cheeky.2': 'Volle {line} heute, unangetastet. Vorerst.',
  'insight.noSpendYet.roast.1': 'Noch nichts ausgegeben. {line} wartet ab, was du vorhast.',
  'insight.noSpendYet.roast.2': '{line} liegt da, unberührt. Verdächtig. Weitermachen.',
  'insight.noSpendYet.plain': 'Noch nichts ausgegeben. Die Linie heute: {line}.',

  'insight.waitingTonight.soft.1': {
    one: 'Eine Ausgabe ({amount}) wartet auf heute Abend. Eine Minute, höchstens.',
    other: '{count} Ausgaben ({amount}) warten auf heute Abend. Eine Minute, höchstens.',
  },
  'insight.waitingTonight.soft.2': {
    one: 'Heute Abend eine Ausgabe durchsehen: {amount}.',
    other: 'Heute Abend {count} Ausgaben durchsehen, {amount} insgesamt.',
  },
  'insight.waitingTonight.cheeky.1': {
    one: 'Eine Ausgabe ({amount}) wartet heute Abend auf ihr Urteil.',
    other: '{count} Ausgaben ({amount}) warten heute Abend auf ihr Urteil.',
  },
  'insight.waitingTonight.cheeky.2': {
    one: 'Tagesabschluss heute: eine Ausgabe, {amount}. Locker.',
    other: 'Tagesabschluss heute: {count} Ausgaben, {amount}. Locker.',
  },
  'insight.waitingTonight.roast.1': {
    one: '{amount} wartet. Erledigt sich nicht von allein, aber eine Minute reicht.',
    other:
      '{count} Ausgaben, {amount}, warten. Die erledigen sich nicht von allein – eine Minute reicht.',
  },
  'insight.waitingTonight.roast.2': {
    one: '{amount} wartet darauf, dass du sagst: „Jep, das war ich.“',
    other: '{count} Ausgaben, {amount}, warten darauf, dass du sagst: „Jep, das war ich.“',
  },
  'insight.waitingTonight.plain': {
    one: 'Eine Ausgabe ({amount}) wartet auf den Tagesabschluss heute Abend.',
    other: '{count} Ausgaben ({amount}) warten auf den Tagesabschluss heute Abend.',
  },

  'insight.paydaySoon.soft.1': {
    one: 'Morgen ist Zahltag. Du hast es geschafft.',
    other: 'In {count} Tagen ist Zahltag. Fast geschafft.',
  },
  'insight.paydaySoon.soft.2': {
    one: 'Noch ein Tag bis zum Zahltag. Stolz auf diesen Monat.',
    other: 'Noch {count} Tage bis zum Zahltag am {payday}. Halte durch.',
  },
  'insight.paydaySoon.cheeky.1': {
    one: 'Morgen ist Zahltag. Bitte keine Jacht kaufen.',
    other: 'In {count} Tagen ist Zahltag. Ich kann ihn schon riechen.',
  },
  'insight.paydaySoon.cheeky.2': {
    one: 'Morgen ist Zahltag. Ganz unauffällig bleiben.',
    other: 'Noch {count}-mal schlafen bis Zahltag.',
  },
  'insight.paydaySoon.roast.1': {
    one: 'Morgen ist Zahltag. Der Geldbeutel hat überlebt.',
    other: 'Noch {count} Tage bis Zahltag. Halte die Stellung.',
  },
  'insight.paydaySoon.roast.2': {
    one: 'Ein Tag. Einen Tag hältst du alles aus.',
    other: 'Zahltag ist am {payday}. Bis dahin bleibt der Geldbeutel zu.',
  },
  'insight.paydaySoon.plain': {
    one: 'Morgen ist Zahltag.',
    other: 'Zahltag ist in {count} Tagen, am {payday}.',
  },

  'insight.billDueToday.soft.1': '{bill} ({amount}) ist heute fällig.',
  'insight.billDueToday.soft.2': 'Kurz zur Info: {bill}, {amount}, ist heute fällig.',
  'insight.billDueToday.cheeky.1': '{bill} will heute {amount} sehen.',
  'insight.billDueToday.cheeky.2': 'Gaststar des Tages: {bill}, {amount}.',
  'insight.billDueToday.roast.1': '{bill} ist heute fällig. Und wartet nicht.',
  'insight.billDueToday.roast.2': '{amount} für {bill}, heute. Nicht ghosten.',
  'insight.billDueToday.plain': '{bill} ({amount}) ist heute fällig.',

  'insight.billDue.soft.1': {
    one: '{bill} ({amount}) ist morgen fällig.',
    other: '{bill} ({amount}) ist in {count} Tagen fällig.',
  },
  'insight.billDue.soft.2': {
    one: 'Kurz vorab: {bill}, {amount}, morgen.',
    other: 'Kurz vorab: {bill}, {amount}, in {count} Tagen.',
  },
  'insight.billDue.cheeky.1': {
    one: '{bill} holt sich morgen {amount}.',
    other: '{bill} holt sich in {count} Tagen {amount}.',
  },
  'insight.billDue.cheeky.2': {
    one: 'Morgen: {bill}, {amount}. Vormerken.',
    other: 'In {count} Tagen: {bill}, {amount}. Vormerken.',
  },
  'insight.billDue.roast.1': {
    one: '{bill} will morgen {amount}. Wie immer.',
    other: '{bill} will in {count} Tagen {amount}. Wie immer.',
  },
  'insight.billDue.roast.2': {
    one: '{amount} für {bill}, morgen. Tu nicht so überrascht.',
    other: '{amount} für {bill} in {count} Tagen. Tu nicht so überrascht.',
  },
  'insight.billDue.plain': {
    one: '{bill} ({amount}) ist morgen fällig.',
    other: '{bill} ({amount}) ist in {count} Tagen fällig.',
  },

  'insight.categoryPaceUp.soft.1':
    '{category} liegt diesen Zyklus bei {now}, {compare} zum selben Zeitpunkt letztes Mal.',
  'insight.categoryPaceUp.soft.2':
    '{category} ist schneller unterwegs: bisher {now}, im letzten Zyklus {before}.',
  'insight.categoryPaceUp.cheeky.1':
    '{category}: schon {now}. Letzten Zyklus warst du bei {before}. Hmm.',
  'insight.categoryPaceUp.cheeky.2': '{category} hat gerade einen Lauf: {now} statt {before}.',
  'insight.categoryPaceUp.roast.1':
    '{category} bei {now}. Letzter Zyklus: {before}. Ich seh’s. Eine ruhige Woche gleicht das aus.',
  'insight.categoryPaceUp.roast.2':
    'Schon {now} für {category}; letztes Mal waren es {before}. Nur so, mit Liebe.',
  'insight.categoryPaceUp.plain':
    '{category}: {now} in diesem Zyklus, {before} zum selben Zeitpunkt im letzten.',

  'insight.categoryPaceDown.soft.1':
    '{category} ist runter auf {now}, nach {before} im letzten Zyklus. Schön.',
  'insight.categoryPaceDown.soft.2':
    '{category}: {compare} im letzten Zyklus, {now} statt {before}.',
  'insight.categoryPaceDown.cheeky.1': '{category}: {now}, runter von {before}. Schau dich an.',
  'insight.categoryPaceDown.cheeky.2': '{category} macht Diät: {now} statt {before}.',
  'insight.categoryPaceDown.roast.1':
    '{category} nur {now}? Es waren {before}. Diese Version bitte behalten.',
  'insight.categoryPaceDown.roast.2':
    '{now} für {category}, runter von {before}. Charakterentwicklung.',
  'insight.categoryPaceDown.plain':
    '{category}: {now} in diesem Zyklus, {before} zum selben Zeitpunkt im letzten.',

  'insight.repeatMerchant.soft.1': '{merchant}, {visits}-mal diese Woche. Die müssen dich lieben.',
  'insight.repeatMerchant.soft.2':
    '{visits} Besuche bei {merchant} seit Montag, {amount} insgesamt.',
  'insight.repeatMerchant.cheeky.1':
    'Schon wieder {merchant}? Das ist Nummer {visits} seit Montag.',
  'insight.repeatMerchant.cheeky.2': 'Du und {merchant}: {visits} Dates diese Woche, {amount}.',
  'insight.repeatMerchant.roast.1':
    '{merchant}, Besuch Nummer {visits}. Kennen die schon deinen Namen?',
  'insight.repeatMerchant.roast.2':
    '{amount} bei {merchant} diese Woche. {visits} Besuche. Ein Lebensstil.',
  'insight.repeatMerchant.plain': '{merchant}: {visits} Besuche diese Woche, {amount}.',

  'insight.firstTimeMerchant.soft.1': 'Zum ersten Mal bei {merchant}. Hoffentlich war’s gut.',
  'insight.firstTimeMerchant.soft.2': 'Mal was Neues: {merchant}, {amount}.',
  'insight.firstTimeMerchant.cheeky.1': '{merchant}? Neuer Laden. Abenteuerlustig.',
  'insight.firstTimeMerchant.cheeky.2': 'Oh, {merchant}. Das ist mir neu.',
  'insight.firstTimeMerchant.roast.1': '{merchant}. Neuer Laden, gleicher Geldbeutel.',
  'insight.firstTimeMerchant.roast.2':
    'Erster Besuch bei {merchant}. Mach keine Gewohnheit draus. Oder doch.',
  'insight.firstTimeMerchant.plain': 'Erste Ausgabe bei {merchant}: {amount}.',

  'insight.biggestSpend.soft.1': 'Der große Posten der Woche: {amount} bei {merchant}.',
  'insight.biggestSpend.soft.2':
    '{merchant}, {amount}: der größte diese Woche. Der Plan fängt das auf.',
  'insight.biggestSpend.cheeky.1': 'Headliner der Woche: {merchant}, {amount}.',
  'insight.biggestSpend.cheeky.2': '{amount} bei {merchant}. Gönn dir, offenbar.',
  'insight.biggestSpend.roast.1': '{amount} bei {merchant}. Die Hauptfigur der Woche.',
  'insight.biggestSpend.roast.2':
    '{merchant} hat diese Woche {amount} bekommen. Hat sich’s gelohnt? Nicht antworten. Der Plan fängt das auf.',
  'insight.biggestSpend.plain': 'Größte Ausgabe diese Woche: {amount} bei {merchant}.',

  'insight.underStreak.soft.1': '{days} Tage am Stück unter der Linie. So beständig.',
  'insight.underStreak.soft.2': '{days} ruhige Tage hintereinander.',
  'insight.underStreak.cheeky.1': '{days} Tage unter der Linie. Die Serie lebt.',
  'insight.underStreak.cheeky.2': 'Seit {days} Tagen unter der Linie. Bloß nicht verschreien.',
  'insight.underStreak.roast.1':
    '{days} Tage unter der Linie. Ich hatte Witze vorbereitet. Umsonst.',
  'insight.underStreak.roast.2': '{days} Tage am Stück. Mir gehen die Witze aus.',
  'insight.underStreak.plain': '{days} abgeschlossene Tage in Folge auf oder unter der Linie.',

  'insight.closeStreak.soft.1': '{days} Tage in Folge abgeschlossen. Das ist das Ritual.',
  'insight.closeStreak.soft.2': '{days} Tagesabschlüsse am Stück. Danke, dass du dranbleibst.',
  'insight.closeStreak.cheeky.1': '{days} Abschlüsse am Stück. Gewohnheit freigeschaltet.',
  'insight.closeStreak.cheeky.2': 'Serie: {days}. Heute Abend wird sie länger.',
  'insight.closeStreak.roast.1': '{days} Tage am Stück. Die Serie steht dir; reiß sie nicht ab.',
  'insight.closeStreak.roast.2': '{days} Abschlüsse in Folge. Jetzt bloß nicht schlappmachen.',
  'insight.closeStreak.plain': '{days} Tage in Folge abgeschlossen.',

  'insight.weekSpare.soft.1': {
    one: 'Diese Woche sind {spare} übrig geblieben. Das wandert in die kommenden Tage.',
    other: '{count} Tage unter der Linie diese Woche: {spare} wandert weiter.',
  },
  'insight.weekSpare.soft.2': {
    one: '{spare} übrig diese Woche, wird mitgenommen.',
    other: '{spare} übrig diese Woche, wird mitgenommen.',
  },
  'insight.weekSpare.cheeky.1': {
    one: '{spare} übrig diese Woche. Die kommenden Tage sagen Danke.',
    other: '{spare} übrig aus {count} guten Tagen. Die kommenden Tage sagen Danke.',
  },
  'insight.weekSpare.cheeky.2': {
    one: 'Die Woche liegt {spare} vorn. Läuft.',
    other: 'Die Woche liegt {spare} vorn. Läuft.',
  },
  'insight.weekSpare.roast.1': {
    one: '{spare} übrig. Nicht alles auf einmal ausgeben.',
    other: '{count} Tage drunter, {spare} übrig. Nicht alles auf einmal ausgeben.',
  },
  'insight.weekSpare.roast.2': {
    one: 'Die Woche ist {spare} im Plus. Lass ich gelten.',
    other: 'Die Woche ist {spare} im Plus. Lass ich gelten.',
  },
  'insight.weekSpare.plain': {
    one: 'Die abgeschlossenen Tage dieser Woche haben {spare} übrig gelassen.',
    other: 'Die abgeschlossenen Tage dieser Woche haben {spare} übrig gelassen.',
  },

  'insight.weekOver.soft.1':
    'Diese Woche lag {over} drüber. Die nächsten Tage werden etwas kleiner, und das ist okay.',
  'insight.weekOver.soft.2': '{over} drüber diese Woche. Das glätten wir.',
  'insight.weekOver.cheeky.1': 'Die Woche ist {over} drüber. Der Rest des Monats passt sich an.',
  'insight.weekOver.cheeky.2': 'Bisher {over} drüber. Plot-Twist, nicht das Ende.',
  'insight.weekOver.roast.1':
    'Diese Woche: {over} drüber. Eine ruhigere nächste Woche, und der Monat steckt das weg.',
  'insight.weekOver.roast.2': '{over} drüber. Eine Woche zum Vergessen, ein Monat zum Ausbügeln.',
  'insight.weekOver.plain': 'Die abgeschlossenen Tage dieser Woche lagen {over} über der Linie.',

  'insight.potMilestone.soft.1': '{pot} hat {percent} % geknackt. Schau, wie’s wächst.',
  'insight.potMilestone.soft.2': '{percent} % auf dem Weg zu {pot}.',
  'insight.potMilestone.cheeky.1': '{pot}: {percent} % geschafft. Es wird wirklich was.',
  'insight.potMilestone.cheeky.2': '{percent} % von {pot}, erledigt. Weiter füttern.',
  'insight.potMilestone.roast.1': '{pot} bei {percent} %. Der Spartopf gewinnt. Lass ihn.',
  'insight.potMilestone.roast.2': '{percent} % für {pot}. Finger weg vom Spartopf.',
  'insight.potMilestone.plain': '{pot} hat {percent} % des Ziels überschritten.',

  'insight.potFull.soft.1': '{pot} ist voll. Das warst du.',
  'insight.potFull.soft.2': '{pot}: geschafft. Genieß es, wirklich.',
  'insight.potFull.cheeky.1': '{pot} ist voll! Konfetti, aber leise.',
  'insight.potFull.cheeky.2': '{pot}, randvoll.',
  'insight.potFull.roast.1':
    '{pot} ist voll. Ich hatte einen Witz parat; du hast ihn nicht gebraucht.',
  'insight.potFull.roast.2': 'Voller Spartopf: {pot}. Jetzt gönn dir das, wofür er da war.',
  'insight.potFull.plain': '{pot}: Ziel erreicht.',

  'insight.workToClaim.soft.1': {
    one: 'Eine Arbeitsausgabe ({amount}) kannst du dir erstatten lassen.',
    other: '{count} Arbeitsausgaben ({amount}) kannst du dir erstatten lassen.',
  },
  'insight.workToClaim.soft.2': {
    one: '{amount} für die Arbeit wartet auf die Erstattung.',
    other: '{amount} für die Arbeit, {count} Ausgaben, wartet auf die Erstattung.',
  },
  'insight.workToClaim.cheeky.1': {
    one: 'Die Arbeit schuldet dir {amount}.',
    other: 'Die Arbeit schuldet dir {amount}, verteilt auf {count} Belege.',
  },
  'insight.workToClaim.cheeky.2': {
    one: '{amount} an Arbeitsausgaben. Hol’s dir.',
    other: '{count} Arbeitsausgaben, {amount}. Hol’s dir.',
  },
  'insight.workToClaim.roast.1': {
    one: '{amount} schuldet dir deine Firma. Nur nicht schüchtern.',
    other: '{amount} schuldet dir deine Firma. {count}-mal. Nur nicht schüchtern.',
  },
  'insight.workToClaim.roast.2': {
    one: 'Du finanzierst deine Arbeit mit {amount}. Reich’s ein.',
    other: 'Du finanzierst deine Arbeit mit {amount}. Reich’s ein.',
  },
  'insight.workToClaim.plain': {
    one: 'Eine Arbeitsausgabe ({amount}) wartet auf Erstattung.',
    other: '{count} Arbeitsausgaben ({amount}) warten auf Erstattung.',
  },
};
