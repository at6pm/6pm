import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import type { ConfigContext, ExpoConfig } from 'expo/config';

/** Two environments, dev and prd. `e2e-test` is the dev app as device runs install it. */
type AppVariant = 'dev' | 'prd' | 'e2e-test';

interface VariantConfig {
  name: string;
  bundleIdentifier: string;
  /**
   * The Android package. Not the iOS id: `ai.sixpm.app` is held on Google Play by a developer
   * account that was closed, and Play never frees a package name (31 Oct 2026).
   */
  androidPackage: string;
  /** Shared by the app and its extensions (widgets, share, Live Activity). */
  appGroup: string;
  scheme: string;
  /** Hosts universal links and the API: one host per environment on at6pm.app. */
  host: string;
  /** The host before at6pm.app: its links still open the app, and its routes still answer. */
  legacyHost: string;
  /** Over-the-air updates. Off for device runs, which swap in the commit's own bundle. */
  updates: boolean;
  /**
   * The increased memory limit for on-device mode's larger models. Turned on for ai.sixpm.app and
   * ai.sixpm.app.dev on the Apple developer site (16 Oct 2026); a new App ID needs it there first,
   * and its profiles regenerated, or a signed build fails.
   */
  increasedMemory: boolean;
}

/** The v1 project on the `sixpm` Expo account: v2 ships as an update to the same store app. */
const EAS_PROJECT_ID = '5853e031-3bfb-41fe-bfb6-c49f746c4adc';
const APPLE_TEAM_ID = 'YFND2EEW8S';
const IOS_DEPLOYMENT_TARGET = '17.0';

const DEV: VariantConfig = {
  name: '6pm Dev',
  bundleIdentifier: 'ai.sixpm.app.dev',
  androidPackage: 'app.at6pm.dev',
  appGroup: 'group.ai.sixpm.app.dev',
  scheme: 'sixpm-dev',
  host: 'dev.at6pm.app',
  legacyHost: '6pm-dev.oddeggs.studio',
  updates: true,
  increasedMemory: true,
};

const VARIANTS: Record<AppVariant, VariantConfig> = {
  dev: DEV,
  'e2e-test': { ...DEV, updates: false },
  prd: {
    name: '6pm',
    bundleIdentifier: 'ai.sixpm.app',
    androidPackage: 'app.at6pm',
    appGroup: 'group.ai.sixpm.app',
    scheme: 'sixpm',
    host: 'at6pm.app',
    legacyHost: '6pm.oddeggs.studio',
    updates: true,
    increasedMemory: true,
  },
};

/** Unset means dev, for local work; every EAS profile names its variant in eas.json. */
function resolveVariant(): AppVariant {
  const raw = process.env['APP_VARIANT'];
  if (raw === undefined || raw === '') return 'dev';
  if (raw === 'dev' || raw === 'prd' || raw === 'e2e-test') return raw;
  throw new Error(`APP_VARIANT must be dev, prd or e2e-test, not "${raw}"`);
}

const appVariant = resolveVariant();
const variant = VARIANTS[appVariant];

/**
 * The permission prompts in English, written from `@6pm/i18n` (`native.permission.*`) by
 * `tools/scripts/generate-native.ts`, which this config cannot import. The plugins below take
 * them so no plugin writes its own default; each language's file then localises them.
 */
const PERMISSION = (
  JSON.parse(readFileSync(join(__dirname, 'locales/en.json'), 'utf8')) as {
    ios: Record<
      | 'NSCameraUsageDescription'
      | 'NSMicrophoneUsageDescription'
      | 'NSSpeechRecognitionUsageDescription'
      | 'NSPhotoLibraryUsageDescription'
      | 'NSPhotoLibraryAddUsageDescription'
      | 'NSLocationWhenInUseUsageDescription',
      string
    >;
  }
).ios;

/**
 * The companions' Home Screen icons, which the picker can switch to; the sun is the app's own
 * icon. The names match `APP_ICON_NAMES` in `src/features/app-icon/app-icon.ts`, which this config
 * cannot import. Only the light image is drawn for each, so iOS dims and tints it itself.
 */
const COMPANION_ICONS = [
  ['CompanionMax', 'max'],
  ['CompanionNhang', 'nhang'],
  ['CompanionBanhBao', 'banhbao'],
  ['CompanionGiot', 'giot'],
  ['CompanionHac', 'hac'],
].map(([name, id]) => ({
  name: name ?? '',
  light: `./assets/icon/${id}/icon.png`,
}));

/** The page colour behind the first frame: the Golden Hour night sheet, so launch never flashes. */
const LAUNCH_BACKGROUND = '#1a0f1c';

/** Golden Hour's accent (`@6pm/theme`), which this config cannot import. */
const NOTIFICATION_ACCENT = '#ff8552';

/** Every font file in assets/fonts, embedded natively so the first frame already has them. */
const FONTS = [
  'BricolageGrotesque-Variable',
  'BeVietnamPro-Regular',
  'BeVietnamPro-Medium',
  'BeVietnamPro-SemiBold',
  'BeVietnamPro-Bold',
  'IBMPlexMono-Regular',
  'IBMPlexMono-Medium',
  'IBMPlexMono-SemiBold',
  'PatrickHand-Regular',
  'MaterialSymbolsRounded-Variable',
  // The looks' display faces.
  'Prata-Regular',
  'Newsreader-Variable',
  'DelaGothicOne-Regular',
  'DarkerGrotesque-Variable',
  'Alegreya-Variable',
  'TiltNeon',
  'BigShouldersDisplay-Variable',
  'Grandstander-Variable',
  'Spectral-Regular',
  'Spectral-Medium',
  'Spectral-SemiBold',
  // The looks' interface faces (Basic and Golden Hour keep SF Pro).
  'Literata-Variable',
  'Epilogue-Variable',
  'Archivo-Variable',
  'PlusJakartaSans-Variable',
  'AlegreyaSans-Regular',
  'AlegreyaSans-Medium',
  'AlegreyaSans-Bold',
  'AlegreyaSans-ExtraBold',
  'BaiJamjuree-Regular',
  'BaiJamjuree-Medium',
  'BaiJamjuree-SemiBold',
  'BaiJamjuree-Bold',
  'Geist-Variable',
  'Lexend-Variable',
].map((name) => `./assets/fonts/${name}.ttf`);

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: variant.name,
  owner: 'sixpm',
  slug: '6pm',
  scheme: variant.scheme,
  version: '2.1.0',
  orientation: 'portrait',
  // The companion as the setting sun, half-sunk on a calm horizon: six o'clock without words.
  icon: './assets/icon/icon.png',
  userInterfaceStyle: 'automatic',
  backgroundColor: LAUNCH_BACKGROUND,
  // A build only takes updates made from the same native code; v1's fixed runtime is never reused.
  // EXPO_LOCAL_RUNTIME is for the simulator harness only: the dev server re-hashes the native
  // fingerprint on every manifest request, which can outlast the dev client's 10 s timeout on a
  // busy machine. The dev client never checks the runtime against Metro, so a fixed one is safe there.
  runtimeVersion: process.env.EXPO_LOCAL_RUNTIME ? 'local' : { policy: 'fingerprint' },
  updates: variant.updates
    ? { url: `https://u.expo.dev/${EAS_PROJECT_ID}` }
    : { enabled: false, checkAutomatically: 'NEVER' },
  ios: {
    bundleIdentifier: variant.bundleIdentifier,
    // iOS 18+ home-screen appearances: the same sunset on a night sea, and a grey glyph to tint.
    icon: {
      light: './assets/icon/icon.png',
      dark: './assets/icon/icon-dark.png',
      tinted: './assets/icon/icon-tinted.png',
    },
    appleTeamId: APPLE_TEAM_ID,
    deploymentTarget: IOS_DEPLOYMENT_TARGET,
    // v1 shipped on iPad, and an App Store update may not drop a device family it supported.
    supportsTablet: true,
    associatedDomains: [
      `applinks:${variant.host}`,
      `webcredentials:${variant.host}`,
      `applinks:${variant.legacyHost}`,
    ],
    usesAppleSignIn: true,
    // The App Group is how the app and its widgets, share extension and shortcuts reach each
    // other; the targets in ./targets copy it. Each group is registered by hand on the Apple
    // developer site, which App Store Connect's API cannot do.
    entitlements: {
      'com.apple.security.application-groups': [variant.appGroup],
      'com.apple.developer.usernotifications.time-sensitive': true,
      // On-device mode keeps a 2.6–3.7 GB model in memory; without this iOS ends the app well
      // below what the phone has. Turned on by hand for each App ID on the Apple developer site.
      ...(variant.increasedMemory
        ? { 'com.apple.developer.kernel.increased-memory-limit': true }
        : {}),
    },
    config: { usesNonExemptEncryption: false },
    infoPlist: {
      CFBundleAllowMixedLocalizations: true,
      NSSupportsLiveActivities: true,
    },
  },
  android: {
    package: variant.androidPackage,
    // The icon's sky and sun behind the launcher's mask, and its outline for themed icons.
    adaptiveIcon: {
      foregroundImage: './assets/android/adaptive-foreground.png',
      backgroundImage: './assets/android/adaptive-background.png',
      monochromeImage: './assets/android/adaptive-monochrome.png',
    },
    // No Android cloud backup: it would copy the encrypted database without its Keystore key, which
    // never leaves the phone, so a restore could not open it. 6pm Max's backup is the way across.
    allowBackup: false,
    // The close reminder rings at the close time on the dot where Android lets an app ask; from
    // Android 14 that is the person's choice, and without it the reminder comes within minutes.
    permissions: ['android.permission.SCHEDULE_EXACT_ALARM'],
    // 6pm only adds pictures to the gallery and never reads it: Scan chooses one through the system
    // Photo Picker. No overlay is ever drawn over other apps.
    blockedPermissions: [
      'android.permission.READ_MEDIA_IMAGES',
      'android.permission.READ_MEDIA_VIDEO',
      'android.permission.READ_MEDIA_AUDIO',
      'android.permission.READ_MEDIA_VISUAL_USER_SELECTED',
      'android.permission.SYSTEM_ALERT_WINDOW',
    ],
  },
  // Permission prompts in each language, generated from `@6pm/i18n`.
  locales: {
    en: './locales/en.json',
    vi: './locales/vi.json',
    'zh-Hans': './locales/zh-Hans.json',
    ja: './locales/ja.json',
    ko: './locales/ko.json',
    th: './locales/th.json',
    id: './locales/id.json',
    es: './locales/es.json',
    fr: './locales/fr.json',
    de: './locales/de.json',
  },
  plugins: [
    'expo-router',
    ['expo-sqlite', { useSQLCipher: true }],
    ['expo-font', { fonts: FONTS }],
    [
      'expo-splash-screen',
      { backgroundColor: LAUNCH_BACKGROUND, dark: { backgroundColor: LAUNCH_BACKGROUND } },
    ],
    // Android 8 at least: bank alerts are read in Android's JavaScript sandbox, which needs it.
    [
      'expo-build-properties',
      { android: { compileSdkVersion: 37, targetSdkVersion: 36, minSdkVersion: 26 } },
    ],
    [
      'expo-localization',
      { supportedLocales: ['en', 'vi', 'zh-Hans', 'ja', 'ko', 'th', 'id', 'es', 'fr', 'de'] },
    ],
    // Scan reads QR codes and receipts and never records; the microphone is voice's, and both plugins
    // write the same prompt so neither replaces the other's.
    [
      'expo-camera',
      {
        cameraPermission: PERMISSION.NSCameraUsageDescription,
        microphonePermission: PERMISSION.NSMicrophoneUsageDescription,
        recordAudioAndroid: false,
      },
    ],
    // Saying a spend, understood on the phone.
    [
      'expo-speech-recognition',
      {
        microphonePermission: PERMISSION.NSMicrophoneUsageDescription,
        speechRecognitionPermission: PERMISSION.NSSpeechRecognitionUsageDescription,
      },
    ],
    // The close receipt and the money diary are saved to Photos; 6pm never reads the library and
    // never asks to. The library's code still references reading, so App Store Connect rejects a
    // build without the read prompt's text (ITMS-90683): it says plainly that nothing is read.
    [
      'expo-media-library',
      {
        photosPermission: PERMISSION.NSPhotoLibraryUsageDescription,
        savePhotosPermission: PERMISSION.NSPhotoLibraryAddUsageDescription,
        // Android asks only for images: nothing is saved as audio or video.
        granularPermissions: ['photo'],
      },
    ],
    // Travel mode turns on abroad: the country, while the app is open, never in the background.
    [
      'expo-location',
      {
        locationWhenInUsePermission: PERMISSION.NSLocationWhenInUseUsageDescription,
        locationAlwaysAndWhenInUsePermission: false,
        locationAlwaysPermission: false,
        isIosBackgroundLocationEnabled: false,
        isAndroidBackgroundLocationEnabled: false,
      },
    ],
    // Budget together pairs two people with Sign in with Apple.
    'expo-apple-authentication',
    // Widgets, the Live Activity, controls, the share extension and the shortcuts: ./targets.
    ['@bacons/apple-targets', { appleTeamId: APPLE_TEAM_ID }],
    // Crash reports. Source maps and debug symbols upload only when the build has a Sentry token.
    [
      '@sentry/react-native/expo',
      {
        organization: 'quocs',
        project: '6pm',
        url: 'https://sentry.io/',
        disableAutoUpload: !process.env['SENTRY_AUTH_TOKEN'],
      },
    ],
    // The companion picker's app icons.
    ['./plugins/with-alternate-icons', { icons: COMPANION_ICONS }],
    // The App Shortcuts that open the app (Scan QR, Quick add), which the app itself declares.
    './plugins/with-app-intents',
    // Local reminders only (the close at six); no remote push yet.
    // Android's status bar draws the sun setting, in the default look's accent.
    [
      'expo-notifications',
      {
        enableBackgroundRemoteNotifications: false,
        icon: './assets/android/notification-icon.png',
        color: NOTIFICATION_ACCENT,
      },
    ],
    // Long-press 6pm's icon on Android: Scan QR and Quick add, the iPhone's App Shortcuts.
    ['./plugins/with-android-shortcuts', { background: LAUNCH_BACKGROUND }],
    // Home screen widgets and Quick Settings tiles, drawn by modules/surfaces.
    './plugins/with-android-widgets',
  ],
  experiments: {
    typedRoutes: true,
  },
  extra: {
    ...config.extra,
    appVariant,
    apiBase: `https://${variant.host}/api`,
    // The device token is kept in the App Group's keychain group so the share extension can read it.
    appGroup: variant.appGroup,
    eas: { projectId: EAS_PROJECT_ID },
  },
});
