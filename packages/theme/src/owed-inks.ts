import { oklchSrgbHex } from './oklch';

/**
 * Who owes me: the torn bill's paper strips, the PAID stamp, the Ask's QR slip and its sky, the
 * same in every look, as the design draws them. The user's own strip wears the look's accent.
 */
export const owedInk = {
  /** A strip of the torn bill. */
  paper: '#fbf7ef',
  ink: '#231a24',
  soft: 'rgba(35,26,36,.55)',
  /** The dashed tear between two strips. */
  perf: 'rgba(35,26,36,.32)',
  /** The PAID stamp, the close's KEEP green. */
  stamp: '#2f7d55',
  /** A person's initial on their avatar. */
  avatarInk: '#2a1408',
  /** Under a strip lying on a card. */
  slipShadow: 'rgba(10,4,20,.35)',
  /** Under the torn bill on the split sheet. */
  billShadow: 'rgba(20,10,30,.3)',
  /** The Ask: the QR's paper, its ink and the rule above the bank. */
  qrPaper: '#fffdf9',
  qrInk: '#1b1e2e',
  qrSoft: 'rgba(27,30,46,.55)',
  qrMuted: 'rgba(27,30,46,.6)',
  qrRule: 'rgba(27,30,46,.2)',
  qrShadow: 'rgba(10,4,20,.5)',
  /** The Ask's round close button on the sky, and its inks. */
  askClose: '#2e2d55',
  askInk: '#fbf4ec',
  askSoft: 'rgba(251,244,236,.85)',
  /** Under a sheet drawn over the owed list. */
  sheetShadow: '0 -20px 60px rgba(10,5,20,.35)',
} as const;

/** The hues a person's avatar takes, as the design gives Linh, Minh and Tú theirs. */
const AVATAR_HUES = [30, 200, 300, 60, 140, 250, 340, 100] as const;

/** A person’s avatar colour (oklch 0.8 0.1 at a hue), the same for the same name every time. */
export function owedAvatar(key: string | null): string {
  if (key === null) return oklchSrgbHex(0.8, 0.02, 60);
  // FNV-1a over the name's letters.
  let hash = 0x811c9dc5;
  for (const ch of key) hash = Math.imul(hash ^ (ch.codePointAt(0) ?? 0), 0x01000193) >>> 0;
  return oklchSrgbHex(0.8, 0.1, AVATAR_HUES[hash % AVATAR_HUES.length] ?? 30);
}
