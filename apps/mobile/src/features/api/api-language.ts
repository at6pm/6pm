import type { ApiLanguage } from '@6pm/domain';
import type { Language } from '@6pm/i18n';

/**
 * Whether 6pm's models word text in this language: the server's and the phone's write English
 * and Vietnamese, and check what they write against those two. In every other language the
 * catalogue's own line is said instead of a model's.
 */
export function modelsWord(language: Language): language is ApiLanguage {
  return language === 'en' || language === 'vi';
}

/**
 * The language a request names to the server, which knows English and Vietnamese: the app's own
 * when it is one of them, else English (a receipt, a voice or a registration reads the same).
 */
export function apiLanguageOf(language: Language): ApiLanguage {
  return modelsWord(language) ? language : 'en';
}
