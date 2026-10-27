import type { Catalogue } from '../catalogue-types';
import { koAsk } from './ask';
import { koAskActions } from './ask-actions';
import { koAskChat } from './ask-chat';
import { koAskLedger } from './ask-ledger';
import { koBackup } from './backup';
import { koBanks } from './banks';
import { koCaptureAlerts } from './capture-alerts';
import { koCaptureWalk } from './capture-walk';
import { koCategories } from './categories';
import { koClose } from './close';
import { koCompanion } from './companion';
import { koCompanions } from './companions';
import { koDiary } from './diary';
import { koDuo } from './duo';
import { koExport } from './export';
import { koInsights } from './insights';
import { koInsightsHabits } from './insights-habits';
import { koIntents } from './intents';
import { koLooks } from './looks';
import { koMoneyIn } from './money-in';
import { koNative } from './native';
import { koOnboarding } from './onboarding';
import { koPlan } from './plan';
import { koPrivacyAi } from './privacy-ai';
import { koReceiptEmail } from './receipt-email';
import { koScan } from './scan';
import { koShareExt } from './share-ext';
import { koSharing } from './sharing';
import { koSurfaces } from './surfaces';
import { koToday } from './today';
import { koTogether } from './together';
import { koTravel } from './travel';
import { koVoice } from './voice';
import { koWidgetsGuide } from './widgets-guide';
import { koYearBook } from './year-book';

export { koAndroid } from './android';

/** Korean: every key of the English catalogue. */
export const ko: Catalogue = {
  ...koOnboarding,
  ...koDiary,
  ...koYearBook,
  ...koPlan,
  ...koClose,
  ...koToday,
  ...koCategories,
  ...koScan,
  ...koBanks,
  ...koLooks,
  ...koCompanion,
  ...koInsights,
  ...koInsightsHabits,
  ...koBackup,
  ...koExport,
  ...koAsk,
  ...koAskLedger,
  ...koAskChat,
  ...koAskActions,
  ...koPrivacyAi,
  ...koNative,
  ...koSharing,
  ...koShareExt,
  ...koIntents,
  ...koCaptureWalk,
  ...koCaptureAlerts,
  ...koVoice,
  ...koSurfaces,
  ...koTogether,
  ...koReceiptEmail,
  ...koTravel,
  ...koCompanions,
  ...koWidgetsGuide,
  ...koDuo,
  ...koMoneyIn,
};

/**
 * Texts Korean writes exactly as English does (names, codes, a word the language borrows),
 * beyond the list every language shares.
 */
export const koSameAsEnglish: readonly string[] = ['iCloud · {when}', '{who} · {day}'];
