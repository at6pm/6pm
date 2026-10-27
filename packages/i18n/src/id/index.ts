import type { Catalogue } from '../catalogue-types';
import { idAsk } from './ask';
import { idAskActions } from './ask-actions';
import { idAskChat } from './ask-chat';
import { idAskLedger } from './ask-ledger';
import { idBackup } from './backup';
import { idBanks } from './banks';
import { idCaptureAlerts } from './capture-alerts';
import { idCaptureWalk } from './capture-walk';
import { idCategories } from './categories';
import { idClose } from './close';
import { idCompanion } from './companion';
import { idCompanions } from './companions';
import { idDiary } from './diary';
import { idDuo } from './duo';
import { idExport } from './export';
import { idInsights } from './insights';
import { idInsightsHabits } from './insights-habits';
import { idIntents } from './intents';
import { idLooks } from './looks';
import { idMoneyIn } from './money-in';
import { idNative } from './native';
import { idOnboarding } from './onboarding';
import { idPlan } from './plan';
import { idPrivacyAi } from './privacy-ai';
import { idReceiptEmail } from './receipt-email';
import { idScan } from './scan';
import { idShareExt } from './share-ext';
import { idSharing } from './sharing';
import { idSurfaces } from './surfaces';
import { idToday } from './today';
import { idTogether } from './together';
import { idTravel } from './travel';
import { idVoice } from './voice';
import { idWidgetsGuide } from './widgets-guide';
import { idYearBook } from './year-book';

export { idAndroid } from './android';

/** Indonesian: every key of the English catalogue. */
export const id: Catalogue = {
  ...idOnboarding,
  ...idDiary,
  ...idYearBook,
  ...idPlan,
  ...idClose,
  ...idToday,
  ...idCategories,
  ...idScan,
  ...idBanks,
  ...idLooks,
  ...idCompanion,
  ...idInsights,
  ...idInsightsHabits,
  ...idBackup,
  ...idExport,
  ...idAsk,
  ...idAskLedger,
  ...idAskChat,
  ...idAskActions,
  ...idPrivacyAi,
  ...idNative,
  ...idSharing,
  ...idShareExt,
  ...idIntents,
  ...idCaptureWalk,
  ...idCaptureAlerts,
  ...idVoice,
  ...idSurfaces,
  ...idTogether,
  ...idReceiptEmail,
  ...idTravel,
  ...idCompanions,
  ...idWidgetsGuide,
  ...idDuo,
  ...idMoneyIn,
};

/**
 * Texts Indonesian writes exactly as English does (names, codes, a word the language borrows),
 * beyond the list every language shares.
 */
export const idSameAsEnglish: readonly string[] = [
  'App',
  'Bank',
  'Edit',
  'Gym',
  'Log a spend in ${applicationName}',
  'Log in ${applicationName}',
  'Quick add in ${applicationName}',
  'Saigon',
  'Scan QR in ${applicationName}',
  'Scan to pay in ${applicationName}',
  'Status',
];
