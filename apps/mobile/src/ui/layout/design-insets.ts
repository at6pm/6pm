import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/** The prototype is drawn on a 402×874 iPhone whose safe area is 62 pt on top, 34 at the bottom. */
const DESIGN_TOP = 62;
const DESIGN_BOTTOM = 34;

/**
 * On the iPhone Duo the status bar and island run down the right edge: iOS reports a right inset
 * and none on top. The top then keeps only the screen corner's margin, which puts Today's date
 * 26 pt from the top edge as the Duo design draws it.
 */
const SIDE_STATUS_TOP = 28;

/**
 * Android draws its navigation over the app's bottom edge: 48 dp of Back, Home and Recents on a
 * veil, or a gesture handle whose strip some phones paint. The design's controls dip a few points
 * into the iPhone's home-indicator strip, which on Android would put them under that bar, and
 * where a phone reports a thin inset or none the shifted offset is below zero, off the screen. On
 * Android they keep a gap above whatever the system reports: `HANDLE_GAP` over a handle or a bare
 * edge, `BUTTON_BAR_GAP` over the taller bar of buttons, whose veil reads as an edge of its own.
 */
const BUTTON_BAR_MIN = 40;
const BUTTON_BAR_GAP = 16;
const HANDLE_GAP = 10;

/**
 * The prototype's offset from the bottom edge on a screen whose bottom inset is `inset`: shifted
 * by the difference in safe area, and on Android never closer to the system navigation than its
 * gap.
 */
export function designBottom(designPx: number, inset: number, android: boolean): number {
  const shifted = designPx + inset - DESIGN_BOTTOM;
  if (!android) return shifted;
  return Math.max(shifted, inset + (inset >= BUTTON_BAR_MIN ? BUTTON_BAR_GAP : HANDLE_GAP));
}

/**
 * Converts the prototype's offsets from the screen edge into this phone's: exact on the design
 * device, shifted by the difference in safe area on every other. `rail` is the width of the
 * status column down the right edge on the iPhone Duo, 0 on every other iPhone.
 */
export function useDesignInsets() {
  const insets = useSafeAreaInsets();
  const rail = insets.top === 0 && insets.right > 0 ? insets.right : 0;
  const topInset = rail > 0 ? SIDE_STATUS_TOP : insets.top;
  return {
    top: (designPx: number) => designPx + topInset - DESIGN_TOP,
    bottom: (designPx: number) => designBottom(designPx, insets.bottom, Platform.OS === 'android'),
    rail,
    insets,
  };
}
