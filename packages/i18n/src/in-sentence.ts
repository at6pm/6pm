import type { Language } from './catalogue-types';

/**
 * Languages that write month and weekday names in lower case inside a sentence ("Tu termines
 * octobre", "Terminaste octubre", "khép lại tháng 10"). English, German and Indonesian keep the
 * capital; the others have no case.
 */
const LOWER_IN_SENTENCE: ReadonlySet<Language> = new Set(['es', 'fr', 'vi']);

/**
 * A month or weekday name as it is written inside a sentence. Phones write a name on its own
 * capitalised in some languages ("Tháng 10"), and labels capitalise it everywhere ("Octobre").
 */
export function inSentence(name: string, language: Language): string {
  if (!LOWER_IN_SENTENCE.has(language)) return name;
  return name.charAt(0).toLocaleLowerCase(language) + name.slice(1);
}
