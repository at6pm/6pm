import type { Vnd } from '../money/format';
import { diffDays, type LocalDate } from '../time/local-date';
import type { NewYearWindow } from '../time/lunar';

/** A spend or money in, as the recap reads it. */
export interface RecapSpend {
  readonly day: LocalDate;
  readonly amount: Vnd;
  readonly status: string;
  readonly categoryId: string;
  readonly direction?: 'in' | 'out' | null | undefined;
  readonly envelopes?: number | null | undefined;
  readonly fromPot?: string | null | undefined;
  readonly fromPotAmount?: Vnd | null | undefined;
}

/** Envelopes and what they held. */
export interface EnvelopeCount {
  readonly envelopes: number;
  readonly amount: Vnd;
}

/** "Tết của tôi": the season in one envelope, for the recap card after mùng 6. */
export interface NewYearRecap {
  readonly window: NewYearWindow;
  /** Lì xì given: spending in the Lì xì category inside the season. */
  readonly given: EnvelopeCount;
  /** Lì xì received: money in, in the Lì xì category, inside the season. */
  readonly received: EnvelopeCount;
  /** The season's jar: what the season's spends took from it, and what it held for them. */
  readonly jar: {
    readonly id: string;
    readonly used: Vnd;
    readonly held: Vnd;
    /** `used` as a share of `held`, 0 to 1; 0 with nothing held. */
    readonly share: number;
  } | null;
  /** Closed days of the season whose spending stayed inside the day's number. */
  readonly daysInside: number;
  /** Days of the season so far (all of it once it has ended). */
  readonly days: number;
}

const counted = (s: RecapSpend) => s.status === 'kept';

/**
 * The season's recap: lì xì given and received (envelopes and đồng), the season's jar used, and
 * the days inside the number. `jarLeft` is what the jar holds now, so used plus left is what it
 * held for the season. Days count from 23 tháng Chạp to `today` or mùng 6, whichever is first.
 */
export function newYearRecap(input: {
  readonly window: NewYearWindow;
  readonly today: LocalDate;
  readonly spends: readonly RecapSpend[];
  /** The Lì xì category's id; null when it was never made. */
  readonly lixiCategoryId: string | null;
  readonly jar: { readonly id: string; readonly left: Vnd } | null;
  readonly closedDays: readonly {
    readonly day: LocalDate;
    readonly spent: Vnd;
    readonly line: Vnd;
  }[];
}): NewYearRecap {
  const { window } = input;
  const inside = (day: LocalDate) => day >= window.start && day <= window.end;
  const season = input.spends.filter((s) => inside(s.day) && counted(s));
  const lixi = season.filter(
    (s) => input.lixiCategoryId !== null && s.categoryId === input.lixiCategoryId,
  );
  const tally = (rows: readonly RecapSpend[]): EnvelopeCount => ({
    envelopes: rows.reduce((n, s) => n + Math.max(1, s.envelopes ?? 1), 0),
    amount: rows.reduce((n, s) => n + s.amount, 0),
  });
  const jar = input.jar;
  const used =
    jar === null
      ? 0
      : season
          .filter((s) => s.direction !== 'in' && s.fromPot === jar.id)
          .reduce((n, s) => n + Math.min(s.amount, s.fromPotAmount ?? s.amount), 0);
  const held = used + Math.max(0, jar?.left ?? 0);
  const last = input.today < window.end ? input.today : window.end;
  return {
    window,
    given: tally(lixi.filter((s) => s.direction !== 'in')),
    received: tally(lixi.filter((s) => s.direction === 'in')),
    jar: jar === null ? null : { id: jar.id, used, held, share: held > 0 ? used / held : 0 },
    daysInside: input.closedDays.filter((d) => inside(d.day) && d.day <= last && d.spent <= d.line)
      .length,
    days: last < window.start ? 0 : diffDays(last, window.start) + 1,
  };
}
