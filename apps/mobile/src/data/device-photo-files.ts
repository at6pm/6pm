import { Directory, File, Paths } from 'expo-file-system';

import { scanCamera } from '../../modules/scan-camera';
import { createSpendPhotos, type PhotoFiles } from './spend-photos';

/** `photos/` in the app's documents: one JPEG per spend that keeps a photo. */
const folder = () => new Directory(Paths.document, 'photos');

let prepared: Promise<void> | null = null;

/** Makes the folder once, left out of the phone's own backups (only 6pm's sealed one carries it). */
function prepare(): Promise<void> {
  prepared ??= (scanCamera?.preparePhotoFolder(folder().uri) ?? Promise.resolve()).catch(
    (error: unknown) => {
      prepared = null;
      throw error;
    },
  );
  return prepared;
}

const fileOf = (name: string) => new File(folder(), name);

/** The photo folder on this phone. */
export const devicePhotoFiles: PhotoFiles = {
  names: () => {
    const directory = folder();
    if (!directory.exists) return [];
    return directory
      .list()
      .filter((entry) => entry instanceof File)
      .map((entry) => entry.name);
  },
  uri: (name) => fileOf(name).uri,
  size: (name) => {
    const file = fileOf(name);
    return file.exists ? file.size : null;
  },
  remove: (name) => {
    const file = fileOf(name);
    if (file.exists) file.delete();
  },
  read: (name) => fileOf(name).base64(),
  write: async (name, base64) => {
    await prepare();
    await fileOf(name).write(base64, { encoding: 'base64' });
  },
  keep: async (from, name) => {
    await keepPhotoAt(from, fileOf(name).uri);
  },
};

/** The picture at `from` kept at `to` at its kept size, by Scan's native module. */
export async function keepPhotoAt(from: string, to: string): Promise<void> {
  if (!scanCamera) throw new Error('Photos cannot be kept here');
  await scanCamera.keepPhoto(from, to);
}

/** The `file://` URI a spend's photo is at, for an image to show. */
export function photoUri(name: string): string {
  return devicePhotoFiles.uri(name);
}

/** The one photo store the app writes through. */
export const deviceSpendPhotos = createSpendPhotos(devicePhotoFiles);
