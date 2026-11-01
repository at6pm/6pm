import { requireOptionalNativeModule } from 'expo';

interface FontInstanceNative {
  /**
   * Registers the variable file `family` set at `axes` as the family `name`. False when the file
   * can't be read, and the text keeps its axes instead.
   */
  register(name: string, family: string, axes: string): boolean;
}

/**
 * Variable fonts set at fixed axes and drawn by name (`modules/font-instance/android`), or null
 * where it is not built in: iOS, which draws axes natively, and tests.
 */
export const fontInstance = requireOptionalNativeModule<FontInstanceNative>('FontInstance');
