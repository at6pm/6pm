import { oklchSrgbHex } from './oklch';

/** Quick add's own inks, the same in every look, as the Polish Round and Money Reaches You draw them. */
export const quickAddInk = {
  /** The WORK stamp inked on a "Got paid" ticket for a sender whose money is work. */
  workStamp: oklchSrgbHex(0.42, 0.13, 275),
  /** Under Keep it once there is something to keep. */
  keepShadow: '0 8px 20px rgba(20,8,30,.25)',
  /** Under "Try again" when voice missed the amount. */
  retryGlow: '0 8px 22px rgba(255,120,70,.35)',
  /** Under the photo clipped behind the ticket's corner. */
  printShadow: '0 6px 14px rgba(10,5,20,.35)',
} as const;
