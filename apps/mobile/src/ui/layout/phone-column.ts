import { Platform, useWindowDimensions } from 'react-native';

/** A window this wide or more is not a phone's: an opened folding phone, a tablet. */
const WIDE_FROM = 600;

/** The widest a phone-shaped screen is drawn on a wide window: a large phone's width. */
export const PHONE_COLUMN = 480;

/** The width of a phone-shaped screen in a window `width` wide (see `usePhoneColumn`). */
export function phoneColumn(width: number, android: boolean): number {
  return android && width >= WIDE_FROM ? PHONE_COLUMN : width;
}

/**
 * The width a screen drawn for a phone takes: the window's own on a phone, and a large phone's,
 * centred, on a wide Android window (an opened folding phone turned any way, a tablet), where it
 * would otherwise stretch from edge to edge. Android's sheets keep the same width there. An iPad
 * and the iPhone Duo keep the layouts they have.
 */
export function usePhoneColumn(): number {
  const { width } = useWindowDimensions();
  return phoneColumn(width, Platform.OS === 'android');
}
