import { useState } from 'react';
import { Text, type TextProps } from 'react-native';

/** Chinese and Japanese break after their own commas and stops, as they have no spaces. */
const WIDE_PUNCTUATION = /[，、；：！？]/u;

/**
 * Breaks `text` into two lines whose lengths differ least: at a space, or after a Chinese or
 * Japanese comma.
 */
export function balanceTwoLines(text: string): string {
  let best = text;
  let bestDiff = Infinity;
  for (let i = 1; i < text.length - 1; i++) {
    const char = text.charAt(i);
    const split =
      char === ' '
        ? [text.slice(0, i), text.slice(i + 1)]
        : WIDE_PUNCTUATION.test(char)
          ? [text.slice(0, i + 1), text.slice(i + 1)]
          : null;
    if (split === null) continue;
    const [a = '', b = ''] = split;
    const diff = Math.abs(a.length - b.length);
    if (diff < bestDiff) {
      bestDiff = diff;
      best = `${a}\n${b}`;
    }
  }
  return best;
}

/**
 * Text that wraps like CSS `text-wrap: balance` for headings: when it would take two lines, the
 * break moves so both lines are about as long, instead of leaving one word alone.
 */
export function BalancedText({ children, ...props }: TextProps & { readonly children: string }) {
  const [twoLines, setTwoLines] = useState(false);
  return (
    <Text
      {...props}
      onTextLayout={(e) => {
        if (!twoLines && e.nativeEvent.lines.length === 2) setTwoLines(true);
        props.onTextLayout?.(e);
      }}
    >
      {twoLines ? balanceTwoLines(children) : children}
    </Text>
  );
}
