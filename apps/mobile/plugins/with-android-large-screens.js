// @ts-check
// Expo loads config plugins with Node's CommonJS loader, so this uses require and module.exports.
/* eslint-disable @typescript-eslint/no-require-imports -- CommonJS, see above */
const { withAndroidManifest } = require('expo/config-plugins');
/* eslint-enable @typescript-eslint/no-require-imports */

const PORTRAIT = 'android.hardware.screen.portrait';

/**
 * Folding phones, tablets and desktops on Android.
 *
 * 6pm is held upright on a phone, and Android reads that as "needs a screen that stands upright",
 * which hides the app from devices without one. It is said here not to be needed: on a large
 * screen the app follows the way it is held (modules/fold).
 */
module.exports = function withAndroidLargeScreens(config) {
  return withAndroidManifest(config, (mod) => {
    const features = (mod.modResults.manifest['uses-feature'] ??= []);
    const portrait = features.find((f) => f.$['android:name'] === PORTRAIT);
    if (portrait) portrait.$['android:required'] = 'false';
    else features.push({ $: { 'android:name': PORTRAIT, 'android:required': 'false' } });
    return mod;
  });
};
