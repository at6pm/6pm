import { createContext, type ComponentRef } from 'react';
import type { View } from 'react-native';
import { makeMutable, useAnimatedStyle } from 'react-native-reanimated';

type ViewHandle = ComponentRef<typeof View>;

/** Where a jar sat on the screen when it was tapped, in window points. */
export interface JarRect {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
}

/**
 * Where the screen a jar is drawn on sits in the window. A sheet measures its jars from its own top
 * (a form sheet starts below the status bar), so it says how far down that top is; a full screen
 * says nothing.
 */
export interface FlightOrigin {
  readonly current: { readonly x: number; readonly y: number };
}
export const JarFlightOrigin = createContext<FlightOrigin | null>(null);

let source: { readonly id: string; readonly rect: JarRect } | null = null;
let landing = false;

/**
 * Measures the jar that was tapped, so its page can grow it from there (the shelf jar into the
 * page's), then opens the page. A jar that cannot be measured opens without the flight.
 */
export function flyFrom(
  id: string,
  view: ViewHandle | null,
  open: () => void,
  origin: FlightOrigin | null = null,
): void {
  if (view === null) {
    source = null;
    open();
    return;
  }
  view.measureInWindow((x, y, width, height) => {
    const at = origin?.current ?? { x: 0, y: 0 };
    source = width > 0 ? { id, rect: { x: x + at.x, y: y + at.y, width, height } } : null;
    open();
  });
}

/**
 * The jar that is away in its page: from the frame the page's jar stands over it until the page's
 * jar has landed back on it, the jar tapped is hidden, so there is only ever one jar on the screen.
 */
const away = makeMutable<string | null>(null);

/** The page's jar now stands over the one tapped (`id`), or has landed back on it (null). */
export function setJarAway(id: string | null): void {
  away.value = id;
}

/** The style a tappable jar wears: hidden while it is away in its page. */
export function useJarAwayStyle(id: string) {
  return useAnimatedStyle(() => ({ opacity: away.value === id ? 0 : 1 }));
}

/** The rect the page's jar grows from, once: a later open without a tap starts in place. */
export function takeFlightSource(id: string): JarRect | null {
  const kept = source?.id === id ? source.rect : null;
  source = null;
  return kept;
}

/**
 * New jar is about to start a jar: the next jar the shelf draws for the first time lands with
 * jarIn. Its id is only known once it is made, and the shelf draws it the moment it is.
 */
export function expectLanding(on = true): void {
  landing = on;
}

/** Whether a jar drawn for the first time now is the one New jar just started (once). */
export function takeLanding(): boolean {
  const was = landing;
  landing = false;
  return was;
}
