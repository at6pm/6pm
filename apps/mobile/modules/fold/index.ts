import { requireOptionalNativeModule, type EventSubscription } from 'expo';

/** Closed, part way open, or open as far as it goes; unknown on a phone without a hinge. */
export type HingeStatus = 'unknown' | 'closed' | 'partial' | 'open';

export interface FoldRect {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
}

/** The hinge and the screen's reserved regions, in window points. */
export interface FoldSnapshot {
  readonly hinge: HingeStatus;
  /** The hinge's angle as the system reports it, or null without a hinge. */
  readonly angle: number | null;
  /** Where the screen folds: nothing that is tapped belongs here. */
  readonly divisions: readonly FoldRect[];
  /** What covers the screen: the island on the outer display. */
  readonly occlusions: readonly FoldRect[];
}

interface FoldNative {
  current(): FoldSnapshot;
  addListener(event: 'onFold', listener: (snapshot: FoldSnapshot) => void): EventSubscription;
}

/**
 * The hinge and regions of a folding phone: the iPhone Duo (`modules/fold/ios`) and folding
 * Android phones (`modules/fold/android`, which reports no occlusions and no angle). Null where
 * it is not built in: tests, and the web.
 */
export const fold = requireOptionalNativeModule<FoldNative>('Fold');
