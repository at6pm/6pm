// @ts-check
// Expo loads config plugins with Node's CommonJS loader, so this uses require and module.exports.
/* eslint-disable @typescript-eslint/no-require-imports -- CommonJS, see above */
const path = require('node:path');

const { IOSConfig } = require('expo/config-plugins');

// The targets plugin writes the project through a mod of its own, after Expo's: the extensions
// exist only there, so this edits them through the same mod and the same Xcode library.
const baconsXcode = require.resolve('@bacons/apple-targets/build/with-bacons-xcode');
const { withXcodeProjectBeta } = require(baconsXcode);
const { PBXNativeTarget, PBXShellScriptBuildPhase } = require(
  require.resolve('@bacons/xcode', { paths: [path.dirname(baconsXcode)] }),
);
/* eslint-enable @typescript-eslint/no-require-imports */

/** The extensions' product types: the share and widget extensions, and the intents one. */
const EXTENSION_TYPES = new Set([
  'com.apple.product-type.app-extension',
  'com.apple.product-type.extensionkit-extension',
]);

const PHASE = 'Take the app’s version';

/**
 * The step each extension builds last: the version and build number of the app it sits in, read
 * from the app's own Info.plist as it stands at build time. EAS writes the build number it keeps
 * into that file after prebuild, so only a step at build time can follow it.
 *
 * @param {string} appPlist
 */
function versionScript(appPlist) {
  return [
    'set -e',
    `APP_PLIST="$SRCROOT/${appPlist}"`,
    'OUT="$TARGET_BUILD_DIR/$INFOPLIST_PATH"',
    'for KEY in CFBundleVersion CFBundleShortVersionString; do',
    '  VALUE=$(/usr/libexec/PlistBuddy -c "Print :$KEY" "$APP_PLIST")',
    '  /usr/libexec/PlistBuddy -c "Set :$KEY $VALUE" "$OUT" 2>/dev/null ||',
    '    /usr/libexec/PlistBuddy -c "Add :$KEY string $VALUE" "$OUT"',
    'done',
  ].join('\n');
}

/**
 * Every app extension carries the version and build number of the app that holds it, as App Store
 * Connect expects: their build settings take the app's at prebuild, and a last build step copies
 * the app's Info.plist values into each extension's, so a build number set after prebuild (EAS's
 * remote one) reaches them too. Without this the intents extension stayed at 1 and 1.0, and the
 * others at 1. Listed before the targets plugin in the app config, so it runs after it.
 *
 * @param {import('expo/config').ExpoConfig} config
 */
function withExtensionVersions(config) {
  return withXcodeProjectBeta(config, (mod) => {
    const project = mod.modResults;
    const projectName = IOSConfig.XcodeUtils.getProjectName(mod.modRequest.projectRoot);
    const version = config.ios?.version || config.version || '1.0.0';
    const build = config.ios?.buildNumber || '1';
    for (const target of project.rootObject.props.targets) {
      if (!PBXNativeTarget.is(target)) continue;
      if (!EXTENSION_TYPES.has(String(target.props.productType).replace(/"/g, ''))) continue;
      target.setBuildSetting('CURRENT_PROJECT_VERSION', build);
      target.setBuildSetting('MARKETING_VERSION', version);
      // The step below edits the extension's processed Info.plist in place, which a sandboxed
      // script may not write.
      target.setBuildSetting('ENABLE_USER_SCRIPT_SANDBOXING', 'NO');
      const known = target.props.buildPhases.some(
        (/** @type {any} */ phase) =>
          PBXShellScriptBuildPhase.is(phase) && phase.props.name === PHASE,
      );
      if (known) continue;
      target.createBuildPhase(PBXShellScriptBuildPhase, {
        name: PHASE,
        shellPath: '/bin/sh',
        shellScript: versionScript(`${projectName}/Info.plist`),
        // The extension's own processed Info.plist is an input, so the step runs after Xcode writes
        // it; naming it an output would make two steps produce one file.
        inputPaths: [
          `$(SRCROOT)/${projectName}/Info.plist`,
          '$(TARGET_BUILD_DIR)/$(INFOPLIST_PATH)',
        ],
        outputPaths: [],
        alwaysOutOfDate: 1,
        files: [],
        inputFileListPaths: [],
        outputFileListPaths: [],
        buildActionMask: 2147483647,
        runOnlyForDeploymentPostprocessing: 0,
      });
    }
    return mod;
  });
}

module.exports = withExtensionVersions;
