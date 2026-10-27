import type { Entry } from '../catalogue-types';
import type { enReceiptEmail } from '../en-receipt-email';

export const frReceiptEmail: { readonly [Key in keyof typeof enReceiptEmail]: Entry } = {
  'receiptEmail.copy': 'Copier l’adresse',
  'receiptEmail.share': 'Partager ton adresse 6pm',
  'receiptEmail.offline': 'Ton adresse s’affiche une fois en ligne',
  'receiptEmail.from': 'De {address}',
  'receiptEmail.deviceMode': 'Désactivé tant que l’IA reste sur cet iPhone',
  'receiptEmail.deviceMode.body':
    'Les tickets par e-mail ont besoin de notre serveur pour lire tes messages, donc c’est désactivé tant que 6pm garde l’IA sur cet iPhone. Partage ou scanne plutôt le ticket.',
  'receiptEmail.check.title': '{provider} demande de confirmer le transfert depuis {address}',
  'receiptEmail.check.titleNoAddress': '{provider} demande de confirmer le transfert vers 6pm',
  'receiptEmail.check.code': 'Code de confirmation',
  'receiptEmail.check.copy': 'Copier',
  'receiptEmail.check.copyLabel': 'Copier le code de confirmation',
  'receiptEmail.check.copied': 'Code copié.',
  'receiptEmail.check.hint':
    'Ouvre la page de confirmation, ou colle le code dans les paramètres de {provider}. Ensuite, les tickets transférés arrivent ici.',
  'receiptEmail.check.open': 'Ouvrir la page de confirmation',
  'receiptEmail.check.openFailed': 'Impossible d’ouvrir la page. Copie plutôt le code.',
  'receiptEmail.check.hintNoCode':
    'Ouvre la page de confirmation et touche Confirmer. Ensuite, les tickets transférés arrivent ici.',
  'receiptEmail.check.openFailedNoCode': 'Impossible d’ouvrir la page. Réessaie dans un instant.',
  'receiptEmail.check.done': 'Terminé',
};
