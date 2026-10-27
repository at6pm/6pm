import type { Entry } from '../catalogue-types';
import type { enAskChat } from '../en-ask-chat';

// The safety lines stay plain and keep the Vietnamese hotline and emergency numbers.
export const deAskChat: { readonly [Key in keyof typeof enAskChat]: Entry } = {
  'ask.chat.greeting.soft': 'Hi! Ich bin da, wann immer du nach deinem Geld schauen willst.',
  'ask.chat.greeting.cheeky': 'Hey hey. Frag mich alles rund ums Geld, ich hab deine Zahlen.',
  'ask.chat.greeting.roast': 'Ach, du bist’s. Willst du wissen, wie schlimm es ist?',
  'ask.chat.greeting.plain': 'Hallo. Frag mich zu deinen Ausgaben, Fixkosten oder Spartöpfen.',
  'ask.chat.thanks.soft': 'Jederzeit. Pass heute gut auf dich auf.',
  'ask.chat.thanks.cheeky': 'Gern! Bezahlung bitte in pünktlich abgeschlossenen Tagen.',
  'ask.chat.thanks.roast': 'Dank nicht mir. Dank dem Budget, das du fast eingehalten hast.',
  'ask.chat.thanks.plain': 'Gern geschehen.',
  'ask.chat.offTopic.soft':
    'Das liegt außerhalb meiner Ecke. Aber Geldsachen? Da bin ich ganz für dich da.',
  'ask.chat.offTopic.cheeky': 'Nicht meine Abteilung. Frag mich lieber, wo dein Geld hin ist 👀',
  'ask.chat.offTopic.roast':
    'Ich bin ein Budget, keine Suchmaschine. Frag mich zu deinen Ausgaben.',
  'ask.chat.offTopic.plain': 'Ich kann dir nur bei deinem Geld in 6pm helfen.',
  'ask.chat.identity':
    'Ich bin dein Begleiter in 6pm. Jede Zahl, die ich dir nenne, wird auf deinem Handy aus deinen eigenen Ausgaben berechnet. Ich bin ein Programm, kein Mensch.',
  'ask.chat.privacy':
    'Ich sehe dein Bankkonto nicht. Ich kenne nur, was in 6pm steht, und das bleibt auf deinem Handy. Um eine Frage zu verstehen, sieht unser Server die Frage und deine Kategorie- und Spartopf-Namen; für einen Spruch nur die paar Fakten darin.',
  'ask.chat.venting.soft': 'Das klingt schwer. Du trägst das nicht allein.',
  'ask.chat.venting.cheeky': 'Harter Tag. Atme durch: Das ist eine Zahl, kein Urteil.',
  'ask.chat.venting.plain': 'Geldstress ist real.',
  'ask.chat.goingRight': 'Eine Sache, die gut läuft:',
  'ask.chat.freshStart': 'Morgen beginnt mit einer frischen Linie.',
  'ask.chat.roast.soft': 'Dann eine sanfte:',
  'ask.chat.roast.cheeky': 'Okay, du hast es so gewollt.',
  'ask.chat.roast.roast': 'Halt dich fest.',
  'ask.chat.roast.plain': 'Was auffällt:',
  'ask.chat.roastNothing.soft': 'Nichts zum Sticheln. Du machst das gut.',
  'ask.chat.roastNothing.cheeky': 'Ich hab geschaut. Ehrlich? Nichts zum Aufziehen. Nervig.',
  'ask.chat.roastNothing.roast':
    'Ich wollte dich grillen. Du hast mir nichts geliefert. Frechheit.',
  'ask.chat.roastNothing.plain': 'Gerade fällt nichts auf.',
  'ask.chat.hype.soft': 'Das solltest du hören:',
  'ask.chat.hype.cheeky': 'Hype-Modus an:',
  'ask.chat.hype.roast': 'Na gut. Ehre, wem Ehre gebührt:',
  'ask.chat.hype.plain': 'Was gut läuft:',
  'ask.chat.hypeNothing.soft': 'Du warst da und hast nachgeschaut. Das zählt.',
  'ask.chat.hypeNothing.cheeky': 'Du hast freiwillig eine Budget-App geöffnet. Legende.',
  'ask.chat.hypeNothing.roast': 'Du bist hier, das ist mehr als die meisten. Halbwegs stolz.',
  'ask.chat.hypeNothing.plain': 'Mach weiter. Es summiert sich.',
  'ask.chat.distress':
    'Es tut mir wirklich leid, dass es dir so geht. Du musst das nicht allein tragen: Sprich mit jemandem, dem du vertraust, oder ruf die Hotline Ngày Mai unter 096 306 1414 an (13 bis 20:30 Uhr, Mittwoch bis Sonntag). Wenn du gerade in Gefahr bist, ruf die 115.',
  'ask.chat.investing':
    'Ich kann dir nicht sagen, worin oder wann du investieren sollst; dafür brauchst du eine zugelassene Beratung. Ich kann dir zeigen, was du jeden Monat übrig hast oder wie schnell sich ein Spartopf füllt.',
  'ask.chat.unsafe':
    'Dabei helfe ich nicht. Wenn das Geld knapp ist, zeige ich dir, was bis zum Zahltag übrig ist oder was deine Spartöpfe abdecken könnten. Wenn dich ein illegaler Geldverleiher bedroht, ruf die Polizei unter 113.',
};
