import { useRef, useState, type ReactNode } from 'react';
import {
  Platform,
  Text,
  View,
  type LayoutChangeEvent,
  type TextLayoutEvent,
  type TextProps,
  type TextStyle,
} from 'react-native';

import { FIT_MIN_SCALE } from './fit-text';
import {
  breaksMidWord,
  keepCountersWithNumbers,
  keepHangulWords,
  keepThaiWords,
  scaleTextStyle,
  wordFitScale,
  wordsToMeasure,
} from './word-fit';

/**
 * A heading's words as they are drawn. iOS keeps Korean to its words, and a number with its
 * counter, by itself (the `standard` line break strategy); Android needs them joined, and breaks
 * inside a Thai word or two it does not know.
 */
export function headingWords(text: string): string {
  if (Platform.OS !== 'android') return text;
  return keepThaiWords(keepCountersWithNumbers(keepHangulWords(text)));
}

/**
 * How a heading's lines break, as the system's own labels do: on iOS Korean between its words and
 * no last line of a character or two, on Android lines of about even length. Spread on every
 * heading's `Text`, with its words through `headingWords`; `WordFitText` and `BalancedText` do both.
 */
export const HEADING_BREAKS = {
  lineBreakStrategyIOS: 'standard',
  textBreakStrategy: 'balanced',
} as const satisfies Pick<TextProps, 'lineBreakStrategyIOS' | 'textBreakStrategy'>;

/** Wider than any word at any size. */
const STAGE = 4096;

/** The heading's type alone, at its own width: none of the box it is laid out in. */
function probeStyle(style: TextStyle): TextStyle {
  const {
    margin: _margin,
    marginTop: _marginTop,
    marginBottom: _marginBottom,
    marginLeft: _marginLeft,
    marginRight: _marginRight,
    marginHorizontal: _marginHorizontal,
    marginVertical: _marginVertical,
    padding: _padding,
    paddingTop: _paddingTop,
    paddingBottom: _paddingBottom,
    paddingLeft: _paddingLeft,
    paddingRight: _paddingRight,
    paddingHorizontal: _paddingHorizontal,
    paddingVertical: _paddingVertical,
    width: _width,
    maxWidth: _maxWidth,
    minWidth: _minWidth,
    flex: _flex,
    flexGrow: _flexGrow,
    flexShrink: _flexShrink,
    flexBasis: _flexBasis,
    alignSelf: _alignSelf,
    position: _position,
    transform: _transform,
    ...type
  } = style;
  return { ...type, alignSelf: 'flex-start' };
}

/**
 * Lets a heading wrap only between words. Laid out at its designed size first; when iOS has had to
 * cut a word in two (a long word, a narrow box, a large text size), the heading shrinks just
 * enough for its widest word to fit a line, down to `minScale`, and wraps between words again.
 * Returns the style to draw with, the layout handler for the text, and a hidden copy of its words
 * that measures the widest. Given the `lineWidth` of a box of fixed width, it shrinks as soon as the
 * widest word is measured, without waiting for a cut.
 */
export function useWordFit(
  text: string,
  style: TextStyle,
  minScale = FIT_MIN_SCALE,
  textProps?: Pick<TextProps, 'allowFontScaling' | 'maxFontSizeMultiplier'>,
  lineWidth?: number,
) {
  const [fit, setFit] = useState({ text, scale: 1 });
  // A new text starts again at its designed size.
  const scale = fit.text === text ? fit.scale : 1;
  const wordWidth = useRef(0);
  const cut = useRef<{ text: string; lineWidth: number } | null>(null);

  const settle = () => {
    if (cut.current === null || cut.current.text !== text || wordWidth.current <= 0) return;
    const next = wordFitScale(cut.current.lineWidth, wordWidth.current, minScale);
    cut.current = null;
    if (next < scale) setFit({ text, scale: next });
  };
  const onTextLayout = (e: TextLayoutEvent) => {
    const { lines } = e.nativeEvent;
    if (scale === 1 && breaksMidWord(lines.map((l) => l.text))) {
      cut.current = { text, lineWidth: Math.max(...lines.map((l) => l.width)) };
      settle();
    }
  };
  const onWords = (e: LayoutChangeEvent) => {
    wordWidth.current = e.nativeEvent.layout.width;
    if (lineWidth !== undefined && scale === 1) cut.current = { text, lineWidth };
    settle();
  };

  // The words grow with the reader's text size exactly as the heading does.
  const scaling = {
    ...(textProps?.allowFontScaling === undefined
      ? {}
      : { allowFontScaling: textProps.allowFontScaling }),
    ...(textProps?.maxFontSizeMultiplier === undefined
      ? {}
      : { maxFontSizeMultiplier: textProps.maxFontSizeMultiplier }),
  };
  const words = wordsToMeasure(text);
  const probe: ReactNode =
    words === '' ? null : (
      <View
        pointerEvents="none"
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
        style={{ position: 'absolute', left: 0, top: 0, width: STAGE, opacity: 0 }}
      >
        <Text {...scaling} onLayout={onWords} style={probeStyle(style)}>
          {words}
        </Text>
      </View>
    );

  return { style: scale === 1 ? style : scaleTextStyle(style, scale), onTextLayout, probe };
}

/**
 * A heading that may wrap, but only between words: a word too wide for its line shrinks the heading
 * instead of being cut in two (see `useWordFit`).
 */
export function WordFitText({
  children,
  style,
  minScale,
  onTextLayout,
  ...props
}: Omit<TextProps, 'children' | 'style'> & {
  readonly children: string;
  readonly style: TextStyle;
  readonly minScale?: number;
}) {
  const fit = useWordFit(children, style, minScale, props);
  return (
    <>
      <Text
        {...HEADING_BREAKS}
        {...props}
        style={fit.style}
        onTextLayout={(e) => {
          fit.onTextLayout(e);
          onTextLayout?.(e);
        }}
      >
        {headingWords(children)}
      </Text>
      {fit.probe}
    </>
  );
}
