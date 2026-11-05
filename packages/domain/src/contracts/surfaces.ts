import { z } from 'zod';

import { DECIMAL_PATTERN } from '../travel/fx';
import { MEMO_MAX } from './local-rows';

/**
 * What the app and its extensions hand each other through the App Group. Extensions never open the
 * money database: they leave one inbox file per capture for the app to import, and read what the
 * app writes for them. Every file carries `v`; a reader drops a version it does not know. The
 * Swift side mirrors these as Codable types.
 */

const id = z.string().min(1);
const instant = z.string().min(20);
/** In minor units of the home currency (đồng in Vietnam, cents in the US). */
const money = z.number().int().nonnegative();
const version = z.literal(1);
const currencyCode = z.string().regex(/^[A-Z]{3}$/);
const decimal = z.string().regex(DECIMAL_PATTERN);

/**
 * Fields added after a version shipped are optional, so either side reads the other's older files:
 * a context or an item without a home currency is in đồng.
 */
export const SURFACES_VERSION = 1;

/** The receipt behind a shared capture: what the bank printed, with every number taken out. */
export const inboxReceiptSchema = z.object({
  bank: z.string().min(1).optional(),
  code: z.string().min(1).optional(),
  namingLines: z.array(z.string()),
  /** False when the payee's name was a guess the user did not check; absent on older files. */
  payeeSure: z.boolean().optional(),
  /** The transfer's own words ("Nội dung"), where a repayment is named; absent on older files. */
  memo: z.string().min(1).max(MEMO_MAX).optional(),
  /** The photo went once for the server's closer look; absent when it was read on the phone alone. */
  looked: z.boolean().optional(),
  /**
   * What the phone read, where the person changed it on the card before saving (the amount in the
   * home currency, the shop): the receipt was not read right the first time. Absent when nothing
   * read was changed, and on older files.
   */
  read: z.object({ amount: money.nullable().optional(), payee: z.string().optional() }).optional(),
});

export const inboxSpendSchema = z.object({
  v: version,
  id: z.uuid(),
  kind: z.literal('spend'),
  source: z.enum(['shared', 'applePay', 'voice', 'alert']),
  status: z.enum(['caught', 'kept']),
  at: instant,
  /** Null when the source gave no readable amount, or none in the home currency yet. */
  amount: money.nullable(),
  /** The home currency `amount` is counted in; absent in files from before it was said (đồng). */
  currency: currencyCode.optional(),
  merchant: z.string(),
  categoryId: id.nullable(),
  note: z.string().optional(),
  receipt: inboxReceiptSchema.optional(),
  /**
   * A spend in another currency, as printed: `amount` in its own units. With `rate` (home units
   * for one unit) the item's `amount` is already in the home currency at that rate; without one
   * it is null and the app prices it when a rate arrives.
   */
  foreign: z
    .object({ currency: currencyCode, amount: decimal, rate: decimal.optional() })
    .optional(),
  /**
   * The receipt printed no currency and the one saved was guessed (from where the photo was
   * taken, the place it names, the trip, or the home currency by default); absent when it was printed, picked
   * by the user, or on older files.
   */
  currencyGuessed: z.boolean().optional(),
  /** `in` for money that came in (a bank alert or receipt that says so); absent means spending. */
  direction: z.enum(['out', 'in']).optional(),
});
export type InboxSpend = z.infer<typeof inboxSpendSchema>;

/** "Paid" tapped on the Live Activity of a payment that was waiting. */
export const inboxPaidSchema = z.object({
  v: version,
  id: z.uuid(),
  kind: z.literal('paid'),
  spendId: id,
  at: instant,
});
export type InboxPaid = z.infer<typeof inboxPaidSchema>;

/**
 * Confirm, tapped on Android's caught notification: the payment it names is kept. Written after
 * the payment, so it is applied after it when both are waiting.
 */
export const inboxKeptSchema = z.object({
  v: version,
  id: z.uuid(),
  kind: z.literal('kept'),
  spendId: id,
  at: instant,
});
export type InboxKept = z.infer<typeof inboxKeptSchema>;

export const inboxItemSchema = z.discriminatedUnion('kind', [
  inboxSpendSchema,
  inboxPaidSchema,
  inboxKeptSchema,
]);
export type InboxItem = z.infer<typeof inboxItemSchema>;

/** What the share extension and the shortcuts need to file a spend without the database. */
export const surfaceContextSchema = z.object({
  v: version,
  /** The app's language, as its `.lproj` folder is named: "en", "vi", "zh-Hans"… */
  language: z.string().min(1).max(16),
  host: z.string().min(1),
  categories: z.array(
    z.object({
      id,
      name: z.string().min(1),
      icon: z.string().min(1),
      tile: z.string(),
      glyph: z.string(),
      countsDaily: z.boolean(),
    }),
  ),
  rules: z.array(z.object({ key: z.string().min(1), categoryId: id })),
  safeToday: z.number().int(),
  strings: z.record(z.string(), z.string()),
  /** The trip under way in Travel mode: its currency is the guess for a receipt that says none. */
  travel: z.object({ currency: currencyCode }).nullable().optional(),
  /**
   * The last rates the app has, as the server quotes them (đồng for one unit), so a foreign
   * receipt is priced as Travel is. A home other than đồng is priced through its own quote.
   */
  rates: z.array(z.object({ currency: currencyCode, rate: decimal })).optional(),
  /** The home currency; absent (đồng) in a context written before it was kept. */
  currency: currencyCode.optional(),
  /** How the phone writes numbers, so the extensions write money as the app does. */
  numberStyle: z
    .object({
      languageTag: z.string().nullable().optional(),
      decimal: z.string().nullable().optional(),
      group: z.string().nullable().optional(),
    })
    .optional(),
});
export type SurfaceContext = z.infer<typeof surfaceContextSchema>;

/** One stretch of time a widget shows, from `from` until the next entry. Text is preformatted. */
export const surfaceEntrySchema = z.object({
  from: instant,
  safeText: z.string(),
  safeShort: z.string(),
  tomorrowText: z.string(),
  pendingText: z.string(),
  ringFraction: z.number().min(0).max(1),
  list: z.array(
    z.object({
      name: z.string(),
      amountText: z.string(),
      icon: z.string(),
      hue: z.number(),
      pending: z.boolean(),
    }),
  ),
  moreText: z.string(),
  /** "155k spent", under the large widget's bar; absent in files from before it was drawn. */
  spentText: z.string().optional(),
  /** "of 400k": the day's line, beside `spentText`. */
  lineText: z.string().optional(),
  /** How much of the line is spent, 0 to 1: the bar's fill. */
  spentFraction: z.number().min(0).max(1).optional(),
  /** "40.000₫": what the spends past the list add up to, beside `moreText`. */
  moreAmountText: z.string().optional(),
  /**
   * The postcard this stretch shows, as the widgets' design words it: absent in files from before
   * the postcards. Every word is in the app's language and every amount already formatted.
   */
  card: z
    .object({
      /** `day` before the close, `due` from the close until it is made, `closed` after it. */
      phase: z.enum(['day', 'due', 'closed']),
      /** The hour of the sky it is drawn in (16.5 is half past four). */
      hour: z.number().min(0).max(24),
      /** "FRIDAY · SAFE TO SPEND", "IT’S SIX · CLOSE YOUR DAY", "CLOSED · TOMORROW". */
      kicker: z.string(),
      /** The small widget's: "FRI · TODAY", "IT’S SIX", "TOMORROW". */
      kickerShort: z.string(),
      /** "351.000": the medium widget's number, without its symbol. */
      number: z.string(),
      /** "351.000₫": the Lock Screen card's. */
      amount: z.string(),
      /** "All of it, still.", "165k used · 3 caught", "4 waiting for the close". */
      sub: z.string(),
      /** "safe to spend", "left today", "tap to close", "closed 18:04". */
      subShort: z.string(),
      /** "Fri 9 · 49k left", and the same with the amount hidden. */
      inline: z.string(),
      inlineHidden: z.string(),
      /** Under the Lock Screen card's number: "close at 18:00", "4 waiting · it’s six". */
      lockSub: z.string(),
      /** The large widget's foot: "Close at 18:00", "4 to confirm", "Closed 18:04". */
      tonight: z.string(),
      /** How much of the day's line is used, 0 to 1: the medium widget's bar. */
      used: z.number().min(0).max(1),
      /** Where the sun stands, in fractions of the widget (medium, then small). */
      sun: z.object({ x: z.number(), y: z.number(), xs: z.number(), ys: z.number() }),
      /** The sun this hour: the day's, the evening's, or the moon. */
      sunKind: z.enum(['day', 'noon', 'dusk', 'night']),
      /** "18:04" on the CLOSED stamp, once the day is closed. */
      closedAt: z.string().optional(),
    })
    .optional(),
});

/** A colour stop of a gradient the app worked out: a CSS colour at 0 to 1. */
const stopSchema = z.tuple([z.string(), z.number()]);

/** A CSS box shadow, in points: what the sun glows with and the neon lids hum with. */
const shadowSchema = z.object({
  x: z.number(),
  y: z.number(),
  blur: z.number(),
  spread: z.number(),
  color: z.string(),
});

/** What a jar, a sun or a day's dot is filled with. */
const fillSchema = z.object({
  kind: z.enum(['solid', 'radial', 'linear', 'dots', 'stripes']),
  stops: z.array(stopSchema),
  /** A radial fill's centre, in fractions of the shape. */
  center: z.tuple([z.number(), z.number()]).optional(),
  /** A linear fill's angle, CSS degrees (180 is top to bottom). */
  angle: z.number().optional(),
});

/** One of the person's jars, as the widgets draw it. */
export const surfaceJarSchema = z.object({
  id: id,
  name: z.string(),
  /** The Lock Screen jar's label: "TẾT". */
  label: z.string(),
  /** The Material Symbols glyph itself (its private-use character). */
  icon: z.string(),
  /** How full, 0 to 1. */
  level: z.number().min(0).max(1),
  /** "3,1tr" under the medium widget's jar. */
  amountText: z.string(),
  /** "3,1tr of 7tr" on the small one. */
  ofText: z.string(),
  /** "Sat 6 Feb": the day it counts down to; empty for a jar with no date. */
  dayText: z.string(),
  /** "119", and "days" under it; for a jar with no date, how full it is. */
  countText: z.string(),
  countUnit: z.string(),
  /** Its colours: what it holds, the line on top, the lid, the glass, the icon low and high. */
  fill: z.string(),
  fillTop: z.string(),
  lid: z.string(),
  glass: z.string(),
  iconLow: z.string(),
  iconHigh: z.string(),
  /** The season's jar. */
  newYear: z.boolean(),
  /** The app's link to the jar's page. */
  path: z.string(),
});
export type SurfaceJar = z.infer<typeof surfaceJarSchema>;

/** The look's widget materials: its sun, its jars, its dots, its type (`widgetInks` in theme). */
const sunSchema = z.object({ fill: fillSchema, shadows: z.array(shadowSchema) }).nullable();
const ringSchema = z.object({ width: z.number(), color: z.string() });

export const surfaceLookSchema = z.object({
  id: z.string(),
  /** A ground the look's widgets wear instead of the sky (Basic: the system's white and grey). */
  ground: z.object({ day: z.string(), night: z.string() }).nullable(),
  suns: z.object({ day: sunSchema, noon: sunSchema, dusk: sunSchema, night: sunSchema }),
  /** The sun's width over its height (a lantern is taller than wide); 1 is round. */
  sunAspect: z.number(),
  /** A ring the sun is drawn as instead of a disc (Neon Alley's tube). */
  sunRing: ringSchema.nullable(),
  /** The crease of Cà Phê's bean. */
  sunCrease: z.string().nullable(),
  /** Inset lines round the whole widget, outermost first. */
  frame: z.array(ringSchema),
  /** The month's dots: a whole sun, half a sun, a missed evening's ring. */
  dots: z.object({
    full: fillSchema,
    half: fillSchema,
    ring: z.string(),
    aspect: z.number(),
    fullRing: ringSchema.nullable(),
    glow: shadowSchema.nullable(),
    crease: z.string().nullable(),
  }),
  jar: z.object({
    /** Null for each jar's own lid and glass, and an edge in the sky's ink. */
    lid: z.string().nullable(),
    body: fillSchema.nullable(),
    edge: z.object({ width: z.number(), color: z.string().nullable() }),
    lidRadius: z.number(),
    /** Its corners, top and bottom, in points at the medium widget's 34 pt jar. */
    radiusTop: z.number(),
    radiusBottom: z.number(),
    lidGlow: shadowSchema.nullable(),
    glow: shadowSchema.nullable(),
    /** What each jar holds, by place on the shelf; empty for each jar's own colour. */
    fills: z.array(fillSchema),
    /** The jar's icon is drawn on its glass. */
    icon: z.boolean(),
  }),
  /** The number's offset print, always; its glow once the sky is dark. */
  numberShadows: z.array(shadowSchema),
  numberGlow: z.array(shadowSchema),
  /** The display face's weight, and the medium and small numbers' sizes. */
  displayWeight: z.number(),
  numberMedium: z.number(),
  numberSmall: z.number(),
  /** Its tracking, in em. */
  numberTracking: z.number(),
  /** The kickers are set in the mono face; false sets them in the interface face. */
  mono: z.boolean(),
  /** The streak widget's ground, and its line and words. */
  streakGround: z.string(),
  streakLine: z.string(),
  streakWord: z.string(),
  /** The open evening's hatch and the accent ring of today. */
  hatch: z.string(),
  today: z.string(),
});
export type SurfaceLook = z.infer<typeof surfaceLookSchema>;

/** What the widgets draw: every number and word decided by the app, in its language. */
export const surfaceSnapshotSchema = z.object({
  v: version,
  writtenAt: instant,
  maxLook: z.string().nullable(),
  serious: z.boolean(),
  entries: z.array(surfaceEntrySchema),
  palettes: z.array(z.object({ hour: z.number().int(), tokens: z.record(z.string(), z.string()) })),
  strings: z.record(z.string(), z.string()),
  /** The person asked for amounts to stay hidden until the phone is unlocked. */
  hideAmounts: z.boolean().optional(),
  /** Future you first, then the season's jar, then the rest as they were made. */
  jars: z.array(surfaceJarSchema).optional(),
  /** The evenings closed in a row: how many, and each one's sky, oldest first. */
  streak: z
    .object({
      count: z.number().int().nonnegative(),
      /** The sky each evening closed under, as three stops left to right. */
      bands: z.array(z.tuple([z.string(), z.string(), z.string()])),
      /** Today is still open: a hatched band waits for it. */
      open: z.boolean(),
    })
    .optional(),
  /** The month as suns: "OCTOBER · CLOSED AT SIX", "8 sunsets, 6 inside the line.". */
  month: z
    .object({
      title: z.string(),
      headline: z.string(),
      cells: z.array(z.enum(['sun', 'half', 'miss', 'today', 'ahead', 'blank'])),
    })
    .optional(),
  look: surfaceLookSchema.optional(),
  /** The app's links: Today, the Diary's month, the streak's share. */
  links: z.object({ today: z.string(), month: z.string(), streak: z.string() }).optional(),
  /** Development builds only: the clock the app was pinned to, which the widgets then follow. */
  pinnedAt: instant.optional(),
});
export type SurfaceSnapshot = z.infer<typeof surfaceSnapshotSchema>;

/**
 * The close at six, as a Live Activity: "It’s six. Close your day.", a slip for each spend waiting
 * for it, and Start, which opens the close.
 */
export const closeActivitySchema = z.object({
  v: version,
  /** The money day it is the close of. */
  day: z.string(),
  title: z.string(),
  /** "4 waiting", "Nothing waiting". */
  detail: z.string(),
  /** How many slips to draw (at most a handful). */
  slips: z.number().int().nonnegative(),
  start: z.string(),
  path: z.string(),
  /** The Material Symbols glyph of the close (its private-use character). */
  icon: z.string(),
  accent: z.string(),
  onAccent: z.string(),
  paper: z.string(),
});
export type CloseActivityState = z.infer<typeof closeActivitySchema>;

/** A currency the card's Edit state can switch to, with its rate when the app has one. */
export const shareCurrencySchema = z.object({
  code: currencyCode,
  /** "S$ · SGD", "₫ · VND". */
  label: z.string(),
  /** Home units for one unit; null for the home currency, or without a rate. */
  rate: decimal.nullable(),
});
export type ShareCurrency = z.infer<typeof shareCurrencySchema>;

/**
 * An amount in pieces for Swift to draw: the home currency's symbol on its own side ("$" before,
 * "₫" after), trimmed, so it can be set smaller. A foreign amount is all `number` ("S$68,80").
 */
export const amountPartsSchema = z.object({
  prefix: z.string(),
  number: z.string(),
  suffix: z.string(),
});
export type AmountParts = z.infer<typeof amountPartsSchema>;

/** The card the share extension shows for a receipt, as the domain bundle returns it to Swift. */
export const shareCardSchema = z.object({
  /** In the home currency: as read, or a foreign amount at the app's rate. Null when unread or unpriced. */
  amount: money.nullable(),
  /** The home currency the card was read for. */
  home: currencyCode,
  payee: z.string(),
  payeeSure: z.boolean(),
  at: instant,
  /** The receipt printed when it was paid; false when `at` is the time it was shared. */
  atRead: z.boolean(),
  code: z.string().nullable(),
  bank: z.string().nullable(),
  categoryId: id.nullable(),
  /** "120.000₫", or "S$68,80" for a receipt in another currency. */
  amountText: z.string(),
  /** `amountText` in pieces. */
  amountParts: amountPartsSchema,
  safeAfterText: z.string().nullable(),
  /** The category's name in the app's language, for the Category row. */
  categoryName: z.string().nullable(),
  /** The When row: "Today · 16:40", "09/10 · 16:40". */
  whenText: z.string(),
  /** The receipt's lines with every number taken out, kept on the inbox item for naming. */
  namingLines: z.array(z.string()),
  /** A bank or wallet transfer, or a shop's bill. */
  kind: z.enum(['transfer', 'shop']),
  /** The receipt's currency; null when its amounts cannot be home's and nothing says what they are. */
  currency: currencyCode.nullable(),
  currencySure: z.boolean(),
  /** A shop receipt whose currency was not printed: the card offers it as a chip to switch. */
  currencyGuessed: z.boolean(),
  totalSure: z.boolean(),
  /** The row of the receipt (in reading order) the total was read from. */
  totalLine: z.number().int().nonnegative().nullable(),
  /** The total as printed, in the receipt's own units ("68.8"). */
  printed: decimal.nullable(),
  /** A foreign total with the rate it was priced at, null when there is no rate yet. */
  foreign: z
    .object({ currency: currencyCode, amount: decimal, rate: decimal.nullable() })
    .nullable(),
  /** "1.747.000₫" (the home currency) under a foreign amount priced at a rate. */
  inHomeText: z.string().nullable(),
  /** What the amount field opens with in Edit: "120.000", "68,80". */
  editText: z.string(),
  /** The amount is typed with decimals (a currency with cents). */
  decimalEntry: z.boolean(),
  /**
   * Currencies the card can switch between: when the currency is a guess, the guess, home and
   * the likely ones; else the one read, the trip's and home. Empty when the receipt's own is
   * certain.
   */
  currencies: z.array(shareCurrencySchema),
  /** The reading is unsure of the total or the currency, and the photo is worth a closer look. */
  needsCheck: z.boolean(),
  /** The server took its closer look at the photo; absent when the phone read it alone. */
  looked: z.boolean().optional(),
  /** A transfer's own words ("Nội dung"), kept on the inbox item; absent when it printed none. */
  memo: z.string().min(1).max(MEMO_MAX).nullable().optional(),
});
export type ShareCard = z.infer<typeof shareCardSchema>;

/** What logging a spend from a shortcut returns: the inbox item and the snippet's lines. */
export const logSpendResultSchema = z.object({
  item: inboxSpendSchema.nullable(),
  /** Set when the amount could not be read and Siri should ask again. */
  needsAmount: z.boolean(),
  amountText: z.string(),
  title: z.string(),
  safeAfterText: z.string().nullable(),
});
export type LogSpendResult = z.infer<typeof logSpendResultSchema>;

/**
 * The last bank or wallet alert the "Catch a bank alert" shortcut read, caught or skipped, written
 * to `<group>/status/last-alert.json` so Settings can say the automation is running.
 */
export const lastAlertSchema = z.object({
  v: version,
  /** When it was read. */
  at: instant,
  /** The bank or wallet's short name, when the alert said which. */
  bank: z.string().nullable(),
  /** "50.000₫" for money that moved; empty for one that was skipped. */
  amountText: z.string(),
  direction: z.enum(['out', 'in']).optional(),
  /** Why it was skipped: a code, a failed payment, a promotion, a balance or security notice. */
  skipped: z.enum(['code', 'failed', 'promo', 'balance', 'security', 'unread']).optional(),
});
export type LastAlert = z.infer<typeof lastAlertSchema>;

/** What reading one alert returns: the inbox item (null when skipped) and the status line. */
export const bankAlertResultSchema = z.object({
  item: inboxSpendSchema.nullable(),
  last: lastAlertSchema,
});
export type BankAlertResult = z.infer<typeof bankAlertResultSchema>;
