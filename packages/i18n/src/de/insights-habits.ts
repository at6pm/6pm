import type { Entry } from '../catalogue-types';
import type { enInsightsHabits } from '../en-insights-habits';

// Same voice as the other companion lines: lead with the number, tease the habit, end with a wink.
// `{compare}` already carries its "als".
export const deInsightsHabits: { readonly [Key in keyof typeof enInsightsHabits]: Entry } = {
  'insight.noSpendDay.soft.1':
    'Ein Tag, der gar nichts gekostet hat: Die ganzen {kept} sind geblieben.',
  'insight.noSpendDay.soft.2': 'Ein Tag ohne Ausgaben. {kept} behalten, ganz leise und schön.',
  'insight.noSpendDay.cheeky.1': 'Null ausgegeben, {kept} unberührt. Der Geldbeutel hatte frei.',
  'insight.noSpendDay.cheeky.2': 'Ein ganzer Tag, nichts ausgegeben. {kept} sagt Danke.',
  'insight.noSpendDay.roast.1':
    'Nichts ausgegeben, {kept} unberührt. Wer bist du, und darfst du bleiben?',
  'insight.noSpendDay.roast.2': 'Keine einzige Ausgabe, {kept} behalten. Die Läden überleben das.',
  'insight.noSpendDay.plain':
    'Der letzte abgeschlossene Tag hatte keine Ausgaben; {kept} der Linie blieben übrig.',

  'insight.noSpendStreak.soft.1': '{days} ruhige Tage am Stück: {kept} unberührt.',
  'insight.noSpendStreak.soft.2': '{days} Tage ohne Ausgabe. {kept} ist bei dir geblieben.',
  'insight.noSpendStreak.cheeky.1': '{days} Tage, null Ausgaben. Der Geldbeutel wird misstrauisch.',
  'insight.noSpendStreak.cheeky.2':
    '{days} Tage ohne Ausgaben am Stück. {kept} macht gerade schön Urlaub.',
  'insight.noSpendStreak.roast.1':
    '{days} Tage, keine einzige Ausgabe. Dein Stammcafé macht sich langsam Sorgen.',
  'insight.noSpendStreak.roast.2':
    '{days} Tage ausgabenfrei, {kept} unberührt. Jetzt wird’s fast unheimlich.',
  'insight.noSpendStreak.plain':
    '{days} abgeschlossene Tage in Folge ohne Ausgaben; {kept} behalten.',

  'insight.backUnder.soft.1':
    'Nach einem Tag drüber wieder unter der Linie: {spare} übrig. Schön gemacht.',
  'insight.backUnder.soft.2':
    'Ein Tag drüber, dann ein Tag drunter mit {spare} übrig. Das ist der Rhythmus.',
  'insight.backUnder.cheeky.1': 'Comeback-Story: wieder drunter, {spare} übrig.',
  'insight.backUnder.cheeky.2':
    'Einen Tag drüber, den nächsten drunter mit {spare} übrig. Balance.',
  'insight.backUnder.roast.1':
    '{spare} drunter, direkt nach einem Tag drüber. Entschuldigung angenommen.',
  'insight.backUnder.roast.2':
    'Wieder drunter mit {spare} übrig. Das Comeback, auf das wir gewartet haben.',
  'insight.backUnder.plain': 'Nach einem Tag drüber wieder unter der Linie, mit {spare} übrig.',

  'insight.logGap.soft.1': 'Seit {since} nichts erfasst. Ruhige Phase oder volle?',
  'insight.logGap.soft.2': 'Seit {days} Tagen keine Ausgabe erfasst. Magst du was nachtragen?',
  'insight.logGap.cheeky.1': 'Seit {since} nichts erfasst. Mönchsmodus oder nur viel los?',
  'insight.logGap.cheeky.2': '{days} Tage, nichts erfasst. Ist der Geldbeutel im Urlaub?',
  'insight.logGap.roast.1': 'Nichts seit {since}. Wirklich nichts, oder nur nicht aufgeschrieben?',
  'insight.logGap.roast.2':
    '{days} Tage Funkstille. Auch ein Kaffee zählt; trag ihn ein, und wir sind quitt.',
  'insight.logGap.plain': 'Seit {since} keine Ausgaben erfasst.',

  'insight.weekendHeavy.soft.1':
    'Zuletzt kostet ein Wochenendtag etwa {weekend}, ein Werktag {weekday}. Vielleicht ein Gedanke vor Samstag.',
  'insight.weekendHeavy.soft.2':
    'Wochenenden lagen bei {weekend} pro Tag, Werktage bei {weekday}. Ganz entspannt.',
  'insight.weekendHeavy.cheeky.1':
    'Werktags: {weekday} pro Tag. Am Wochenende: {weekend}. Der Samstag hat Pläne mit dir.',
  'insight.weekendHeavy.cheeky.2':
    'Ein Wochenendtag kostet im Schnitt {weekend}, ein Werktag {weekday}. Das Wochenende kommt. Bereit?',
  'insight.weekendHeavy.roast.1':
    '{weekday} an einem Werktag, {weekend} an einem Wochenendtag. Das Wochenende gewinnt ständig; Unentschieden?',
  'insight.weekendHeavy.roast.2':
    'Wochenenden: {weekend} pro Tag. Werktage: {weekday}. Dieses Wochenende: Revanche?',
  'insight.weekendHeavy.plain':
    'In den letzten vier Wochen: {weekend} pro Wochenendtag, {weekday} pro Werktag.',

  'insight.recordDay.soft.1':
    'Heute {amount}, der größte Tag seit {days} Tagen. Ist okay; morgen geht’s neu los.',
  'insight.recordDay.soft.2':
    'Die {amount} von heute sind das meiste seit {days} Tagen. Der Plan fängt das auf.',
  'insight.recordDay.cheeky.1':
    'Heute {amount}. Ein neuer Höchststand, nur nicht in dem Chart, den wir wollten. Morgen geht’s neu los.',
  'insight.recordDay.cheeky.2':
    'Neuer Rekord: {amount}, der größte seit {days} Tagen. Bitte nicht nachlegen.',
  'insight.recordDay.roast.1':
    'Heute {amount}, der größte seit {days} Tagen. Mutig. Morgen eine kleinere Zugabe.',
  'insight.recordDay.roast.2':
    '{amount} an einem Tag, Rekord seit {days} Tagen. Einrahmen, dann durchatmen.',
  'insight.recordDay.plain':
    'Die {amount} von heute sind die höchsten Tagesausgaben der letzten {days} Tage.',

  'insight.likelySubscription.soft.1':
    '{merchant} hat jeden Monat etwa {amount} abgebucht. Als Fixkosten eintragen?',
  'insight.likelySubscription.soft.2':
    '{amount} an {merchant}, {months} Monate am Stück. Als Fixkosten eintragen?',
  'insight.likelySubscription.cheeky.1':
    'Wieder {merchant}, {amount}, wie ein Uhrwerk. Wir sehen dich, Abo. Als Fixkosten eintragen?',
  'insight.likelySubscription.cheeky.2':
    '{months} Monate {merchant} für {amount}. Nutzt du es noch? Trag es als Fixkosten ein.',
  'insight.likelySubscription.roast.1':
    '{merchant}: {amount}, {months} Monate in Folge. Nutzt du es noch oder zahlst du nur?',
  'insight.likelySubscription.roast.2':
    '{amount} an {merchant}, jeden Monat. Behalten? Dann als Fixkosten eintragen. Sonst kündigen.',
  'insight.likelySubscription.plain':
    '{merchant} hat {months} Monate lang etwa {amount} im Monat abgebucht. Das könnten Fixkosten sein.',

  'insight.lateNight.soft.1':
    'Spät in der Nacht {amount} bei {merchant}. Hoffentlich hat’s geholfen.',
  'insight.lateNight.soft.2': '{merchant}, {amount}, nach Einbruch der Dunkelheit. Schlaf gut.',
  'insight.lateNight.cheeky.1':
    '{amount} bei {merchant}, weit nach Schlafenszeit. Shoppen für Nachteulen.',
  'insight.lateNight.cheeky.2': '{merchant} spät nachts, {amount}. Klassiker.',
  'insight.lateNight.roast.1':
    '{amount} bei {merchant} in den frühen Stunden. Große Entscheidungen trifft man besser bei Tageslicht.',
  'insight.lateNight.roast.2':
    '{merchant} bei Nacht, {amount}. Nächstes Mal den Warenkorb erst mal überschlafen.',
  'insight.lateNight.plain': 'Eine Ausgabe spät in der Nacht: {amount} bei {merchant}.',

  'insight.cycleHalfway.soft.1': 'Halbzeit im Zyklus: {percent} % verbraucht, {left} übrig.',
  'insight.cycleHalfway.soft.2':
    'Der halbe Zyklus ist um, {left} noch frei. Du behältst den Überblick, und das ist das Schwerste.',
  'insight.cycleHalfway.cheeky.1':
    'Halbzeit. Spielstand: {percent} % verbraucht, {left} zum Spielen.',
  'insight.cycleHalfway.cheeky.2': 'Halbzeit. {left} übrig für die zweite Hälfte.',
  'insight.cycleHalfway.roast.1':
    'Halbzeit: {percent} % verbraucht. {left} für die zweite Hälfte; spiel sie gut.',
  'insight.cycleHalfway.roast.2':
    'Halbzeit, {percent} % weg, {left} übrig. Die zweite Hälfte entscheidet.',
  'insight.cycleHalfway.plain': 'Halbzeit im Zyklus: {percent} % verbraucht, {left} übrig.',

  'insight.firstWeekPaceUp.soft.1':
    'Die erste Woche hat {percent} % des Zyklus verbraucht; gleichmäßig wären {even} %. Die nächsten Wochen gleichen das aus.',
  'insight.firstWeekPaceUp.soft.2':
    'Eine volle erste Woche: {percent} % des Geldes im Zyklus. Ruhige Tage holen das zurück.',
  'insight.firstWeekPaceUp.cheeky.1':
    'Erste Woche: {percent} % weg, gleichmäßig wären {even} %. Starker Start. Vielleicht zu stark.',
  'insight.firstWeekPaceUp.cheeky.2':
    'Woche eins hat {percent} % genommen. Gleichmäßig wären {even} %. Tempo raus.',
  'insight.firstWeekPaceUp.roast.1':
    'Woche eins hat {percent} % des Zyklus verputzt. Gleichmäßig sind {even} %. Die anderen Wochen möchten kurz reden.',
  'insight.firstWeekPaceUp.roast.2':
    '{percent} % in einer Woche, gleichmäßig wären {even} %. Das war der Sprint; jetzt locker joggen.',
  'insight.firstWeekPaceUp.plain':
    'Die erste Woche hat {percent} % des Geldes im Zyklus verbraucht; gleichmäßig wären {even} %.',

  'insight.firstWeekPaceDown.soft.1':
    'Die erste Woche hat nur {percent} % des Zyklus verbraucht; gleichmäßig wären {even} %. Schöner Start.',
  'insight.firstWeekPaceDown.soft.2':
    'Eine sanfte erste Woche: {percent} % verbraucht, {compare} bei gleichmäßigem Tempo.',
  'insight.firstWeekPaceDown.cheeky.1':
    'Erste Woche: nur {percent} %, unter den gleichmäßigen {even} %. Geschmeidiger Start.',
  'insight.firstWeekPaceDown.cheeky.2':
    'Woche eins: {percent} %. Gleichmäßig wären {even} %. Sieh mal an.',
  'insight.firstWeekPaceDown.roast.1':
    'Woche eins hat {percent} % verbraucht, unter den gleichmäßigen {even} %. Verdächtig gut. Beibehalten.',
  'insight.firstWeekPaceDown.roast.2':
    '{percent} % in der ersten Woche, gleichmäßig wären {even} %. Keine Anmerkungen.',
  'insight.firstWeekPaceDown.plain':
    'Die erste Woche hat {percent} % des Geldes im Zyklus verbraucht; gleichmäßig wären {even} %.',

  'insight.paceSpare.soft.1': 'In diesem Tempo bleiben zum Zahltag ({payday}) etwa {spare} übrig.',
  'insight.paceSpare.soft.2':
    'Wenn das so bleibt, erreichst du den {payday} mit etwa {spare} übrig.',
  'insight.paceSpare.cheeky.1':
    'Prognose für den {payday}: {spare} übrig. Nicht schon im Kopf ausgeben.',
  'insight.paceSpare.cheeky.2': 'In diesem Tempo {spare} übrig bis zum {payday}. Schön.',
  'insight.paceSpare.roast.1':
    '{spare} übrig bis zum {payday} in diesem Tempo. Gib es nicht aus, bevor es existiert.',
  'insight.paceSpare.roast.2': 'Prognose: {spare} übrig am {payday}. Sorg dafür, dass sie stimmt.',
  'insight.paceSpare.plain':
    'Beim bisherigen Tempo bleiben am Zahltag, dem {payday}, etwa {spare} übrig.',

  'insight.paceShort.soft.1':
    'In diesem Tempo wird es um den {runsOut} knapp, vor dem Zahltag ({payday}). Ein paar kleinere Tage richten das.',
  'insight.paceShort.soft.2':
    'Kurz vorab: In diesem Tempo wird es um den {runsOut} knapp. Kleinere Tage helfen, und es ist noch Zeit.',
  'insight.paceShort.cheeky.1':
    'Auf dieser Route ist um den {runsOut} der Tank leer; Zahltag ist am {payday}. Route neu berechnen?',
  'insight.paceShort.cheeky.2':
    'In diesem Tempo ist das Geld um den {runsOut} alle. Zahltag ist am {payday}. Sanfte Tage voraus.',
  'insight.paceShort.roast.1':
    'In diesem Tempo ist um den {runsOut} Schluss, und Zahltag ist am {payday}. Ein paar ruhige Tage, und es passt.',
  'insight.paceShort.roast.2':
    '{runsOut}: Da ist in diesem Tempo das Geld alle. {payday}: Zahltag. Schließen wir die Lücke.',
  'insight.paceShort.plain':
    'Beim bisherigen Tempo ist das Geld um den {runsOut} aufgebraucht, vor dem Zahltag am {payday}.',
};
