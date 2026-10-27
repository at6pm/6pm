import type { Catalogue } from '../catalogue-types';
import { jaAsk } from './ask';
import { jaAskActions } from './ask-actions';
import { jaAskChat } from './ask-chat';
import { jaAskLedger } from './ask-ledger';
import { jaBackup } from './backup';
import { jaBanks } from './banks';
import { jaCaptureAlerts } from './capture-alerts';
import { jaCaptureWalk } from './capture-walk';
import { jaCategories } from './categories';
import { jaClose } from './close';
import { jaCompanion } from './companion';
import { jaCompanions } from './companions';
import { jaDiary } from './diary';
import { jaDuo } from './duo';
import { jaExport } from './export';
import { jaInsights } from './insights';
import { jaInsightsHabits } from './insights-habits';
import { jaIntents } from './intents';
import { jaLooks } from './looks';
import { jaMoneyIn } from './money-in';
import { jaNative } from './native';
import { jaOnboarding } from './onboarding';
import { jaPlan } from './plan';
import { jaPrivacyAi } from './privacy-ai';
import { jaReceiptEmail } from './receipt-email';
import { jaScan } from './scan';
import { jaShareExt } from './share-ext';
import { jaSharing } from './sharing';
import { jaSurfaces } from './surfaces';
import { jaToday } from './today';
import { jaTogether } from './together';
import { jaTravel } from './travel';
import { jaVoice } from './voice';
import { jaWidgetsGuide } from './widgets-guide';
import { jaYearBook } from './year-book';

export { jaAndroid } from './android';

/** Japanese: every key of the English catalogue. */
export const ja: Catalogue = {
  ...jaOnboarding,
  ...jaDiary,
  ...jaYearBook,
  ...jaPlan,
  ...jaClose,
  ...jaToday,
  ...jaCategories,
  ...jaScan,
  ...jaBanks,
  ...jaLooks,
  ...jaCompanion,
  ...jaInsights,
  ...jaInsightsHabits,
  ...jaBackup,
  ...jaExport,
  ...jaAsk,
  ...jaAskLedger,
  ...jaAskChat,
  ...jaAskActions,
  ...jaPrivacyAi,
  ...jaNative,
  ...jaSharing,
  ...jaShareExt,
  ...jaIntents,
  ...jaCaptureWalk,
  ...jaCaptureAlerts,
  ...jaVoice,
  ...jaSurfaces,
  ...jaTogether,
  ...jaReceiptEmail,
  ...jaTravel,
  ...jaCompanions,
  ...jaWidgetsGuide,
  ...jaDuo,
  ...jaMoneyIn,
};

/**
 * Texts Japanese writes exactly as English does (names, codes, a word the language borrows),
 * beyond the list every language shares.
 */
export const jaSameAsEnglish: readonly string[] = [
  'App',
  'From',
  'Log to 6pm',
  'QR',
  'iCloud · {when}',
  'you@at6pm.app',
  '{who} · {day}',
  '— 6pm',
  '≈ {amount}',
];
