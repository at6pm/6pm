import type { Entry } from '../catalogue-types';
import type { enMaxCodes } from '../en-max-codes';

export const frMaxCodes: { readonly [Key in keyof typeof enMaxCodes]: Entry } = {
  'maxCodes.section': '6pm Max',
  'maxCodes.give': 'Offrir Max à un ami',
  'maxCodes.give.sub': 'Envoyer un lien vers une offre Max',
  'maxCodes.give.message':
    '6pm me dit combien je peux dépenser aujourd’hui et note mes dépenses tout seul. Voici une offre 6pm Max pour toi : {url}',
  'maxCodes.give.failed': 'Impossible d’ouvrir le partage. Réessaie.',
  'maxCodes.redeem': 'Utiliser un code',
  'maxCodes.head.friend': 'Un ami t’offre Max.',
  'maxCodes.head.code': 'Ton offre Max.',
  'maxCodes.playHint': 'Sur Google Play, touche le mode de paiement, puis Utiliser un code.',
  'maxCodes.playHint.code':
    'Code {code} copié. Sur Google Play, touche le mode de paiement, puis Utiliser un code.',
};
