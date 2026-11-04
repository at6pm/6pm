import type { ComponentRef } from 'react';
import type { View } from 'react-native';

type ViewHandle = ComponentRef<typeof View>;

/** Where a jar sat on the screen when it was tapped, in window points. */
export interface JarRect {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
}

let source: { readonly id: string; readonly rect: JarRect } | null = null;
let landing = false;

/**
 * Measures the jar that was tapped, so its page can grow it from there (the shelf jar into the
 * page's), then opens the page. A jar that cannot be measured opens without the flight.
 */
export function flyFrom(id: string, view: ViewHandle | null, open: () => void): void {
  if (view === null) {
    source = null;
    open();
    return;
  }
  view.measureInWindow((x, y, width, height) => {
    source = width > 0 ? { id, rect: { x, y, width, height } } : null;
    open();
  });
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
