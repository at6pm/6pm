import { Directory, File, Paths } from 'expo-file-system';

import { scanCamera } from '../../modules/scan-camera';
import { createAlertReadsWaiting, type AlertReadWaitingFile } from './alert-read-waiting';

/** `alert-reads/` in the app's documents: one file, while an alert waits for its second reading. */
const folder = () => new Directory(Paths.document, 'alert-reads');
const waitingFile = () => new File(folder(), 'waiting.json');

let prepared: Promise<void> | null = null;

/**
 * Makes the folder once, left out of the phone's own backups as the capture log's is (6pm's
 * backup never reads it either): an alert's words stay on this phone.
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

const deviceFile: AlertReadWaitingFile = {
  read: async () => {
    const file = waitingFile();
    return file.exists ? await file.text() : null;
  },
  write: async (text) => {
    await prepare();
    await waitingFile().write(text);
  },
  remove: () => {
    const file = waitingFile();
    if (file.exists) file.delete();
    return Promise.resolve();
  },
};

/** The alerts waiting for their second reading on this phone. */
export const deviceAlertReadsWaiting = createAlertReadsWaiting(deviceFile);
