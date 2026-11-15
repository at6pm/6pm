import { Directory, File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';

import { scanCamera } from '../../modules/scan-camera';
import { createCaptureLog, type CaptureLogFile } from './capture-log';

/** `capture-log/` in the app's documents: one file, while the log is on. */
const folder = () => new Directory(Paths.document, 'capture-log');
const logFile = () => new File(folder(), 'capture-log.jsonl');

let prepared: Promise<void> | null = null;

/**
 * Makes the folder once, left out of the phone's own backups as the photo folder is (6pm's
 * backup never reads it either): the log stays on this phone.
 */
function prepare(): Promise<void> {
  prepared ??= (async () => {
    const directory = folder();
    if (scanCamera) await scanCamera.preparePhotoFolder(directory.uri);
    else if (!directory.exists) directory.create({ intermediates: true, idempotent: true });
  })().catch((error: unknown) => {
    prepared = null;
    throw error;
  });
  return prepared;
}

const deviceFile: CaptureLogFile = {
  read: async () => {
    const file = logFile();
    return file.exists ? await file.text() : null;
  },
  write: async (text) => {
    await prepare();
    await logFile().write(text);
  },
  append: async (text) => {
    await prepare();
    const file = logFile();
    if (file.exists) await file.write(text, { append: true });
    else await file.write(text);
  },
  remove: () => {
    const file = logFile();
    if (file.exists) file.delete();
    return Promise.resolve();
  },
};

/** The capture log on this phone. */
export const deviceCaptureLog = createCaptureLog(deviceFile);

/** The name the log goes by in the share sheet: `6pm-capture-log-2026-11-15.txt`. */
const sentName = (today: string) => `6pm-capture-log-${today.replace(/[^0-9-]/g, '')}.txt`;

/**
 * "Send the log": the share sheet with a copy of what the log holds now, every expired event
 * dropped, as a text file the person sends wherever they choose. The copy waits in the cache only
 * while the sheet has it. Resolves false when the log is off.
 */
export async function sendCaptureLog(today: string): Promise<boolean> {
  const text = await deviceCaptureLog.text();
  if (text === null) return false;
  const copy = new File(Paths.cache, sentName(today));
  await copy.write(text);
  try {
    await Sharing.shareAsync(copy.uri, { mimeType: 'text/plain', UTI: 'public.plain-text' });
  } finally {
    try {
      copy.delete();
    } catch {
      // Already gone, or iOS cleared the cache itself.
    }
  }
  return true;
}
