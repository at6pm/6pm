import { incomeInk } from './income-inks';
import { oklchSrgbHex } from './oklch';
import { PAPER } from './share-inks-types';

/**
 * The cards for money that is not one salary, in each look (the Money Reaches You canvas, board
 * 10, drawn in Golden Hour): Today's ruler drawn large, pays as paper and the one kept in hand,
 * work's bars by day and by month, and the receipt sent back to a client. Work is the lavender of
 * the tab bar's indigo on a dark sky and the indigo itself on a light one, as everywhere in 6pm;
 * the best day or month takes the look's sun. Colours are CSS strings the card's art draws.
 */
export interface CardWorkInks {
  /** A day covered through the day the money lasts to, and a day in hand after it. */
  readonly covered: string;
  readonly inHand: string;
  /** A usual pay as paper (its ruled sheet), and the line around it where the sky is light. */
  readonly pay: string;
  readonly payEdge: string;
  /** The pay kept in hand: its fill, its edge (a box-shadow) and its days as dots. */
  readonly kept: string;
  readonly keptEdge: string;
  readonly keptDot: string;
  /** A day's takings or a month's work, and the best of them. */
  readonly bar: string;
  readonly best: string;
  /** A day the shop was shut, drawn as a dot. */
  readonly shut: string;
  /** The dashed edge of a month still to come. */
  readonly toCome: string;
  /** The receipt a client is thanked with: paper, its inks, its dashed rule, the PAID stamp. */
  readonly receipt: {
    readonly paper: string;
    readonly ink: string;
    readonly soft: string;
    readonly rule: string;
    readonly stamp: string;
    readonly shadow: string;
  };
}

/** Work on a dark sky (`workInk.onDark`, the board's oklch(.84 .08 275)). */
const LAVENDER = oklchSrgbHex(0.84, 0.08, 275);
/** Work on a light sky (`workInk.paper`). */
const INDIGO = oklchSrgbHex(0.42, 0.13, 275);
/** The paper a usual pay is drawn on, ruled every 8 pt. */
const PAY_PAPER =
  'repeating-linear-gradient(180deg, transparent 0px 7px, rgba(43,37,48,.08) 7px 8px), #f4efe4';

const RECEIPT = {
  paper: PAPER.paper,
  ink: PAPER.ink,
  soft: 'rgba(43,37,48,.55)',
  rule: 'rgba(43,37,48,.3)',
  stamp: oklchSrgbHex(0.45, 0.12, 150),
  shadow: '0 16px 24px rgba(20,10,30,.35)',
} as const;

/** The inks on a dark sky: the look's ink to the end of the stretch, lavender after it. */
function onDark(ink: string, best: string, soft: string): CardWorkInks {
  return {
    covered: ink,
    inHand: LAVENDER,
    pay: PAY_PAPER,
    payEdge: 'none',
    kept: incomeInk.inHand,
    keptEdge: `inset 0 0 0 2px ${ink}`,
    keptDot: incomeInk.inHandDot,
    bar: LAVENDER,
    best,
    shut: soft,
    toCome: soft,
    receipt: RECEIPT,
  };
}

/** The inks on a light sky: the look's ink, the in-hand lavender deepened, work in indigo. */
function onLight(ink: string, best: string, soft: string): CardWorkInks {
  return {
    covered: ink,
    inHand: incomeInk.rulerInHand.light,
    pay: PAY_PAPER,
    payEdge: 'inset 0 0 0 1px rgba(43,37,48,.18)',
    kept: incomeInk.inHand,
    keptEdge: 'none',
    keptDot: incomeInk.inHandDot,
    bar: INDIGO,
    best,
    shut: soft,
    toCome: soft,
    receipt: { ...RECEIPT, shadow: '0 12px 20px rgba(70,45,30,.18)' },
  };
}

/** Each look's work inks, as the share inks tabulate the looks. */
export const workCardInks = {
  golden: onDark('#fbf4ec', '#ffc46b', 'rgba(251,244,236,.3)'),
  lacquer: onDark('#f6ead3', '#e8c070', 'rgba(226,184,99,.35)'),
  glaze: onLight('#101c3a', '#3c5cc0', 'rgba(31,64,156,.3)'),
  riso: { ...onLight('#1d2b62', '#ff4fa8', 'rgba(47,76,176,.4)'), bar: '#2f4cb0' },
  monsoon: onDark('#eef3f3', '#c8eee6', 'rgba(238,243,243,.28)'),
  cafe: onLight('#2a170d', '#b07a42', 'rgba(58,34,22,.25)'),
  neon: { ...onDark('#f4f6f4', '#ff4f9e', 'rgba(244,246,244,.22)'), inHand: '#46e3ea' },
  expo: onDark('#f3f1ec', '#ffb347', 'rgba(243,241,236,.25)'),
  paper: onLight('#2a221c', '#ffd36e', 'rgba(42,34,28,.25)'),
  lantern: onDark('#fbefdc', '#ffc23a', 'rgba(255,220,160,.3)'),
  basicLight: { ...onLight('#000000', '#ff9500', 'rgba(60,60,67,.3)'), bar: '#5856d6' },
  basicDark: { ...onDark('#ffffff', '#ff9f0a', 'rgba(84,84,88,.8)'), bar: '#5e5ce6' },
  /** Serious mode: the slate card, every colour taken out. */
  serious: {
    ...onDark('#fbf4ec', '#f4f1ea', 'rgba(251,244,236,.3)'),
    inHand: 'rgba(217,213,205,.55)',
    kept: '#4a505c',
    bar: 'rgba(217,213,205,.55)',
    receipt: { ...RECEIPT, stamp: PAPER.ink },
  },
} as const satisfies Readonly<Record<string, CardWorkInks>>;
