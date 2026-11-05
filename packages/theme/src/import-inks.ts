import { oklchSrgbHex } from './oklch';

/**
 * Inks the bring-in draws with outside any look: the other apps' screens are sketched in their own
 * colours, so they read as "that app" whatever 6pm wears; the box's paper stacks, money in's
 * green, the orange tap and the unknown wire are the same in every look, as the design draws them.
 */
export const importInk = {
  /** Each app's screen as sketched: page, card, ink, soft ink and its own accent. */
  apps: {
    moneyLover: { bg: '#f2f2f7', card: '#ffffff', ink: '#1c1c1e', sub: '#8e8e93', acc: '#2db84c' },
    misa: { bg: '#eef3fd', card: '#ffffff', ink: '#111827', sub: '#6b7280', acc: '#2563eb' },
    momo: { bg: '#f5f4f8', card: '#ffffff', ink: '#1d1d1f', sub: '#8e8e93', acc: '#a50064' },
  },
  /** MISA's Excel and PDF buttons. */
  excel: '#16a34a',
  pdf: '#2563eb',
  /** The sketch's phone frame and notch. */
  frame: '#2c2430',
  notch: '#000000',
  /** The one place to tap in a sketch, pulsing. */
  tap: '#ff8552',
  tapFill: 'rgba(255,133,82,.55)',
  tapHalo: 'rgba(255,133,82,.25)',
  tapCard: '#fff0e6',
  /** A sketch's bottom sheet scrim and grabber. */
  scrim: 'rgba(25,10,25,.45)',
  grabber: 'rgba(0,0,0,.2)',
  /** Paper: the file card and the year stacks' sheets. */
  paper: '#fbf7ef',
  paperLine: '#e9e0d0',
  paperInk: '#2b2530',
  /** Money in, on the year stacks and its legend. */
  moneyIn: oklchSrgbHex(0.76, 0.13, 150),
  /** A label that needs a pick: the dashed chip, the marching wire, the soft ring. */
  unknown: '#ff8552',
  unknownRow: 'rgba(255,133,82,.07)',
  unknownPicking: 'rgba(255,133,82,.16)',
  unknownRing: 'rgba(255,133,82,.2)',
  /** The "goes in…" card under the labels, dark in every look, with its light ink and chip. */
  pickCard: '#2e2d55',
  pickInk: '#fbf7ef',
  pickChip: 'rgba(251,247,239,.14)',
  /** The button's fill as the lines are written. */
  progress: 'rgba(255,133,82,.35)',
  /** The hold-to-undo ring, and the undo icon before it is held. */
  holdRing: '#ffbe8a',
  /** The column table: paper, its header row, a chosen header, a skipped one. */
  table: '#fbf7ef',
  tableHead: '#ece4d6',
  tableChosen: '#fff3df',
  tableInk: '#2b2530',
  tableSoft: 'rgba(43,37,48,.5)',
  tableRule: 'rgba(43,37,48,.12)',
  tableOut: '#b8622a',
  tableIn: '#2f7d55',
  /** The checklist chips once a role is found. */
  foundBg: `${oklchSrgbHex(0.72, 0.15, 150)}38`,
  foundInk: oklchSrgbHex(0.86, 0.12, 150),
} as const;
