// String catalogues for the languages 6pm speaks.
export { languages, platforms } from './catalogue-types';
export type { Language, ParamsArgument, ParamsOf, Platform, StringKey } from './catalogue-types';
export { defaultLanguage, isLanguage, localeOf, pickLanguage } from './pick-language';
export { t, translatorFor } from './translate';
