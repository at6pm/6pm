// Draws the Play listing's large-screen shots: `node compose.mjs <captures dir> <out dir>`.
// Each shot in shots.mjs is rendered by headless Chrome at its exact size from shot.html, around
// the capture named `<lang>-<screen>.png` in the captures folder. A missing capture is skipped.
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import { shots } from './shots.mjs';

const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const here = dirname(fileURLToPath(import.meta.url));
const [capturesDir, outDir] = process.argv.slice(2);
if (!capturesDir || !outDir) throw new Error('usage: node compose.mjs <captures dir> <out dir>');
const profile = mkdtempSync(join(tmpdir(), 'sixpm-shots-'));

for (const shot of shots) {
  const out = resolve(outDir, shot.out);
  mkdirSync(dirname(out), { recursive: true });
  const source = resolve(capturesDir, shot.capture);
  if (!existsSync(source)) {
    console.warn(`no capture for ${shot.out}: ${shot.capture}`);
    continue;
  }
  const capture = pathToFileURL(source).href;
  const page = `${pathToFileURL(join(here, 'shot.html')).href}#${encodeURIComponent(JSON.stringify({ ...shot, capture }))}`;
  execFileSync(
    CHROME,
    [
      '--headless=new',
      `--user-data-dir=${profile}`,
      '--hide-scrollbars',
      '--force-device-scale-factor=1',
      '--allow-file-access-from-files',
      '--virtual-time-budget=4000',
      `--window-size=${shot.width},${shot.height}`,
      `--screenshot=${out}`,
      page,
    ],
    { stdio: 'ignore' },
  );
  console.log(out);
}
