/** What the phone's settings say about where its person's money is. No location is read. */
export interface HomeSigns {
  /** The currency of the phone's region (ISO 4217), if it has one. */
  readonly regionCurrency: string | null;
  /** The phone's languages, most wanted first ("vi-US", "en-US"). */
  readonly languageTags: readonly string[];
  /** The time zone the phone's clock is in ("Asia/Ho_Chi_Minh"). */
  readonly timeZone: string | null;
}

export interface HomeGuess {
  /** The currency a new plan starts in. */
  readonly code: string;
  /**
   * Every currency the signs point at, the guess first. More than one means the phone is of two
   * minds (an iPhone in Vietnam whose region is the United States), and the person is shown the
   * choice instead of finding out later.
   */
  readonly candidates: readonly string[];
}

/** What a phone with no region is counted in. */
const NO_REGION = 'USD';
const VIETNAM_ZONES: readonly string[] = ['Asia/Ho_Chi_Minh', 'Asia/Saigon'];

const isCode = (code: string | null): code is string => code !== null && /^[A-Za-z]{3}$/.test(code);

/**
 * The currency a new plan starts in. The region's, except that a phone whose clock is in Vietnam
 * counts in đồng whatever its region says: many iPhones there are set to the United States. A
 * phone in Vietnamese somewhere else keeps its region's currency, with đồng as the other choice.
 */
export function guessHomeCurrency(signs: HomeSigns): HomeGuess {
  const region = isCode(signs.regionCurrency) ? signs.regionCurrency.toUpperCase() : NO_REGION;
  const clockInVietnam = signs.timeZone !== null && VIETNAM_ZONES.includes(signs.timeZone);
  const inVietnamese = (signs.languageTags[0] ?? '').toLowerCase().startsWith('vi');
  if (region === 'VND') return { code: 'VND', candidates: ['VND'] };
  if (clockInVietnam) return { code: 'VND', candidates: ['VND', region] };
  if (inVietnamese) return { code: region, candidates: [region, 'VND'] };
  return { code: region, candidates: [region] };
}
