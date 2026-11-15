import type { Palette } from '@6pm/theme';

import { onboardingPalette, STEP_COUNT, type OnboardingPalette } from './onboarding-palette';

/**
 * "How money reaches you" opened from Plan, in the look's own inks: its sky, ink, cards, chips and
 * button, over onboarding's light or dark set for everything a look does not name (the money bars
 * on the cards, the checks, the dashed slip).
 */
export function reachPaletteOf(palette: Palette): OnboardingPalette {
  const base = onboardingPalette(palette.dark ? STEP_COUNT - 1 : 0);
  return {
    ...base,
    dark: palette.dark,
    sky: [palette.st[0], palette.st[1], palette.st[2]],
    ink: palette.ink,
    inkSoft: palette.inkSoft,
    btnBg: palette.btnBg,
    btnFg: palette.btnFg,
    cell: palette.cell,
    chipBg: palette.chipBg,
    cardShadow: palette.cardShadow,
    accent: palette.accent,
    onAccent: palette.accentFg,
  };
}
