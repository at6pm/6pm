import type { Entry } from '../catalogue-types';
import type { enTogether } from '../en-together';

// A shared jar is a « bocal commun ». French puts 0 and 1 in the same plural form, so the
// singular keeps its {count}.
export const frTogether: { readonly [Key in keyof typeof enTogether]: Entry } = {
  'together.title': 'Budget à deux',
  'together.card.subOn': 'Invite quelqu’un à partager un bocal.',
  'together.card.subPaired': {
    one: 'Avec {name} · {count} bocal commun',
    other: 'Avec {name} · {count} bocaux communs',
  },
  'together.card.open': 'Ouvrir Budget à deux',
  'together.you': 'Toi',
  'together.partner': 'Ton binôme',

  'together.intro.title': 'Mettre de côté, à deux.',
  'together.intro.sub':
    'Partage un bocal avec la personne avec qui tu épargnes. Vous y ajoutez tous les deux, et chacun voit qui a mis quoi. Tes propres journées restent sur ton téléphone.',
  'together.intro.note':
    'Se connecter avec Apple ne sert qu’au Budget à deux. 6pm te demande ton prénom, jamais ton e-mail.',
  'together.signIn.failed': 'Impossible de se connecter avec Apple. Réessaie.',
  'together.signIn.unavailable': 'Se connecter avec Apple n’est pas disponible sur cet iPhone.',

  'together.waiting.title': 'Rien que toi pour l’instant.',
  'together.waiting.sub':
    'Envoie le lien à la personne avec qui tu épargnes. Quand elle vous rejoint, elle voit vos bocaux communs.',
  'together.paired.title': 'Toi et {name}',
  'together.paired.sub': { one: '{count} bocal commun', other: '{count} bocaux communs' },
  'together.invite': 'Inviter quelqu’un',
  'together.invite.again': 'Envoyer un nouveau lien',
  'together.invite.message': 'Épargne avec moi sur 6pm : {url}',
  'together.invite.note': 'Un lien d’invitation ne sert qu’une fois, pendant 7 jours.',
  'together.offline': 'Hors ligne. Voici ce que tu as vu en dernier.',

  'together.pots.title': 'Bocaux communs',
  'together.newPot': 'Nouveau bocal commun',
  'together.newPotSub': 'Vous y ajoutez tous les deux.',
  'together.jar.add': 'Ajouter {amount} à {name}',
  'together.jar.split': 'Toi {mine} · {partner} {theirs}',
  'together.jar.mine': 'Tu as mis {mine}',

  'together.pot.edit': 'Modifier le bocal commun',
  'together.pot.start': 'Lancer le bocal commun',
  'together.pot.save': 'Enregistrer',
  'together.pot.sumMonthly': 'Environ {amount} par mois, à vous deux',
  'together.pot.sumSub': 'Ce que tu y mets compte comme un versement dans tes propres bocaux.',
  'together.pot.sumNone': 'Pas de date, pas de pression',
  'together.pot.sumNoneSub': 'Ajoute-y quand tu veux.',
  'together.pot.amount': 'Ajouter',
  'together.pot.addButton': 'Ajouter {amount}',
  'together.pot.entries': 'Qui a mis quoi',
  'together.pot.empty': 'Rien dedans pour l’instant.',
  'together.pot.entry': '{who} · le {day}',
  'together.pot.takeBack': 'Reprendre',
  'together.pot.takeBackLabel': 'Reprendre {amount}',
  'together.pot.delete': 'Supprimer le bocal commun',
  'together.pot.deleteConfirm': 'Touche encore pour le supprimer pour vous deux',
  'together.pot.deleted': 'Bocal {name} supprimé',
  'together.pot.gone': 'Ce bocal n’existe plus. Ton binôme l’a peut-être supprimé.',

  'together.leave': 'Quitter Budget à deux',
  'together.leaveConfirm': 'Touche encore pour quitter',
  'together.leave.note':
    'Quitter y met fin pour vous deux et supprime les bocaux communs de notre serveur. Chacun garde ce qu’il y a mis, sur son propre téléphone.',
  'together.deleteAccount': 'Supprimer le compte Budget à deux',
  'together.deleteConfirm': 'Touche encore pour supprimer ton compte',
  'together.delete.note':
    'Supprime ta connexion et tout ce que tu partages, et indique à Apple que 6pm n’utilise plus ton compte Apple. Tes propres journées restent sur ce téléphone.',
  'together.kept.title': 'Gardé sur cet iPhone',
  'together.kept.sub':
    'Ce que tu as mis dans les bocaux communs : {amount}. Ça reste ici quand un bocal disparaît.',

  'together.join.title': 'Rejoindre Budget à deux',
  'together.join.sub':
    'Quelqu’un t’invite à partager des bocaux sur 6pm. Connecte-toi avec Apple pour le rejoindre. Tes propres journées restent sur ton téléphone.',
  'together.join.button': 'Rejoindre',
  'together.join.expired': 'Cette invitation a expiré. Demande un nouveau lien.',
  'together.join.used': 'Cette invitation a déjà servi. Demande un nouveau lien.',
  'together.join.full': 'Deux personnes partagent déjà des bocaux ici.',
  'together.join.own': 'C’est ta propre invitation. Envoie-la à la personne avec qui tu épargnes.',
  'together.join.paired':
    'Tu partages déjà des bocaux. Quitte d’abord Budget à deux, puis rouvre le lien.',
  'together.join.missing': 'Ce lien d’invitation ne fonctionne pas. Demandes-en un nouveau.',

  'together.error.offline': 'Impossible de joindre 6pm. Rien n’a changé.',
  'together.error.failed': 'Ça n’est pas passé. Rien n’a changé.',
  'together.ended': 'Budget à deux est terminé. Ce que tu as mis reste sur ce téléphone.',
  'together.left': 'Tu as quitté Budget à deux.',
  'together.deleted': 'Compte Budget à deux supprimé.',
  'together.joined': 'C’est fait. Budget à deux avec {name}.',
};
