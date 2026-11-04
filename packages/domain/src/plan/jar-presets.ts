import { designAmount, VND, type Currency } from '../money/currency';
import type { Vnd } from '../money/format';

/**
 * Whether the person keeps Tết: a home in đồng or a phone set to Vietnam. Only they see the Tết
 * jar preset, the Tết words and the close's Tết question; nobody else is shown Tết at all.
 */
export function hasTet(input: {
  readonly currency: string | null | undefined;
  readonly region: string | null | undefined;
}): boolean {
  return input.currency?.toUpperCase() === 'VND' || input.region?.toUpperCase() === 'VN';
}

export type JarPresetId = 'tet' | 'trip' | 'phone' | 'rainy' | 'wedding' | 'other';

export interface JarPreset {
  readonly id: JarPresetId;
  readonly icon: string;
  readonly hue: number;
  /** The target it starts with, in đồng (scaled by value elsewhere); 0 for none. */
  readonly target: Vnd;
  /** Dated presets start with "By a date"; the rest with "Each payday". */
  readonly fills: 'date' | 'steady';
}

const PRESETS: readonly JarPreset[] = [
  { id: 'tet', icon: 'local_florist', hue: 20, target: 7_000_000, fills: 'date' },
  { id: 'trip', icon: 'flight', hue: 200, target: 6_000_000, fills: 'date' },
  { id: 'phone', icon: 'smartphone', hue: 250, target: 9_000_000, fills: 'steady' },
  { id: 'rainy', icon: 'umbrella', hue: 145, target: 12_600_000, fills: 'steady' },
  { id: 'wedding', icon: 'favorite', hue: 350, target: 2_000_000, fills: 'date' },
  { id: 'other', icon: 'savings', hue: 75, target: 0, fills: 'steady' },
];

/**
 * New jar's presets, in order: Tết first for those who keep it (`hasTet`), else starting with a
 * trip. Targets in the home currency.
 */
export function jarPresets(tet: boolean, currency: Currency = VND): JarPreset[] {
  return PRESETS.filter((p) => tet || p.id !== 'tet').map((p) =>
    currency.code === 'VND' || p.target === 0
      ? p
      : { ...p, target: designAmount(p.target, currency) },
  );
}

/** Icons a trip jar wears: the close asks about it while Travel mode is on. */
const TRIP_ICONS: ReadonlySet<string> = new Set(['flight', 'landscape', 'luggage', 'beach_access']);

export function isTripJar(pot: { readonly icon: string }): boolean {
  return TRIP_ICONS.has(pot.icon);
}
