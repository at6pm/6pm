import { createContext, use, useCallback, useMemo, useRef, type ReactNode } from 'react';
import type { LayoutChangeEvent, TextLayoutEvent } from 'react-native';
import { useSharedValue, type SharedValue } from 'react-native-reanimated';

import { headerGeom, NO_HEADER, type HeaderGeom } from '../../ui/sky/sky-header';
import { HOME_TABS, type HomeTab } from './home-tabs';

type Headers = readonly [SharedValue<HeaderGeom>, SharedValue<HeaderGeom>, SharedValue<HeaderGeom>];

const HeadersContext = createContext<Headers | null>(null);

/** Holds where each home page's header text sits, for the sky to keep its art clear of it. */
export function HeaderMeasureProvider({ children }: { readonly children: ReactNode }) {
  const today = useSharedValue<HeaderGeom>(NO_HEADER);
  const plan = useSharedValue<HeaderGeom>(NO_HEADER);
  const diary = useSharedValue<HeaderGeom>(NO_HEADER);
  const value = useMemo(() => [today, plan, diary] as const, [today, plan, diary]);
  return <HeadersContext value={value}>{children}</HeadersContext>;
}

export function useHeaderGeoms(): Headers {
  const value = use(HeadersContext);
  if (!value) throw new Error('useHeaderGeoms needs a HeaderMeasureProvider above it');
  return value;
}

type Rect = readonly [number, number, number, number];

/**
 * A header's parts and what holds each one: `block` is the header itself (placed in the page's
 * list), every other part names its parent, so each is placed on screen through the chain.
 */
export interface HeaderShape {
  readonly parents: Readonly<Record<string, string>>;
  /** The parts whose lines of text the art keeps clear of. */
  readonly texts: readonly string[];
  readonly title: string;
  readonly button?: string;
  /** Inner padding of the block on its right, to the edge text may reach. */
  readonly padRight: number;
}

interface Measured {
  layouts: Record<string, Rect>;
  lines: Record<string, readonly Rect[]>;
}

/**
 * Measures a home page's header as laid out (its eyebrow, title, button and lines of text, however
 * many lines the language and the numbers take) and hands it to the sky. `layout(part)` goes on
 * each part's `onLayout`, `lines(part)` on each text's `onTextLayout`.
 */
export function useHeaderMeasure(tab: HomeTab, shape: HeaderShape) {
  const headers = use(HeadersContext);
  const target = headers?.[HOME_TABS.indexOf(tab)] ?? null;
  const measured = useRef<Measured>({ layouts: {}, lines: {} });

  const publish = useCallback(() => {
    if (!target) return;
    const { layouts, lines } = measured.current;
    const origin = (part: string): [number, number] | null => {
      const own = layouts[part];
      if (!own) return null;
      const parent = shape.parents[part];
      if (!parent) return [own[0], own[1]];
      const at = origin(parent);
      return at ? [at[0] + own[0], at[1] + own[1]] : null;
    };
    const textLines = (part: string): Rect[] => {
      const at = origin(part);
      const own = lines[part];
      const box = layouts[part];
      if (!at || !own || !box) return [];
      // Lines are placed inside the text's padding (Plan's line has 8 pt on top).
      const inset = Math.max(0, box[3] - Math.max(...own.map(([, y, , h]) => y + h)));
      return own.map(([x, y, w, h]) => [at[0] + x, at[1] + inset + y, w, h] as const);
    };
    const block = layouts.block;
    if (!block) return;
    const button = shape.button ? layouts[shape.button] : undefined;
    const buttonAt = shape.button ? origin(shape.button) : null;
    const title = textLines(shape.title)[0] ?? null;
    target.set(
      headerGeom({
        lines: shape.texts.flatMap(textLines),
        title,
        button: button && buttonAt ? [buttonAt[0], buttonAt[1], button[2], button[3]] : null,
        right: block[0] + block[2] - shape.padRight,
      }),
    );
  }, [target, shape]);

  const layout = useCallback(
    (part: string) => (e: LayoutChangeEvent) => {
      const { x, y, width, height } = e.nativeEvent.layout;
      measured.current.layouts[part] = [x, y, width, height];
      publish();
    },
    [publish],
  );
  const textLines = useCallback(
    (part: string) => (e: TextLayoutEvent) => {
      measured.current.lines[part] = e.nativeEvent.lines
        .filter((l) => l.width > 0)
        .map((l) => [l.x, l.y, l.width, l.height] as const);
      publish();
    },
    [publish],
  );
  return { layout, lines: textLines };
}
