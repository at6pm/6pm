// @ts-check
// Expo loads config plugins with Node's CommonJS loader, so this uses require and module.exports.
/* eslint-disable @typescript-eslint/no-require-imports -- CommonJS, see above */
const fs = require('node:fs');
const path = require('node:path');

const {
  AndroidConfig,
  withAndroidManifest,
  withDangerousMod,
  withStringsXml,
} = require('expo/config-plugins');
/* eslint-enable @typescript-eslint/no-require-imports */

/**
 * The launcher shortcuts Android shows on a long press of 6pm's icon: Scan QR and Quick add, the
 * two App Shortcuts the iPhone offers. Each opens its screen through the app's own scheme, as the
 * iOS intents do. Their labels are `sixpm_shortcut_*` strings: each language's comes from
 * `locales/<lang>.json` (`android`), and the English default is written here. The icons are the
 * app's sky behind a white glyph, drawn as adaptive icons so every launcher masks them alike.
 */

/** Material Icons' `qr_code_scanner` and `add`, 24 × 24. */
const GLYPHS = {
  scan: 'M9.5,6.5v3h-3v-3H9.5M11,5H5v6h6V5L11,5zM9.5,14.5v3h-3v-3H9.5M11,13H5v6h6V13L11,13zM17.5,6.5v3h-3v-3H17.5M19,5h-6v6h6V5L19,5zM13,13h1.5v1.5H13V13zM14.5,14.5H16V16h-1.5V14.5zM16,13h1.5v1.5H16V13zM13,16h1.5v1.5H13V16zM14.5,17.5H16V19h-1.5V17.5zM16,16h1.5v1.5H16V16zM17.5,14.5H19V16h-1.5V14.5zM17.5,17.5H19V19h-1.5V17.5zM22,7h-2V4h-3V2h5V7zM22,22v-5h-2v3h-3v2H22zM2,22h5v-2H4v-3H2V22zM2,2v5h2V4h3V2H2z',
  quick_add: 'M19,13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z',
};

/** Each shortcut: its id, the route it opens and its glyph. */
const SHORTCUTS = [
  { id: 'scan', route: 'scan', glyph: 'scan' },
  { id: 'quick_add', route: 'quick-add', glyph: 'quick_add' },
];

/** @param {string} body */
const xml = (body) => `<?xml version="1.0" encoding="utf-8"?>\n${body}\n`;

/** @param {string} glyph */
function glyphDrawable(glyph) {
  // 108 dp like an adaptive icon's layer; the 24 dp glyph is drawn at 48 dp in its middle.
  return xml(`<vector xmlns:android="http://schemas.android.com/apk/res/android"
  android:width="108dp"
  android:height="108dp"
  android:viewportWidth="108"
  android:viewportHeight="108">
  <group android:translateX="30" android:translateY="30" android:scaleX="2" android:scaleY="2">
    <path android:fillColor="#FFFFFFFF" android:pathData="${GLYPHS[glyph]}" />
  </group>
</vector>`);
}

/** @param {string} id */
function iconDrawable(id) {
  return xml(`<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">
  <background android:drawable="@color/sixpm_shortcut_background" />
  <foreground android:drawable="@drawable/sixpm_shortcut_${id}_glyph" />
</adaptive-icon>`);
}

/**
 * @param {string} pkg
 * @param {string} scheme
 */
function shortcutsXml(pkg, scheme) {
  const items = SHORTCUTS.map(
    (s) => `  <shortcut
    android:shortcutId="${s.id}"
    android:enabled="true"
    android:icon="@drawable/sixpm_shortcut_${s.id}"
    android:shortcutShortLabel="@string/sixpm_shortcut_${s.id}">
    <intent
      android:action="android.intent.action.VIEW"
      android:targetPackage="${pkg}"
      android:targetClass="${pkg}.MainActivity"
      android:data="${scheme}://${s.route}" />
  </shortcut>`,
  );
  return xml(
    `<shortcuts xmlns:android="http://schemas.android.com/apk/res/android">\n${items.join('\n')}\n</shortcuts>`,
  );
}

/**
 * @param {import('expo/config').ExpoConfig} config
 * @param {{ background: string }} props
 */
module.exports = function withAndroidShortcuts(config, { background }) {
  const pkg = config.android?.package;
  const scheme = Array.isArray(config.scheme) ? config.scheme[0] : config.scheme;
  if (!pkg || !scheme) throw new Error('with-android-shortcuts needs android.package and scheme');

  config = withDangerousMod(config, [
    'android',
    (c) => {
      const res = path.join(c.modRequest.platformProjectRoot, 'app/src/main/res');
      const write = (/** @type {string} */ file, /** @type {string} */ body) => {
        fs.mkdirSync(path.dirname(path.join(res, file)), { recursive: true });
        fs.writeFileSync(path.join(res, file), body);
      };
      write('xml/sixpm_shortcuts.xml', shortcutsXml(pkg, scheme));
      write(
        'values/sixpm_shortcut_colors.xml',
        xml(
          `<resources>\n  <color name="sixpm_shortcut_background">${background}</color>\n</resources>`,
        ),
      );
      for (const s of SHORTCUTS) {
        write(`drawable/sixpm_shortcut_${s.id}_glyph.xml`, glyphDrawable(s.glyph));
        write(`drawable/sixpm_shortcut_${s.id}.xml`, iconDrawable(s.id));
      }
      return c;
    },
  ]);

  // The English labels, the default every other language's strings fall back to.
  config = withStringsXml(config, (c) => {
    const english = JSON.parse(
      fs.readFileSync(path.join(c.modRequest.projectRoot, 'locales/en.json'), 'utf8'),
    ).android;
    for (const [name, value] of Object.entries(english)) {
      c.modResults = AndroidConfig.Strings.setStringItem(
        [{ $: { name }, _: String(value) }],
        c.modResults,
      );
    }
    return c;
  });

  return withAndroidManifest(config, (c) => {
    const activity = AndroidConfig.Manifest.getMainActivityOrThrow(c.modResults);
    const meta = (activity['meta-data'] ??= []);
    if (!meta.some((m) => m.$['android:name'] === 'android.app.shortcuts')) {
      meta.push({
        $: { 'android:name': 'android.app.shortcuts', 'android:resource': '@xml/sixpm_shortcuts' },
      });
    }
    return c;
  });
};
