import { Directory, File, Paths } from 'expo-file-system';
import type { ComponentRef, RefObject } from 'react';
import { Platform, Share, type View } from 'react-native';

import { captureView, encodePng } from '../sharing/capture-view';
import { shareFileName, withShareFile, type ShareFolder } from '../sharing/share-file';
import { shareImage } from '../sharing/share-image';

/** The app's cache, where the strip's image waits only while the share sheet has it. */
const cache: ShareFolder = {
  names: () => {
    const folder = new Directory(Paths.cache);
    return folder.exists ? folder.list().map((entry) => entry.name) : [];
  },
  write: async (name, bytes) => {
    const file = new File(Paths.cache, name);
    await file.write(bytes);
    return file.uri;
  },
  remove: (name) => new File(Paths.cache, name).delete(),
};

/**
 * Sends the strip as an image with a short message: the view drawn as a PNG (its own sky and the
 * "made with 6pm" mark), and the words beside it where the receiving app takes both (iOS). Android's
 * share sheet takes the image alone. Resolves when the sheet closes, shared or cancelled.
 */
export async function shareStrip(
  view: RefObject<ComponentRef<typeof View> | null>,
  key: string,
  message: string,
): Promise<void> {
  const image = await captureView(view);
  const name = shareFileName('payment-qr', key);
  if (Platform.OS !== 'ios') return shareImage(image, name);
  await withShareFile(cache, name, encodePng(image), async (url) => {
    await Share.share({ url, message });
  });
}

/** Outside Vietnam there is no QR: the Ask is the message alone. */
export async function shareMessage(message: string): Promise<void> {
  await Share.share({ message });
}
