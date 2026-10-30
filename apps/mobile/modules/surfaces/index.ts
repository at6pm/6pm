import { requireOptionalNativeModule } from 'expo';

/** One file an extension left in the App Group inbox. */
export interface InboxFile {
  readonly id: string;
  readonly json: string;
}

export type ActivityKind = 'pendingPay' | 'travel';

export interface RunningActivity {
  readonly id: string;
  readonly kind: ActivityKind;
  readonly key: string;
  readonly stateJson: string;
}

interface SurfacesNative {
  writeSurface(name: 'snapshot' | 'context', json: string): Promise<void>;
  writeSurfaceImage(name: string, pngBase64: string): Promise<void>;
  readInbox(): Promise<InboxFile[]>;
  removeInbox(ids: readonly string[]): Promise<void>;
  /** A status an extension left (`last-alert`), or null before one has. */
  readStatus?(name: 'last-alert'): Promise<string | null>;
  activitiesEnabled(): boolean;
  listActivities(): Promise<RunningActivity[]>;
  startActivity(kind: ActivityKind, key: string, stateJson: string): Promise<string | null>;
  updateActivity(id: string, stateJson: string): Promise<void>;
  endActivity(id: string, finalStateJson: string | null): Promise<void>;
  /** Android: whether this phone can read bank alerts (its WebView runs the domain sandbox). */
  alertsSupported?(): boolean;
  /** Android: whether 6pm is turned on under Notification access. */
  alertAccess?(): boolean;
  /** Android: opens Notification access at 6pm's switch. */
  openAlertAccess?(): Promise<void>;
}

/**
 * The App Group bridge (`modules/surfaces/ios`), or on Android the files the bank alert listener
 * shares with the app (`modules/surfaces/android`); null where it is not built in: tests, and web.
 */
export const surfaces = requireOptionalNativeModule<SurfacesNative>('Surfaces');
