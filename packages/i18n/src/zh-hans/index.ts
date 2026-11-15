import type { Catalogue } from '../catalogue-types';
import { zhHansAsk } from './ask';
import { zhHansAskActions } from './ask-actions';
import { zhHansAskChat } from './ask-chat';
import { zhHansAskLedger } from './ask-ledger';
import { zhHansBackup } from './backup';
import { zhHansBanks } from './banks';
import { zhHansCaptureAlerts } from './capture-alerts';
import { zhHansCaptureWalk } from './capture-walk';
import { zhHansCategories } from './categories';
import { zhHansClose } from './close';
import { zhHansCompanion } from './companion';
import { zhHansCompanions } from './companions';
import { zhHansDiary } from './diary';
import { zhHansDuo } from './duo';
import { zhHansExport } from './export';
import { zhHansInsights } from './insights';
import { zhHansInsightsHabits } from './insights-habits';
import { zhHansIntents } from './intents';
import { zhHansLooks } from './looks';
import { zhHansMoneyIn } from './money-in';
import { zhHansQuickAdd } from './quick-add';
import { zhHansPotsClose } from './pots-close';
import { zhHansPotsPlan } from './pots-plan';
import { zhHansPots } from './pots';
import { zhHansNative } from './native';
import { zhHansOnboarding } from './onboarding';
import { zhHansPlan } from './plan';
import { zhHansPrivacyAi } from './privacy-ai';
import { zhHansReceiptEmail } from './receipt-email';
import { zhHansScan } from './scan';
import { zhHansShareExt } from './share-ext';
import { zhHansSharing } from './sharing';
import { zhHansShareCards } from './share-cards';
import { zhHansShareCardsIncome } from './share-cards-income';
import { zhHansSurfaces } from './surfaces';
import { zhHansWidgets } from './widgets';
import { zhHansToday } from './today';
import { zhHansTogether } from './together';
import { zhHansTravel } from './travel';
import { zhHansVoice } from './voice';
import { zhHansWidgetsGuide } from './widgets-guide';
import { zhHansYearBook } from './year-book';
import { zhHansFirstCatch } from './first-catch';
import { zhHansCaptureLog } from './capture-log';
import { zhHansSettingsPages } from './settings-pages';
import { zhHansPhoto } from './photo';
import { zhHansMoneyReaches } from './money-reaches';
import { zhHansIncome } from './income';
import { zhHansWork } from './work';
import { zhHansRequests } from './requests';
import { zhHansWorkYear } from './work-year';
import { zhHansImport } from './import';
import { zhHansOwed } from './owed';
import { zhHansNotifications } from './notifications';
import { zhHansSeason } from './season';
import { importSketchEnglish, importSketchMomo } from '../en-import';

export { zhHansAndroid } from './android';

/** Simplified Chinese: every key of the English catalogue. */
export const zhHans: Catalogue = {
  ...zhHansOnboarding,
  ...zhHansDiary,
  ...zhHansYearBook,
  ...zhHansPlan,
  ...zhHansClose,
  ...zhHansToday,
  ...zhHansCategories,
  ...zhHansScan,
  ...zhHansBanks,
  ...zhHansLooks,
  ...zhHansCompanion,
  ...zhHansInsights,
  ...zhHansInsightsHabits,
  ...zhHansBackup,
  ...zhHansExport,
  ...zhHansAsk,
  ...zhHansAskLedger,
  ...zhHansAskChat,
  ...zhHansAskActions,
  ...zhHansPrivacyAi,
  ...zhHansNative,
  ...zhHansSharing,
  ...zhHansShareCards,
  ...zhHansShareCardsIncome,
  ...zhHansShareExt,
  ...zhHansIntents,
  ...zhHansCaptureWalk,
  ...zhHansCaptureAlerts,
  ...zhHansVoice,
  ...zhHansSurfaces,
  ...zhHansWidgets,
  ...zhHansTogether,
  ...zhHansReceiptEmail,
  ...zhHansTravel,
  ...zhHansCompanions,
  ...zhHansWidgetsGuide,
  ...zhHansDuo,
  ...zhHansMoneyIn,
  ...zhHansQuickAdd,
  ...zhHansPotsClose,
  ...zhHansPotsPlan,
  ...zhHansPots,
  ...zhHansFirstCatch,
  ...zhHansCaptureLog,
  ...zhHansSettingsPages,
  ...zhHansPhoto,
  ...zhHansMoneyReaches,
  ...zhHansIncome,
  ...zhHansWork,
  ...zhHansRequests,
  ...zhHansWorkYear,
  ...zhHansImport,
  ...zhHansOwed,
  ...importSketchMomo,
  ...zhHansSeason,
  ...zhHansNotifications,
};

/**
 * Texts Simplified Chinese writes exactly as English does (names, codes, a word the language borrows),
 * beyond the list every language shares.
 */
export const zhHansSameAsEnglish: readonly string[] = [
  'work-{year}.csv',
  'work-costs-{year}.csv',
  ...importSketchEnglish,
  'App',
  'iCloud · {when}',
  '{who} · {day}',
];
