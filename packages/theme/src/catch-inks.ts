/**
 * The first catch's fixed inks, the same in every look: receipt Nº 001's paper and its CAUGHT
 * stamp, the warm tone for a way that went quiet or a hop that may be stuck (never red), and the
 * tiles the path draws for Wallet, a Shortcut and 6pm itself.
 */
export const catchInk = {
  paperTop: '#fdfaf3',
  paperBottom: '#f4efe4',
  ink: '#2a2230',
  soft: 'rgba(42,34,48,.6)',
  note: 'rgba(42,34,48,.62)',
  rule: 'rgba(42,34,48,.25)',
  /** The slip's line marks on the "Read on this phone" grid. */
  mark: 'rgba(42,34,48,.35)',
  markSoft: 'rgba(42,34,48,.25)',
  stamp: '#2f7d55',
  slipShadow: '0 22px 34px rgba(20,6,30,.32)',
  warm: '#ffbe8a',
  /** The quiet row's wash in Settings. */
  warmWash: 'rgba(255,190,138,.06)',
  onWarm: '#2a1424',
  walletTile: '#111111',
  onTile: '#ffffff',
  shortcutTile: 'linear-gradient(135deg, #5b4bd6 0%, #e0559a 100%)',
  appTile: 'linear-gradient(180deg, #3b3270 0%, #c4607a 62%, #f0975a 100%)',
} as const;
