import type { Catalogue } from '../catalogue-types';
import { thAsk } from './ask';
import { thAskActions } from './ask-actions';
import { thAskChat } from './ask-chat';
import { thAskLedger } from './ask-ledger';
import { thBackup } from './backup';
import { thBanks } from './banks';
import { thCaptureAlerts } from './capture-alerts';
import { thCaptureWalk } from './capture-walk';
import { thCategories } from './categories';
import { thClose } from './close';
import { thCompanion } from './companion';
import { thCompanions } from './companions';
import { thDiary } from './diary';
import { thDuo } from './duo';
import { thExport } from './export';
import { thInsights } from './insights';
import { thInsightsHabits } from './insights-habits';
import { thIntents } from './intents';
import { thLooks } from './looks';
import { thMoneyIn } from './money-in';
import { thNative } from './native';
import { thOnboarding } from './onboarding';
import { thPlan } from './plan';
import { thPrivacyAi } from './privacy-ai';
import { thReceiptEmail } from './receipt-email';
import { thScan } from './scan';
import { thShareExt } from './share-ext';
import { thSharing } from './sharing';
import { thSurfaces } from './surfaces';
import { thToday } from './today';
import { thTogether } from './together';
import { thTravel } from './travel';
import { thVoice } from './voice';
import { thWidgetsGuide } from './widgets-guide';
import { thYearBook } from './year-book';

export { thAndroid } from './android';

/** Thai: every key of the English catalogue. */
export const th: Catalogue = {
  ...thOnboarding,
  ...thDiary,
  ...thYearBook,
  ...thPlan,
  ...thClose,
  ...thToday,
  ...thCategories,
  ...thScan,
  ...thBanks,
  ...thLooks,
  ...thCompanion,
  ...thInsights,
  ...thInsightsHabits,
  ...thBackup,
  ...thExport,
  ...thAsk,
  ...thAskLedger,
  ...thAskChat,
  ...thAskActions,
  ...thPrivacyAi,
  ...thNative,
  ...thSharing,
  ...thShareExt,
  ...thIntents,
  ...thCaptureWalk,
  ...thCaptureAlerts,
  ...thVoice,
  ...thSurfaces,
  ...thTogether,
  ...thReceiptEmail,
  ...thTravel,
  ...thCompanions,
  ...thWidgetsGuide,
  ...thDuo,
  ...thMoneyIn,
};

/**
 * Texts Thai writes exactly as English does (names, codes, a word the language borrows),
 * beyond the list every language shares.
 */
export const thSameAsEnglish: readonly string[] = [];
