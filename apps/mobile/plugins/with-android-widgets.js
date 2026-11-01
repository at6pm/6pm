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
 * 6pm's Home screen widgets and Quick Settings tiles on Android, the iPhone's widgets and controls:
 * Safe today (small, or medium with Scan QR and Quick add), Today (the day's spends), and the Scan
 * QR and Quick add tiles. They are drawn by `modules/surfaces` (`ai.sixpm.surfaces.widgets`) from
 * the snapshot the app writes; this declares them to the launcher. Their names and descriptions
 * are `sixpm_widget_*` strings from `locales/<lang>.json` (`android`), and the tiles share the
 * launcher shortcuts' labels.
 */

const PACKAGE = 'ai.sixpm.surfaces.widgets';

/**
 * Each widget: its receiver, provider file, cells, size (and the least it resizes to), words, and
 * the picture the widget picker shows (`modules/surfaces` draws them in English and Vietnamese at dusk).
 */
const WIDGETS = [
  {
    receiver: 'SafeTodayWidget',
    info: 'sixpm_widget_safe',
    // Added medium, as its picture shows; it shrinks to the small layout below 250 dp.
    cells: [4, 2],
    min: [250, 110],
    resize: [110, 110],
    name: 'sixpm_widget_safe_name',
    description: 'sixpm_widget_safe_description',
    preview: 'sixpm_widget_safe_preview',
  },
  {
    receiver: 'TodayListWidget',
    info: 'sixpm_widget_today',
    cells: [4, 3],
    min: [250, 250],
    resize: [250, 250],
    name: 'sixpm_widget_today_name',
    description: 'sixpm_widget_today_description',
    preview: 'sixpm_widget_today_preview',
  },
];

/** Each tile: its service, label and icon. */
const TILES = [
  { service: 'ScanTile', label: 'sixpm_shortcut_scan', icon: 'sixpm_tile_scan' },
  { service: 'QuickAddTile', label: 'sixpm_shortcut_quick_add', icon: 'sixpm_tile_add' },
];

/** @param {typeof WIDGETS[number]} widget */
function providerXml(widget) {
  const [cellsWide, cellsHigh] = widget.cells;
  const [minWidth, minHeight] = widget.min;
  const [resizeWidth, resizeHeight] = widget.resize;
  // Drawn again every half hour, the most Android allows, so the colours follow the hour.
  return `<?xml version="1.0" encoding="utf-8"?>
<appwidget-provider xmlns:android="http://schemas.android.com/apk/res/android"
  android:minWidth="${minWidth}dp"
  android:minHeight="${minHeight}dp"
  android:minResizeWidth="${resizeWidth}dp"
  android:minResizeHeight="${resizeHeight}dp"
  android:targetCellWidth="${cellsWide}"
  android:targetCellHeight="${cellsHigh}"
  android:resizeMode="horizontal|vertical"
  android:widgetCategory="home_screen"
  android:updatePeriodMillis="1800000"
  android:initialLayout="@layout/sixpm_widget_loading"
  android:previewImage="@drawable/${widget.preview}"
  android:description="@string/${widget.description}" />
`;
}

/**
 * @param {import('expo/config').ExpoConfig} config
 */
module.exports = function withAndroidWidgets(config) {
  const scheme = Array.isArray(config.scheme) ? config.scheme[0] : config.scheme;
  if (!scheme) throw new Error('with-android-widgets needs a scheme');

  config = withDangerousMod(config, [
    'android',
    (c) => {
      const res = path.join(c.modRequest.platformProjectRoot, 'app/src/main/res/xml');
      fs.mkdirSync(res, { recursive: true });
      for (const widget of WIDGETS) {
        fs.writeFileSync(path.join(res, `${widget.info}.xml`), providerXml(widget));
      }
      return c;
    },
  ]);

  // The scheme the widgets and tiles open the app with, which differs between builds.
  config = withStringsXml(config, (c) => {
    c.modResults = AndroidConfig.Strings.setStringItem(
      [{ $: { name: 'sixpm_link_scheme', translatable: 'false' }, _: scheme }],
      c.modResults,
    );
    return c;
  });

  return withAndroidManifest(config, (c) => {
    const app = AndroidConfig.Manifest.getMainApplicationOrThrow(c.modResults);
    const receivers = (app.receiver ??= []);
    for (const widget of WIDGETS) {
      const name = `${PACKAGE}.${widget.receiver}`;
      if (receivers.some((r) => r.$['android:name'] === name)) continue;
      receivers.push({
        $: {
          'android:name': name,
          'android:exported': 'false',
          'android:label': `@string/${widget.name}`,
        },
        'intent-filter': [
          { action: [{ $: { 'android:name': 'android.appwidget.action.APPWIDGET_UPDATE' } }] },
        ],
        'meta-data': [
          {
            $: {
              'android:name': 'android.appwidget.provider',
              'android:resource': `@xml/${widget.info}`,
            },
          },
        ],
      });
    }
    const services = (app.service ??= []);
    for (const tile of TILES) {
      const name = `${PACKAGE}.${tile.service}`;
      if (services.some((s) => s.$['android:name'] === name)) continue;
      services.push({
        $: {
          'android:name': name,
          'android:exported': 'true',
          'android:label': `@string/${tile.label}`,
          'android:icon': `@drawable/${tile.icon}`,
          'android:permission': 'android.permission.BIND_QUICK_SETTINGS_TILE',
        },
        'intent-filter': [
          { action: [{ $: { 'android:name': 'android.service.quicksettings.action.QS_TILE' } }] },
        ],
      });
    }
    return c;
  });
};
