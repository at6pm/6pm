import type { Entry } from '../catalogue-types';
import type { enNative } from '../en-native';

// Permission prompts read like iOS's own French strings; Wallet is « Cartes » on a French iPhone.
export const frNative: { readonly [Key in keyof typeof enNative]: Entry } = {
  'native.permission.camera':
    '6pm utilise l’appareil photo pour lire les codes QR et les tickets que tu scannes. Les photos restent sur ton iPhone, sauf si un ticket doit être lu de plus près.',
  'native.permission.microphone':
    '6pm t’écoute pendant que tu dictes une dépense. Ta voix est envoyée à un service de transcription pour être écrite, ou reste sur cet iPhone en mode sur l’appareil.',
  'native.permission.speech': '6pm transforme ce que tu dis en un montant et un nom.',
  'native.permission.photos':
    '6pm enregistre uniquement ton ticket de clôture et ton journal d’argent dans Photos. Il ne parcourt jamais ta photothèque.',
  'native.permission.photosAdd':
    '6pm enregistre ton ticket de clôture et ton journal d’argent dans Photos quand tu le lui demandes.',
  'native.permission.location':
    '6pm vérifie dans quel pays tu te trouves pour que le Mode voyage s’active tout seul à l’étranger.',
  'native.surfaces.safeToday.name': 'À dépenser aujourd’hui',
  'native.surfaces.safeToday.description': 'Ce que tu peux dépenser aujourd’hui, en un coup d’œil.',
  'native.surfaces.setUp': 'Ouvre 6pm pour commencer',
  'native.surfaces.markPaid.title': 'Payé',
  'native.surfaces.todayList.name': 'Aujourd’hui',
  'native.surfaces.todayList.description':
    'Ce que tu as dépensé aujourd’hui, du plus récent au plus ancien.',
  'native.share.title': 'Ajouter à 6pm',
  'native.share.readFromBank': 'Lu sur cet iPhone depuis ton ticket {bank}',
  'native.share.readHere': 'Lu sur cet iPhone depuis ton ticket',
  'native.share.unreadable': 'Impossible de lire ce ticket. Saisis le montant.',
  'native.share.to': 'À',
  'native.share.when': 'Quand',
  'native.share.code': 'Code',
  'native.share.category': 'Catégorie',
  'native.share.unsure': 'Nom incertain. Touche-le pour vérifier.',
  'native.share.checkName': 'Vérifier le nom',
  'native.share.amountHint': 'Montant',
  'native.share.nameHint': 'Qui tu as payé',
  'native.share.chooseCategory': 'Choisir',
  'native.share.edit': 'Modifier',
  'native.share.done': 'Terminé',
  'native.share.confirm': 'Confirmer',
  'native.share.currency': 'Devise',
  'native.share.currencyUnsure': 'Le ticket n’indique pas sa devise. Touche-la pour vérifier.',
  'native.share.checkCurrency': 'Vérifier la devise',
  'native.share.inDong': '≈ {amount}',
  'native.share.noRate':
    'Pas encore de taux. 6pm le convertira au taux de ce jour-là dès qu’il l’aura.',
  'native.share.unknownCurrency': 'Devise introuvable. Saisis le montant en đồng.',
  'native.share.unknownCurrencyIn': 'Devise introuvable. Saisis le montant en {currency}.',
  'native.share.looking': 'Lecture plus attentive…',
  'native.share.step': '{n} sur {total}',
  'native.share.skip': 'Passer',
  'native.intents.logSpend.title': 'Noter dans 6pm',
  'native.intents.logSpend.amount': 'Montant',
  'native.intents.logSpend.merchant': 'Où',
  'native.intents.logSpend.description':
    'Note une dépense dans 6pm : paiements Apple Pay depuis Cartes, ou ce que tu dis à Siri.',
  'native.intents.logSpend.short': 'Noter une dépense',
  'native.intents.logSpend.askAmount': 'C’était combien ?',
  'native.intents.logSpend.logged': 'C’est noté.',
  'native.intents.logSpend.failed': '6pm n’a pas pu le noter. Ouvre 6pm et essaie Ajout rapide.',
  'native.intents.scan.title': 'Scanner QR',
  'native.intents.scan.description': 'Ouvre Scanner pour payer dans 6pm.',
  'native.intents.quickAdd.title': 'Ajout rapide',
  'native.intents.quickAdd.description': 'Ouvre Ajout rapide dans 6pm.',
  // Spoken commands, as someone in France would say them to Siri.
  'native.appShortcuts.logIn': 'Noter dans ${applicationName}',
  'native.appShortcuts.logSpend': 'Noter une dépense dans ${applicationName}',
  'native.appShortcuts.scan': 'Scanner un QR dans ${applicationName}',
  'native.appShortcuts.scanToPay': 'Scanner pour payer dans ${applicationName}',
  'native.appShortcuts.quickAdd': 'Ajout rapide dans ${applicationName}',
};
