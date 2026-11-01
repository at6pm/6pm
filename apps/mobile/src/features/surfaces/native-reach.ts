import { Platform } from 'react-native';

import { scanCamera } from '../../../modules/scan-camera';
import { surfaces } from '../../../modules/surfaces';

/**
 * What this phone's native side can do. The iPhone build carries every surface; a build without
 * one (Android) hides the way in rather than offering a screen or a button that cannot work.
 */
export interface NativeReach {
  /** Scan's live camera and reader. */
  readonly scan: boolean;
  /** 6pm in the share sheet: the iOS share extension. */
  readonly share: boolean;
  /** The Wallet automation, set up in Shortcuts. */
  readonly wallet: boolean;
  /** Home and Lock Screen widgets, controls and Live Activities. */
  readonly widgets: boolean;
  /**
   * A Home Screen widget that draws the snapshot the app writes, with its companion: the iPhone's,
   * and Android's Home screen widgets (which have no guide and no Lock Screen).
   */
  readonly homeWidgets: boolean;
  /** Sign in with Apple, which Budget together pairs with. */
  readonly appleSignIn: boolean;
  /**
   * Bank and wallet alerts: iOS 27's Shortcuts automation on an app's notifications, running the
   * "Catch a bank alert" action of a build that has it; on Android, the notification listener,
   * where the phone's WebView can run the domain bundle that reads them.
   */
  readonly bankAlerts: boolean;
  /** Bank alerts come through Android's notification listener, not a Shortcuts automation. */
  readonly alertListener: boolean;
  /** "Log in 6pm" said to Siri: App Shortcuts list it from iOS 17.4. */
  readonly siri: boolean;
  /** Back Tap opening Quick add: the Quick add shortcut exists from iOS 18. */
  readonly backTap: boolean;
}

const ios = Platform.OS === 'ios';

/** The iOS version as a number ("27.0.1" → 27), or 0 off iOS. */
function iosVersion(): number {
  if (!ios) return 0;
  const [major = '0', minor = '0'] = String(Platform.Version).split('.');
  return Number(major) + Number(minor) / 100;
}

const bankAlerts = ios
  ? iosVersion() >= 27 && typeof surfaces?.readStatus === 'function'
  : surfaces?.alertsSupported?.() === true;

export const nativeReach: NativeReach = {
  scan: scanCamera !== null,
  share: ios,
  wallet: ios,
  widgets: ios && surfaces !== null,
  homeWidgets: surfaces !== null,
  appleSignIn: ios,
  bankAlerts,
  alertListener: !ios && bankAlerts,
  siri: iosVersion() >= 17.04,
  backTap: iosVersion() >= 18,
};
