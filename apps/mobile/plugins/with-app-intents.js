// @ts-check
// Expo loads config plugins with Node's CommonJS loader, so this uses require and module.exports.
/* eslint-disable @typescript-eslint/no-require-imports -- CommonJS, see above */
const fs = require('node:fs');
const path = require('node:path');

const { IOSConfig, withDangerousMod, withXcodeProject } = require('expo/config-plugins');
/* eslint-enable @typescript-eslint/no-require-imports */

/** What only the app target builds (its App Shortcuts and their phrases), in `targets/_app`. */
const SOURCE = 'targets/_app';

/** `<lang>.lproj` folders under a directory. */
function lprojs(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir).filter((name) => name.endsWith('.lproj'));
}

/**
 * The files the app target takes: its Swift and its App Shortcuts phrases. The `Intents` table the
 * titles read comes in with `targets/_shared`, which every target links.
 *
 * @param {string} projectRoot
 * @returns {{ swift: string[]; strings: { lang: string; from: string; name: string }[] }}
 */
function appIntentFiles(projectRoot) {
  const source = path.join(projectRoot, SOURCE);
  const swift = fs.readdirSync(source).filter((name) => name.endsWith('.swift'));
  const strings = [];
  for (const lang of lprojs(source)) {
    for (const name of fs.readdirSync(path.join(source, lang))) {
      strings.push({ lang, from: path.join(source, lang, name), name });
    }
  }
  return { swift, strings };
}

/**
 * Intents that open the app run in the app itself: iOS brings the app forward and calls
 * `perform()` there. Scan QR and Quick add are such intents (`targets/widgets/_shared`, built into
 * the app and the widget extension, whose controls run them), so their App Shortcuts are declared
 * by the app, from here; the intents extension keeps the shortcuts that work without the app.
 *
 * @param {import('expo/config').ExpoConfig} config
 */
function withAppIntents(config) {
  config = withDangerousMod(config, [
    'ios',
    (mod) => {
      const { projectRoot, platformProjectRoot } = mod.modRequest;
      const projectName = IOSConfig.XcodeUtils.getProjectName(projectRoot);
      const target = path.join(platformProjectRoot, projectName);
      const { swift, strings } = appIntentFiles(projectRoot);
      for (const name of swift) {
        fs.copyFileSync(path.join(projectRoot, SOURCE, name), path.join(target, name));
      }
      for (const { lang, from, name } of strings) {
        const dir = path.join(target, 'Supporting', lang);
        fs.mkdirSync(dir, { recursive: true });
        fs.copyFileSync(from, path.join(dir, name));
      }
      return mod;
    },
  ]);

  return withXcodeProject(config, (mod) => {
    const { projectRoot } = mod.modRequest;
    const projectName = IOSConfig.XcodeUtils.getProjectName(projectRoot);
    let project = mod.modResults;
    const { swift, strings } = appIntentFiles(projectRoot);
    for (const name of swift) {
      if (project.hasFile(`${projectName}/${name}`)) continue;
      project = IOSConfig.XcodeUtils.addBuildSourceFileToGroup({
        filepath: `${projectName}/${name}`,
        groupName: projectName,
        project,
      });
    }
    for (const { lang, name } of strings) {
      const groupName = `${projectName}/Supporting/${lang}`;
      const group = IOSConfig.XcodeUtils.ensureGroupRecursively(project, groupName);
      if (group?.children.some(({ comment }) => comment === name)) continue;
      project = IOSConfig.XcodeUtils.addResourceFileToGroup({
        filepath: `${lang}/${name}`,
        groupName,
        project,
        isBuildFile: true,
        verbose: false,
      });
    }
    mod.modResults = project;
    return mod;
  });
}

module.exports = withAppIntents;
