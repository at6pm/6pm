import type { Catalogue } from '../catalogue-types';
import { frAsk } from './ask';
import { frAskActions } from './ask-actions';
import { frAskChat } from './ask-chat';
import { frAskLedger } from './ask-ledger';
import { frBackup } from './backup';
import { frBanks } from './banks';
import { frCaptureAlerts } from './capture-alerts';
import { frCaptureWalk } from './capture-walk';
import { frCategories } from './categories';
import { frClose } from './close';
import { frCompanion } from './companion';
import { frCompanions } from './companions';
import { frDiary } from './diary';
import { frDuo } from './duo';
import { frExport } from './export';
import { frInsights } from './insights';
import { frInsightsHabits } from './insights-habits';
import { frIntents } from './intents';
import { frLooks } from './looks';
import { frMoneyIn } from './money-in';
import { frNative } from './native';
import { frOnboarding } from './onboarding';
import { frPlan } from './plan';
import { frPrivacyAi } from './privacy-ai';
import { frReceiptEmail } from './receipt-email';
import { frScan } from './scan';
import { frShareExt } from './share-ext';
import { frSharing } from './sharing';
import { frSurfaces } from './surfaces';
import { frToday } from './today';
import { frTogether } from './together';
import { frTravel } from './travel';
import { frVoice } from './voice';
import { frWidgetsGuide } from './widgets-guide';
import { frYearBook } from './year-book';

export { frAndroid } from './android';

/** French: every key of the English catalogue. */
export const fr: Catalogue = {
  ...frOnboarding,
  ...frDiary,
  ...frYearBook,
  ...frPlan,
  ...frClose,
  ...frToday,
  ...frCategories,
  ...frScan,
  ...frBanks,
  ...frLooks,
  ...frCompanion,
  ...frInsights,
  ...frInsightsHabits,
  ...frBackup,
  ...frExport,
  ...frAsk,
  ...frAskLedger,
  ...frAskChat,
  ...frAskActions,
  ...frPrivacyAi,
  ...frNative,
  ...frSharing,
  ...frShareExt,
  ...frIntents,
  ...frCaptureWalk,
  ...frCaptureAlerts,
  ...frVoice,
  ...frSurfaces,
  ...frTogether,
  ...frReceiptEmail,
  ...frTravel,
  ...frCompanions,
  ...frWidgetsGuide,
  ...frDuo,
  ...frMoneyIn,
};

/**
 * Texts French writes exactly as English does (names, codes, a word the language borrows),
 * beyond the list every language shares.
 */
export const frSameAsEnglish: readonly string[] = [
  'App',
  'Apps',
  'Auto',
  'Code',
  'Date',
  'Image',
  'Look',
  'Looks',
  'Messages',
  'Millions',
  'Minute',
  'Monochrome',
  'Note',
  'Notification',
  'Notification › Date',
  'Parking',
  'Plan',
  'QR',
  'Sodium',
  'TOTAL',
  'Total',
  'Version {version}',
  'Widgets',
  'million',
  '— 6pm',
  '₫',
  '≈ {amount}',
];
