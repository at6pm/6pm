import type { Catalogue } from '../catalogue-types';
import { esAsk } from './ask';
import { esAskActions } from './ask-actions';
import { esAskChat } from './ask-chat';
import { esAskLedger } from './ask-ledger';
import { esBackup } from './backup';
import { esBanks } from './banks';
import { esCaptureAlerts } from './capture-alerts';
import { esCaptureWalk } from './capture-walk';
import { esCategories } from './categories';
import { esClose } from './close';
import { esCompanion } from './companion';
import { esCompanions } from './companions';
import { esDiary } from './diary';
import { esDuo } from './duo';
import { esExport } from './export';
import { esInsights } from './insights';
import { esInsightsHabits } from './insights-habits';
import { esIntents } from './intents';
import { esLooks } from './looks';
import { esMoneyIn } from './money-in';
import { esPotsClose } from './pots-close';
import { esPotsPlan } from './pots-plan';
import { esPots } from './pots';
import { esNative } from './native';
import { esOnboarding } from './onboarding';
import { esPlan } from './plan';
import { esPrivacyAi } from './privacy-ai';
import { esReceiptEmail } from './receipt-email';
import { esScan } from './scan';
import { esShareExt } from './share-ext';
import { esSharing } from './sharing';
import { esSurfaces } from './surfaces';
import { esWidgets } from './widgets';
import { esToday } from './today';
import { esTogether } from './together';
import { esTravel } from './travel';
import { esVoice } from './voice';
import { esWidgetsGuide } from './widgets-guide';
import { esYearBook } from './year-book';
import { esFirstCatch } from './first-catch';
import { esPhoto } from './photo';
import { esImport } from './import';
import { esOwed } from './owed';
import { esNotifications } from './notifications';
import { esSeason } from './season';
import { importSketchEnglish, importSketchMomo } from '../en-import';

export { esAndroid } from './android';

/** Spanish: every key of the English catalogue. */
export const es: Catalogue = {
  ...esOnboarding,
  ...esDiary,
  ...esYearBook,
  ...esPlan,
  ...esClose,
  ...esToday,
  ...esCategories,
  ...esScan,
  ...esBanks,
  ...esLooks,
  ...esCompanion,
  ...esInsights,
  ...esInsightsHabits,
  ...esBackup,
  ...esExport,
  ...esAsk,
  ...esAskLedger,
  ...esAskChat,
  ...esAskActions,
  ...esPrivacyAi,
  ...esNative,
  ...esSharing,
  ...esShareExt,
  ...esIntents,
  ...esCaptureWalk,
  ...esCaptureAlerts,
  ...esVoice,
  ...esSurfaces,
  ...esWidgets,
  ...esTogether,
  ...esReceiptEmail,
  ...esTravel,
  ...esCompanions,
  ...esWidgetsGuide,
  ...esDuo,
  ...esMoneyIn,
  ...esPotsClose,
  ...esPotsPlan,
  ...esPots,
  ...esFirstCatch,
  ...esPhoto,
  ...esImport,
  ...esOwed,
  ...importSketchMomo,
  ...esSeason,
  ...esNotifications,
};

/**
 * Texts Spanish writes exactly as English does (names, codes, a word the language borrows),
 * beyond the list every language shares.
 */
export const esSameAsEnglish: readonly string[] = [
  ...importSketchEnglish,
  'App',
  'Apps',
  'General',
  'Log to 6pm',
  'No',
  'Personal',
  'Plan',
  'TOTAL',
  'Total',
  'Widgets',
  'iCloud · {when}',
  '{who} · {day}',
];
