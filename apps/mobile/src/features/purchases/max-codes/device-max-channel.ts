import * as Application from 'expo-application';
import { File, Paths } from 'expo-file-system';
import { Platform } from 'react-native';

import type { MaxChannel } from '@6pm/domain';

import { createMaxChannelMemory, type MaxChannelFile } from './max-channel-memory';

/** `max-channel.json` in the app's documents: a few dozen bytes, this phone only. */
const channelFile = () => new File(Paths.document, 'max-channel.json');

const deviceFile: MaxChannelFile = {
  read: async () => {
    const file = channelFile();
    return file.exists ? await file.text() : null;
  },
  write: async (text) => {
    await channelFile().write(text);
  },
  remove: () => {
    const file = channelFile();
    if (file.exists) file.delete();
    return Promise.resolve();
  },
};

/** The Max channel memory on this phone. */
export const deviceMaxChannel = createMaxChannelMemory(deviceFile);

/**
 * Where a Max code came from: `threads`, `youtube`, `facebook`, `tinhte` (a place 6pm posts in),
 * `friend` (a "Give a friend Max" link) or `other` (a code typed into the store's redemption with
 * no link before it).
 */
export type Channel = MaxChannel;

/**
 * The shared contract with the funnel counts: the channel of the last Max code link opened on this
 * phone (or of a code redeemed in the app with no link, as `other`), if that was in the last 30
 * days; null otherwise. Read it at the moment Max is bought and send only the slug (the step
 * `max_bought_from`). It carries no code, no device id and nothing about the person, and it says
 * where they came through, not that the store took a code: the stores' own per-code counts are
 * that proof. On iPhone a code link goes straight to the App Store's redemption, so the app learns
 * a channel there only from a link that opened 6pm itself.
 */
export function readMaxChannel(): Promise<Channel | null> {
  return deviceMaxChannel.channel().catch(() => null);
}

/**
 * On Android, once per install, reads Google Play's install referrer, so an install that came
 * through a code link keeps its channel and code. Nothing to read on iPhone.
 */
export function checkInstallReferrer(): Promise<void> {
  if (Platform.OS !== 'android') return Promise.resolve();
  return deviceMaxChannel
    .checkReferrer(() => Application.getInstallReferrerAsync())
    .catch(() => undefined);
}
