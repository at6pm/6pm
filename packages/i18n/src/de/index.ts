import type { Catalogue } from '../catalogue-types';
import { deAsk } from './ask';
import { deAskActions } from './ask-actions';
import { deAskChat } from './ask-chat';
import { deAskLedger } from './ask-ledger';
import { deBackup } from './backup';
import { deBanks } from './banks';
import { deCaptureAlerts } from './capture-alerts';
import { deCaptureWalk } from './capture-walk';
import { deCategories } from './categories';
import { deClose } from './close';
import { deCompanion } from './companion';
import { deCompanions } from './companions';
import { deDiary } from './diary';
import { deDuo } from './duo';
import { deExport } from './export';
import { deInsights } from './insights';
import { deInsightsHabits } from './insights-habits';
import { deIntents } from './intents';
import { deLooks } from './looks';
import { deMoneyIn } from './money-in';
import { deNative } from './native';
import { deOnboarding } from './onboarding';
import { dePlan } from './plan';
import { dePrivacyAi } from './privacy-ai';
import { deReceiptEmail } from './receipt-email';
import { deScan } from './scan';
import { deShareExt } from './share-ext';
import { deSharing } from './sharing';
import { deSurfaces } from './surfaces';
import { deToday } from './today';
import { deTogether } from './together';
import { deTravel } from './travel';
import { deVoice } from './voice';
import { deWidgetsGuide } from './widgets-guide';
import { deYearBook } from './year-book';

export { deAndroid } from './android';

/** German: every key of the English catalogue. */
export const de: Catalogue = {
  ...deOnboarding,
  ...deDiary,
  ...deYearBook,
  ...dePlan,
  ...deClose,
  ...deToday,
  ...deCategories,
  ...deScan,
  ...deBanks,
  ...deLooks,
  ...deCompanion,
  ...deInsights,
  ...deInsightsHabits,
  ...deBackup,
  ...deExport,
  ...deAsk,
  ...deAskLedger,
  ...deAskChat,
  ...deAskActions,
  ...dePrivacyAi,
  ...deNative,
  ...deSharing,
  ...deShareExt,
  ...deIntents,
  ...deCaptureWalk,
  ...deCaptureAlerts,
  ...deVoice,
  ...deSurfaces,
  ...deTogether,
  ...deReceiptEmail,
  ...deTravel,
  ...deCompanions,
  ...deWidgetsGuide,
  ...deDuo,
  ...deMoneyIn,
};

/**
 * Texts German writes exactly as English does (names, codes, a word the language borrows),
 * beyond the list every language shares.
 */
export const deSameAsEnglish: readonly string[] = [
  'Alipay',
  'App',
  'Apps',
  'Automation',
  'Automation → Wallet',
  'Backup',
  'Bank',
  'Details',
  'Labels',
  'Log to 6pm',
  'Look',
  'Looks',
  'Minute',
  'PayPay',
  'Plan',
  'Saigon',
  'Status',
  'Taiwan Pay',
  'Version {version}',
  'Wallet',
  'WeChat Pay',
  'Widgets',
  'iCloud · {when}',
  '{who} · {day}',
];
