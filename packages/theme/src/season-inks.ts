/**
 * The Lunar New Year season's fixed inks, the same in every look (the Tết Season canvas): red
 * envelopes with their gold rim and Lộc seal, the lanterns of Today's countdown and Korea's silk
 * pouches, hoa mai on the sheet's edge, Quick add's lì xì red, and the bonus slip's paper.
 */
export const seasonInk = {
  envelopeTop: '#e33a26',
  envelopeBottom: '#b51d22',
  envelopeRim: '#ffd36e',
  envelopeRimSoft: 'rgba(255,211,110,.4)',
  envelopeShadow: '0 2px 4px rgba(60,0,10,.4)',
  /** A fanned envelope in Quick add: deeper shadow, a gold line inside its red edge. */
  fanShadow: '0 8px 16px rgba(60,0,10,.45)',
  sealLight: '#ffe9a8',
  sealGold: '#e8b23e',
  sealInk: '#9a1418',
  lanternCore: '#ffc23a',
  lanternRed: '#e8452c',
  lanternEdge: '#b8231c',
  lanternGlow: '0 0 12px rgba(255,122,47,.6)',
  /** What lies over a lantern gone out (the canvas's brightness .35). */
  lanternOut: '#14060c',
  /** The lantern string and its cords. */
  cord: 'rgba(255,220,160,.45)',
  /** Korea's 복주머니, in turn: pink, blue and gold silk. */
  pouches: [
    ['#e8457a', '#c42a5c'],
    ['#3b6fd0', '#244a9a'],
    ['#f2c230', '#d99a1e'],
  ],
  maiHeart: '#fff3b0',
  maiPetal: '#ffd23f',
  maiEdge: '#f2b81f',
  /** Quick add's lì xì mode: the selected segment and the + button. */
  red: '#d8322a',
  onRed: '#fff3cf',
  redShadow: '0 8px 18px rgba(200,30,30,.35)',
  slipPaper: '#f7f2e8',
  slipInk: '#2b2530',
  slipSoft: 'rgba(43,37,48,.55)',
  slipPerforation: 'rgba(43,37,48,.35)',
  slipShadow: '0 10px 18px rgba(20,6,30,.3)',
  /** The bonus's days to payday. */
  dayBar: '#ff8552',
} as const;
