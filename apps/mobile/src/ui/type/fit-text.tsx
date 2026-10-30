import { Text, type TextProps } from 'react-native';

/** The smallest a fitted line is drawn, as a share of its designed size. */
export const FIT_MIN_SCALE = 0.5;

/**
 * The most a fitted line grows with the reader's text size. iOS shrinks the glyphs to the width
 * but keeps the grown line's height, so a line grown far and shrunk back would stand in a tall
 * empty line; display type is large to begin with, as iOS's own large titles grow little.
 */
export const FIT_MAX_GROWTH = 1.5;

/**
 * One line of text that is never wrapped or clipped: an amount, a number or a one-line title in a
 * box of fixed width. It is drawn at its style's size (grown with the reader's text size, up to
 * `FIT_MAX_GROWTH`), never bigger, and shrinks to the width it has, down to `minScale` of it, when
 * the language, the amount, the currency or the text size makes it longer. iOS does the shrinking
 * as it lays the text out, so there is no frame at the wrong size.
 */
export function FitText({
  minScale = FIT_MIN_SCALE,
  ...props
}: TextProps & { readonly minScale?: number }) {
  return (
    <Text
      numberOfLines={1}
      adjustsFontSizeToFit
      minimumFontScale={minScale}
      maxFontSizeMultiplier={FIT_MAX_GROWTH}
      {...props}
    />
  );
}
