import { viCaptureAlerts } from './vi-capture-alerts';
import { viCaptureWalk } from './vi-capture-walk';
import { viNative } from './vi-native';
import { viSharing } from './vi-sharing';
import { viShareCards } from './vi-share-cards';
import { viShareCardsIncome } from './vi-share-cards-income';
import { viShareExt } from './vi-share-ext';
import { viIntents } from './vi-intents';
import { viVoice } from './vi-voice';
import { viSurfaces } from './vi-surfaces';
import { viWidgets } from './vi-widgets';
import { viTogether } from './vi-together';
import { viReceiptEmail } from './vi-receipt-email';
import { viBackup } from './vi-backup';
import { viExport } from './vi-export';
import { viMaxCodes } from './vi-max-codes';
import { viAsk } from './vi-ask';
import { viAskActions } from './vi-ask-actions';
import { viPrivacyAi } from './vi-privacy-ai';
import { viAskChat } from './vi-ask-chat';
import { viAskLedger } from './vi-ask-ledger';
import { viScan } from './vi-scan';
import { viBanks } from './vi-banks';
import { viLooks } from './vi-looks';
import { viOnboarding } from './vi-onboarding';
import { viDiary } from './vi-diary';
import { viYearBook } from './vi-year-book';
import { viPlan } from './vi-plan';
import { viClose } from './vi-close';
import type { Catalogue } from './catalogue-types';
import { viCompanion } from './vi-companion';
import { viInsights } from './vi-insights';
import { viInsightsHabits } from './vi-insights-habits';
import { viToday } from './vi-today';
import { viCategories } from './vi-categories';
import { viTravel } from './vi-travel';
import { viCompanions } from './vi-companions';
import { viWidgetsGuide } from './vi-widgets-guide';
import { viDuo } from './vi-duo';
import { viMoneyIn } from './vi-money-in';
import { viQuickAdd } from './vi-quick-add';
import { viPotsClose } from './vi-pots-close';
import { viPotsPlan } from './vi-pots-plan';
import { viPots } from './vi-pots';
import { viFirstCatch } from './vi-first-catch';
import { viCaptureLog } from './vi-capture-log';
import { viSettingsPages } from './vi-settings-pages';
import { viPhoto } from './vi-photo';
import { viMoneyReaches } from './vi-money-reaches';
import { viIncome } from './vi-income';
import { viWork } from './vi-work';
import { viRequests } from './vi-requests';
import { viWorkYear } from './vi-work-year';
import { viImport } from './vi-import';
import { viOwed } from './vi-owed';
import { viNotifications } from './vi-notifications';
import { viSeason } from './vi-season';
import { importSketchMomo } from './en-import';

export const vi: Catalogue = {
  ...viOnboarding,
  ...viDiary,
  ...viYearBook,
  ...viPlan,
  ...viClose,
  ...viToday,
  ...viCategories,
  ...viScan,
  ...viBanks,
  ...viLooks,
  ...viCompanion,
  ...viInsights,
  ...viInsightsHabits,
  ...viBackup,
  ...viExport,
  ...viMaxCodes,
  ...viAsk,
  ...viAskLedger,
  ...viAskChat,
  ...viAskActions,
  ...viPrivacyAi,
  ...viNative,
  ...viSharing,
  ...viShareCards,
  ...viShareCardsIncome,
  ...viShareExt,
  ...viIntents,
  ...viCaptureWalk,
  ...viCaptureAlerts,
  ...viVoice,
  ...viSurfaces,
  ...viWidgets,
  ...viTogether,
  ...viReceiptEmail,
  ...viTravel,
  ...viCompanions,
  ...viWidgetsGuide,
  ...viDuo,
  ...viMoneyIn,
  ...viQuickAdd,
  ...viPotsClose,
  ...viPotsPlan,
  ...viPots,
  ...viFirstCatch,
  ...viCaptureLog,
  ...viSettingsPages,
  ...viPhoto,
  ...viMoneyReaches,
  ...viIncome,
  ...viWork,
  ...viRequests,
  ...viWorkYear,
  ...viImport,
  ...viOwed,
  ...importSketchMomo,
  ...viSeason,
  ...viNotifications,
};
