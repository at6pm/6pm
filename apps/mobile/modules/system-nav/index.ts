import { requireOptionalNativeModule } from 'expo';

interface SystemNavNative {
  /** Draws Back, Home and the gesture handle light (for a dark screen) or dark. */
  setLightButtons(light: boolean): void;
}

/**
 * Android's navigation bar (`modules/system-nav/android`), or null where there is none to
 * colour: iOS and tests.
 */
export const systemNav = requireOptionalNativeModule<SystemNavNative>('SystemNav');
