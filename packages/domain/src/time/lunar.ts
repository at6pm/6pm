import { addDays, diffDays, makeDate, parts, type LocalDate } from './local-date';

/**
 * Whose Lunar New Year: Vietnam's Tết (UTC+7), Korea's Seollal (UTC+9) or China's Spring Festival
 * (UTC+8). The calendars are the same reckoning on three clocks, so a new moon just before
 * midnight in Hà Nội can start Tết a day before Seollal (2027, 2028) or a day before 春节 (2030).
 */
export type LunarTradition = 'tet' | 'seollal' | 'chunjie';

/** One year's row: mùng 1 tháng Giêng (as 'MM-DD') and how long tháng Chạp is (29 or 30 days). */
type NewYearRow = readonly [newYear: string, monthTwelve: 29 | 30];

/**
 * Lunar New Year, 2027 to 2040, per tradition. Worked out with Hồ Ngọc Đức's algorithm for the
 * Vietnamese lunar calendar (https://www.informatik.uni-leipzig.de/~duc/amlich/calrules.html) at
 * each country's meridian, and checked against published calendars: for Tết, the lunar calendars
 * of Báo Hà Tĩnh (https://baohatinh.vn/cong-cu/lich-am) and Vietnamese Wikipedia (Tết 2027 is
 * Saturday 6 Feb; Tết 2030 is Saturday 2 Feb, a day before China's); for Seollal, the Korea
 * Astronomy and Space Science Institute's calendar data (https://astro.kasi.re.kr, 1/1 of 2028 is
 * 27 Jan); for China, the Hong Kong Observatory's Gregorian–Lunar tables. The second value is the
 * length of the twelfth month, which puts its 23rd (Ông Công Ông Táo) where it belongs.
 */
const TABLE: Readonly<Record<LunarTradition, Readonly<Record<number, NewYearRow>>>> = {
  tet: {
    2027: ['02-06', 29],
    2028: ['01-26', 29],
    2029: ['02-13', 29],
    2030: ['02-02', 29],
    2031: ['01-23', 29],
    2032: ['02-11', 29],
    2033: ['01-31', 30],
    2034: ['02-19', 30],
    2035: ['02-08', 30],
    2036: ['01-28', 30],
    2037: ['02-15', 30],
    2038: ['02-04', 30],
    2039: ['01-24', 29],
    2040: ['02-12', 29],
  },
  chunjie: {
    2027: ['02-06', 29],
    2028: ['01-26', 29],
    2029: ['02-13', 29],
    2030: ['02-03', 30],
    2031: ['01-23', 29],
    2032: ['02-11', 29],
    2033: ['01-31', 30],
    2034: ['02-19', 30],
    2035: ['02-08', 30],
    2036: ['01-28', 30],
    2037: ['02-15', 30],
    2038: ['02-04', 30],
    2039: ['01-24', 29],
    2040: ['02-12', 29],
  },
  seollal: {
    2027: ['02-07', 30],
    2028: ['01-27', 30],
    2029: ['02-13', 29],
    2030: ['02-03', 30],
    2031: ['01-23', 29],
    2032: ['02-11', 29],
    2033: ['01-31', 30],
    2034: ['02-19', 30],
    2035: ['02-08', 29],
    2036: ['01-28', 30],
    2037: ['02-15', 30],
    2038: ['02-04', 30],
    2039: ['01-24', 29],
    2040: ['02-12', 29],
  },
};

/** The years the table knows. Outside them there is no season: nothing is shown or asked. */
export const LUNAR_FIRST_YEAR = 2027;
export const LUNAR_LAST_YEAR = 2040;

/** The season's last day: mùng 6, when offices open again. */
const LAST_HOLIDAY = 6;
/** The season's first day: the 23rd of the twelfth month (Ông Công Ông Táo). */
const FIRST_DAY_OF_SEASON = 23;

/** Mùng 1 of the lunar year that begins in `year`, or null outside the table. */
export function lunarNewYear(year: number, tradition: LunarTradition): LocalDate | null {
  const row = TABLE[tradition][year];
  if (!row) return null;
  const [month, day] = row[0].split('-').map(Number);
  return makeDate(year, month ?? 1, day ?? 1);
}

/** The New Year season of one year: the 23rd of the twelfth month through mùng 6. */
export interface NewYearWindow {
  readonly tradition: LunarTradition;
  /** The Gregorian year mùng 1 falls in. */
  readonly year: number;
  /** The 23rd of tháng Chạp. */
  readonly start: LocalDate;
  /** Mùng 1. */
  readonly newYear: LocalDate;
  /** Mùng 6, the season's last day. */
  readonly end: LocalDate;
}

/** The season of the lunar year beginning in `year`, or null outside the table. */
export function newYearWindow(year: number, tradition: LunarTradition): NewYearWindow | null {
  const newYear = lunarNewYear(year, tradition);
  const row = TABLE[tradition][year];
  if (newYear === null || !row) return null;
  return {
    tradition,
    year,
    start: addDays(newYear, FIRST_DAY_OF_SEASON - 1 - row[1]),
    newYear,
    end: addDays(newYear, LAST_HOLIDAY - 1),
  };
}

/**
 * The season that holds `day` or comes next: this year's while it has not ended, else next year's.
 * Null once the table runs out.
 */
export function nextNewYearWindow(day: LocalDate, tradition: LunarTradition): NewYearWindow | null {
  const { year } = parts(day);
  for (const y of [year, year + 1]) {
    const window = newYearWindow(y, tradition);
    if (window !== null && window.end >= day) return window;
  }
  return null;
}

/** Whether `day` is inside a season (23 tháng Chạp to mùng 6). */
export function inNewYearWindow(day: LocalDate, window: NewYearWindow | null): boolean {
  return window !== null && day >= window.start && day <= window.end;
}

/**
 * Where a day stands in the season, for Today's kicker: counting down from 23 tháng Chạp ("7 days
 * to Tết", `left` days to mùng 1 out of `lanterns`), or the holiday (`mung` 1 to 6). Null outside
 * the season.
 */
export type SeasonDay =
  | {
      readonly kind: 'countdown';
      readonly window: NewYearWindow;
      /** Days from `day` to mùng 1: 7 on 23 tháng Chạp of a 29-day month. */
      readonly left: number;
      /** The lanterns on the string: the days the countdown started with. */
      readonly lanterns: number;
    }
  | { readonly kind: 'holiday'; readonly window: NewYearWindow; readonly mung: number };

export function seasonDay(day: LocalDate, tradition: LunarTradition | null): SeasonDay | null {
  if (tradition === null) return null;
  const window = nextNewYearWindow(day, tradition);
  if (window === null || !inNewYearWindow(day, window)) return null;
  if (day >= window.newYear) {
    return { kind: 'holiday', window, mung: diffDays(day, window.newYear) + 1 };
  }
  return {
    kind: 'countdown',
    window,
    left: diffDays(window.newYear, day),
    lanterns: diffDays(window.newYear, window.start),
  };
}
