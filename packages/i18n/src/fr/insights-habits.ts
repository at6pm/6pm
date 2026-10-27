import type { Entry } from '../catalogue-types';
import type { enInsightsHabits } from '../en-insights-habits';

// Same voice as the other insight lines: "je" and "tu", one wink per line at most. Dates arrive as
// "9 octobre", so they take "le".
export const frInsightsHabits: { readonly [Key in keyof typeof enInsightsHabits]: Entry } = {
  'insight.noSpendDay.soft.1':
    'Une journée qui n’a rien coûté du tout : tes {kept} sont restés là.',
  'insight.noSpendDay.soft.2': 'Une journée sans dépense. {kept} gardés, tout en douceur.',
  'insight.noSpendDay.cheeky.1': 'Zéro dépense, {kept} intacts. Le portefeuille était en congé.',
  'insight.noSpendDay.cheeky.2': 'Une journée entière sans rien dépenser. {kept} te disent merci.',
  'insight.noSpendDay.roast.1':
    'Rien dépensé, {kept} intacts. C’est qui, cette personne, et elle peut rester ?',
  'insight.noSpendDay.roast.2': 'Pas une seule dépense, {kept} gardés. Les magasins survivront.',
  'insight.noSpendDay.plain':
    'Aucune dépense le dernier jour clôturé ; {kept} de son chiffre du jour gardés.',

  'insight.noSpendStreak.soft.1': '{days} jours calmes d’affilée : {kept} laissés intacts.',
  'insight.noSpendStreak.soft.2': '{days} jours sans dépense. {kept} sont restés avec toi.',
  'insight.noSpendStreak.cheeky.1':
    '{days} jours, zéro dépense. Le portefeuille commence à se méfier.',
  'insight.noSpendStreak.cheeky.2':
    '{days} jours sans dépense d’affilée. {kept} se reposent tranquillement.',
  'insight.noSpendStreak.roast.1': '{days} jours sans une dépense. Ton café habituel s’inquiète.',
  'insight.noSpendStreak.roast.2':
    '{days} jours sans dépenser, {kept} intacts. On reste normal, hein.',
  'insight.noSpendStreak.plain': '{days} jours clôturés d’affilée sans dépense ; {kept} gardés.',

  'insight.backUnder.soft.1':
    'De nouveau sous la barre après un jour au-dessus : {spare} d’avance. Bien joué.',
  'insight.backUnder.soft.2':
    'Un jour au-dessus, puis un jour en dessous avec {spare} de reste. C’est ça, le rythme.',
  'insight.backUnder.cheeky.1': 'L’arc de la rédemption : retour sous la barre, {spare} d’avance.',
  'insight.backUnder.cheeky.2':
    'Au-dessus un jour, en dessous le lendemain avec {spare} de reste. L’équilibre.',
  'insight.backUnder.roast.1':
    '{spare} sous la barre, juste après un jour au-dessus. Excuses acceptées.',
  'insight.backUnder.roast.2':
    'Retour sous la barre avec {spare} de reste. Le come-back qu’on attendait.',
  'insight.backUnder.plain':
    'De nouveau sous le chiffre du jour après un dépassement, avec {spare} de reste.',

  'insight.logGap.soft.1': 'Rien de noté depuis le {since}. Une période calme, ou chargée ?',
  'insight.logGap.soft.2': 'Ça fait {days} jours sans dépense notée. Quelque chose à ajouter ?',
  'insight.logGap.cheeky.1': 'Rien de noté depuis le {since}. Mode moine, ou grosse semaine ?',
  'insight.logGap.cheeky.2': '{days} jours, rien de noté. Le portefeuille est parti en vacances ?',
  'insight.logGap.roast.1': 'Rien depuis le {since}. Vraiment rien, ou juste rien de noté ?',
  'insight.logGap.roast.2':
    '{days} jours de silence. Même un café compte ; ajoute-le et on est quittes.',
  'insight.logGap.plain': 'Aucune dépense notée depuis le {since}.',

  'insight.weekendHeavy.soft.1':
    'Ces derniers temps, un jour de week-end tourne autour de {weekend}, un jour de semaine {weekday}. À garder en tête avant samedi.',
  'insight.weekendHeavy.soft.2':
    'Le week-end, c’est {weekend} par jour ; en semaine, {weekday}. Tranquillement.',
  'insight.weekendHeavy.cheeky.1':
    'En semaine : {weekday} par jour. Le week-end : {weekend}. Samedi a des projets pour toi.',
  'insight.weekendHeavy.cheeky.2':
    'Un jour de week-end, c’est {weekend} en moyenne, un jour de semaine {weekday}. Le week-end arrive. On se prépare ?',
  'insight.weekendHeavy.roast.1':
    '{weekday} un jour de semaine, {weekend} un jour de week-end. Le week-end gagne toujours ; on signe le match nul ?',
  'insight.weekendHeavy.roast.2':
    'Le week-end : {weekend} par jour. En semaine : {weekday}. Ce week-end, revanche ?',
  'insight.weekendHeavy.plain':
    'Sur les quatre dernières semaines : {weekend} par jour de week-end, {weekday} par jour de semaine.',

  'insight.recordDay.soft.1':
    '{amount} aujourd’hui, la plus grosse journée sur {days} jours. Pas grave ; demain, on repart à zéro.',
  'insight.recordDay.soft.2':
    '{amount} aujourd’hui : le plus haut sur {days} jours. Le plan s’adapte.',
  'insight.recordDay.cheeky.1':
    '{amount} aujourd’hui. Un nouveau sommet, juste pas sur le bon graphique. Demain, on repart à zéro.',
  'insight.recordDay.cheeky.2':
    'Nouveau record : {amount}, le plus gros sur {days} jours. On évite le doublé.',
  'insight.recordDay.roast.1':
    '{amount} aujourd’hui, le plus gros sur {days} jours. Audacieux. Demain, un rappel plus discret.',
  'insight.recordDay.roast.2':
    '{amount} en une journée, record sur {days} jours. Encadre-le, puis repos.',
  'insight.recordDay.plain':
    'Aujourd’hui, {amount} : le plus dépensé en un jour sur les {days} derniers jours.',

  'insight.likelySubscription.soft.1':
    '{merchant} prélève environ {amount} chaque mois. On en fait une facture ?',
  'insight.likelySubscription.soft.2':
    '{amount} pour {merchant}, {months} mois de suite. Tu veux l’ajouter en facture ?',
  'insight.likelySubscription.cheeky.1':
    'Encore {merchant}, {amount}, réglé comme une horloge. On t’a vu, l’abonnement. On en fait une facture ?',
  'insight.likelySubscription.cheeky.2':
    '{months} mois de {merchant} à {amount}. Tu t’en sers encore ? Ajoute-le en facture.',
  'insight.likelySubscription.roast.1':
    '{merchant} : {amount}, {months} mois d’affilée. Tu t’en sers encore, ou tu paies juste ?',
  'insight.likelySubscription.roast.2':
    '{amount} pour {merchant} chaque mois. Tu le gardes ? Fais-en une facture. Sinon, résilie.',
  'insight.likelySubscription.plain':
    '{merchant} prélève environ {amount} par mois depuis {months} mois. Ça pourrait être une facture.',

  'insight.lateNight.soft.1':
    'Une dépense de {amount} tard le soir chez {merchant}. J’espère que ça a aidé.',
  'insight.lateNight.soft.2': '{merchant}, {amount}, à la nuit tombée. Dors bien.',
  'insight.lateNight.cheeky.1':
    '{amount} chez {merchant}, bien après l’heure du coucher. Shopping de noctambule.',
  'insight.lateNight.cheeky.2': '{merchant} en pleine nuit, {amount}. Un classique.',
  'insight.lateNight.roast.1':
    '{amount} chez {merchant} au beau milieu de la nuit. Les grandes décisions se prennent mieux en plein jour.',
  'insight.lateNight.roast.2':
    '{merchant} la nuit, {amount}. La nuit porte conseil : laisse le panier dormir aussi.',
  'insight.lateNight.plain': 'Une dépense tard le soir : {amount} chez {merchant}.',

  'insight.cycleHalfway.soft.1': 'Mi-parcours du cycle : {percent} % utilisés, {left} restants.',
  'insight.cycleHalfway.soft.2':
    'La moitié du cycle est passée, {left} encore libres. Tu suis tes comptes, et c’est le plus dur.',
  'insight.cycleHalfway.cheeky.1':
    'Mi-temps. Tableau d’affichage : {percent} % utilisés, {left} pour jouer.',
  'insight.cycleHalfway.cheeky.2': 'À mi-chemin. {left} pour la seconde moitié.',
  'insight.cycleHalfway.roast.1':
    'Mi-temps : {percent} % utilisés. {left} pour la seconde période ; joue-la bien.',
  'insight.cycleHalfway.roast.2':
    'À mi-chemin, {percent} % partis, {left} restants. Tout se joue en seconde période.',
  'insight.cycleHalfway.plain': 'Moitié du cycle : {percent} % utilisés, {left} restants.',

  'insight.firstWeekPaceUp.soft.1':
    'La première semaine a utilisé {percent} % du cycle ; un rythme régulier, c’est {even} %. Les semaines à venir peuvent rééquilibrer.',
  'insight.firstWeekPaceUp.soft.2':
    'Une première semaine chargée : {percent} % de l’argent du cycle. Quelques jours tranquilles, et ça revient.',
  'insight.firstWeekPaceUp.cheeky.1':
    'Première semaine : {percent} % partis, contre {even} % pour un rythme régulier. Gros départ. Peut-être trop.',
  'insight.firstWeekPaceUp.cheeky.2':
    'La semaine 1 a pris {percent} %. Le rythme régulier : {even} %. Doucement.',
  'insight.firstWeekPaceUp.roast.1':
    'La semaine 1 a avalé {percent} % du cycle. Le rythme régulier, c’est {even} %. Les autres semaines aimeraient te parler.',
  'insight.firstWeekPaceUp.roast.2':
    '{percent} % en une semaine, quand le rythme régulier est de {even} %. C’était le sprint ; place au footing.',
  'insight.firstWeekPaceUp.plain':
    'La première semaine a utilisé {percent} % de l’argent du cycle ; un rythme régulier serait de {even} %.',

  'insight.firstWeekPaceDown.soft.1':
    'La première semaine n’a utilisé que {percent} % du cycle ; un rythme régulier, c’est {even} %. Joli départ.',
  'insight.firstWeekPaceDown.soft.2':
    'Une première semaine en douceur : {percent} % utilisés, {compare} qu’à un rythme régulier.',
  'insight.firstWeekPaceDown.cheeky.1':
    'Première semaine : à peine {percent} %, sous les {even} % du rythme régulier. Départ tout en douceur.',
  'insight.firstWeekPaceDown.cheeky.2':
    'Semaine 1 : {percent} %. Le rythme régulier : {even} %. Pas mal du tout.',
  'insight.firstWeekPaceDown.roast.1':
    'La semaine 1 a utilisé {percent} %, sous les {even} % réguliers. Étrangement sage. Garde ça.',
  'insight.firstWeekPaceDown.roast.2':
    '{percent} % la première semaine, pour {even} % de rythme régulier. Rien à redire.',
  'insight.firstWeekPaceDown.plain':
    'La première semaine a utilisé {percent} % de l’argent du cycle ; un rythme régulier serait de {even} %.',

  'insight.paceSpare.soft.1':
    'À ce rythme, la paie ({payday}) arrive avec environ {spare} d’avance.',
  'insight.paceSpare.soft.2':
    'Continue comme ça et tu arrives au {payday} avec environ {spare} de reste.',
  'insight.paceSpare.cheeky.1':
    'Reste prévu le {payday} : {spare}. Ne le dépense pas dans ta tête.',
  'insight.paceSpare.cheeky.2': 'À ce rythme, {spare} de reste d’ici le {payday}. Pas mal.',
  'insight.paceSpare.roast.1':
    '{spare} de reste d’ici le {payday} à ce rythme. Ne les dépense pas avant qu’ils existent.',
  'insight.paceSpare.roast.2': 'Prévision : {spare} de reste le {payday}. À toi de tenir la météo.',
  'insight.paceSpare.plain':
    'Au rythme actuel, il reste environ {spare} le jour de paie, le {payday}.',

  'insight.paceShort.soft.1':
    'À ce rythme, l’argent devient juste vers le {runsOut}, avant la paie ({payday}). Quelques jours plus légers, et c’est réglé.',
  'insight.paceShort.soft.2':
    'Petit rappel : à ce rythme, ça devient court vers le {runsOut}. Des jours plus légers aident, et il reste du temps.',
  'insight.paceShort.cheeky.1':
    'Cet itinéraire tombe à sec vers le {runsOut} ; la paie, c’est le {payday}. Recalcul de l’itinéraire ?',
  'insight.paceShort.cheeky.2':
    'À ce rythme, l’argent s’épuise vers le {runsOut}. Paie le {payday}. Des jours doux en vue.',
  'insight.paceShort.roast.1':
    'Ce rythme tombe à sec vers le {runsOut}, et la paie arrive le {payday}. Quelques jours calmes et ça passe.',
  'insight.paceShort.roast.2':
    '{runsOut} : quand l’argent manque à ce rythme. {payday} : la paie. On réduit l’écart ?',
  'insight.paceShort.plain':
    'Au rythme actuel, l’argent s’épuise vers le {runsOut}, avant la paie du {payday}.',
};
