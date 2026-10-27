import type { Entry } from '../catalogue-types';
import type { enAskChat } from '../en-ask-chat';

// The companion has no gender, so its lines avoid agreeing adjectives (« fier », « désolé »).
// The helplines are Vietnam's, where 6pm's users live.
export const frAskChat: { readonly [Key in keyof typeof enAskChat]: Entry } = {
  'ask.chat.greeting.soft': 'Coucou ! Je suis là dès que tu veux faire le point sur ton argent.',
  'ask.chat.greeting.cheeky': 'Hey ! Demande-moi tout ce qui touche à l’argent, j’ai tes chiffres.',
  'ask.chat.greeting.roast': 'Ah, c’est toi. Tu viens constater l’ampleur des dégâts ?',
  'ask.chat.greeting.plain':
    'Bonjour. Pose-moi tes questions sur tes dépenses, tes factures ou tes cagnottes.',
  'ask.chat.thanks.soft': 'Avec plaisir. Prends soin de toi aujourd’hui.',
  'ask.chat.thanks.cheeky': 'Avec plaisir ! Je me fais payer en journées clôturées à l’heure.',
  'ask.chat.thanks.roast': 'Ne me remercie pas. Remercie le budget que tu as presque tenu.',
  'ask.chat.thanks.plain': 'Je t’en prie.',
  'ask.chat.offTopic.soft': 'Ça, ce n’est pas trop mon rayon. Mais l’argent ? Je suis tout à toi.',
  'ask.chat.offTopic.cheeky': 'Pas mon service. Demande-moi plutôt où est passé ton argent 👀',
  'ask.chat.offTopic.roast':
    'Je suis un budget, pas un moteur de recherche. Parle-moi de tes dépenses.',
  'ask.chat.offTopic.plain': 'Je peux seulement t’aider avec ton argent dans 6pm.',
  'ask.chat.identity':
    'Je suis ton compagnon dans 6pm. Chaque chiffre que je te donne est calculé sur ton téléphone, à partir de tes propres dépenses. Je suis un programme, pas une personne.',
  'ask.chat.privacy':
    'Je ne vois pas ton compte bancaire. Je ne connais que ce qu’il y a dans 6pm, et ça reste sur ton téléphone. Pour lire une question, notre serveur voit la question et les noms de tes catégories et cagnottes ; pour formuler une réplique, seulement les quelques faits qu’elle contient.',
  'ask.chat.venting.soft': 'Ça a l’air lourd. On le porte à deux.',
  'ask.chat.venting.cheeky': 'Dure journée. Respire : c’est un chiffre, pas un verdict.',
  'ask.chat.venting.plain': 'Le stress lié à l’argent, c’est réel.',
  'ask.chat.goingRight': 'Une chose qui va bien :',
  'ask.chat.freshStart': 'Demain repart avec un chiffre tout neuf.',
  'ask.chat.roast.soft': 'Une gentille, alors :',
  'ask.chat.roast.cheeky': 'OK, tu l’as cherché.',
  'ask.chat.roast.roast': 'Accroche-toi.',
  'ask.chat.roast.plain': 'Ce qui ressort :',
  'ask.chat.roastNothing.soft': 'Rien à taquiner. Tu t’en sors bien.',
  'ask.chat.roastNothing.cheeky': 'J’ai regardé. Franchement ? Rien à chambrer. Agaçant.',
  'ask.chat.roastNothing.roast': 'Je voulais te clasher. Tu ne m’as rien donné. Vexant.',
  'ask.chat.roastNothing.plain': 'Rien ne ressort pour l’instant.',
  'ask.chat.hype.soft': 'Tu mérites d’entendre ça :',
  'ask.chat.hype.cheeky': 'Mode supporter activé :',
  'ask.chat.hype.roast': 'Bon. Rendons à César ce qui est à César :',
  'ask.chat.hype.plain': 'Quelque chose qui va bien :',
  'ask.chat.hypeNothing.soft': 'Tu es là, et tu as regardé. Ça compte.',
  'ask.chat.hypeNothing.cheeky': 'Tu as ouvert une app de budget exprès. Une légende.',
  'ask.chat.hypeNothing.roast':
    'Tu es là, c’est déjà plus que la plupart. Un peu de fierté, quand même.',
  'ask.chat.hypeNothing.plain': 'Continue. Ça s’additionne.',
  'ask.chat.distress':
    'C’est vraiment dur de se sentir comme ça. Tu n’as pas à porter ça sans aide : parle à quelqu’un de confiance, ou appelle la ligne d’écoute Ngày Mai au 096 306 1414 (de 13 h à 20 h 30, du mercredi au dimanche). Si tu es en danger maintenant, appelle le 115.',
  'ask.chat.investing':
    'Je ne peux pas te dire dans quoi investir ni quand ; il faut un conseiller agréé pour ça. Je peux te montrer ce qu’il te reste chaque mois, ou à quelle vitesse une cagnotte se remplit.',
  'ask.chat.unsafe':
    'Je ne t’aiderai pas pour ça. Si l’argent manque, je peux te montrer ce qui reste jusqu’à la paie ou ce que tes cagnottes peuvent couvrir. Si un prêteur illégal te menace, appelle la police au 113.',
};
