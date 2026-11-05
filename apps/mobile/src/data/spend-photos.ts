import { PHOTO_NAME, type SpendRow } from '@6pm/domain';

import type { MoneyStore } from './money-store';

/**
 * The phone's photo folder (`photos/` in the app's documents), as the photo store uses it. The
 * app backs it with expo-file-system and Scan's native module (`device-photo-files`); tests with
 * a map in memory.
 */
export interface PhotoFiles {
  /** Every file name in the folder; none when it is not made yet. */
  names(): readonly string[];
  /** The `file://` URI a name is (or would be) at. */
  uri(name: string): string;
  /** Its size in bytes, or null when there is no such file. */
  size(name: string): number | null;
  /** Takes the file away; nothing happens when it is not there. */
  remove(name: string): void;
  /** The file's bytes, base64. */
  read(name: string): Promise<string>;
  /** Writes the bytes (base64) under the name, replacing any file there. */
  write(name: string, base64: string): Promise<void>;
  /** The picture at `from` kept under the name at its kept size (1600 px, about 300 KB). */
  keep(from: string, name: string): Promise<void>;
}

/**
 * A name for a new photo of the spend: its id, made safe for a file name, and when it was taken,
 * so a replaced photo never shows the one it replaced from a cache.
 */
export function photoNameFor(spendId: string, now: number): string {
  const safe = spendId.replace(/[^A-Za-z0-9_-]/g, '_').slice(0, 80) || 'spend';
  return `${safe}-${now.toString(36)}.jpg`;
}

/** A spend's photo as the store reads it: whose it is and whether the spend still stands. */
export interface HeldPhoto {
  readonly id: string;
  readonly photo: string;
  readonly status: SpendRow['status'];
}

/**
 * What a prune does: the files no standing spend holds (they go), and the spends whose photo is
 * gone or that were deleted (their photo is cleared).
 */
export function photoPrune(
  names: readonly string[],
  held: readonly HeldPhoto[],
): { readonly orphans: string[]; readonly clear: string[] } {
  const present = new Set(names);
  const live = held.filter((h) => h.status !== 'deleted' && PHOTO_NAME.test(h.photo));
  const kept = new Set(live.filter((h) => present.has(h.photo)).map((h) => h.photo));
  return {
    orphans: names.filter((name) => !kept.has(name)),
    clear: held.filter((h) => !kept.has(h.photo) || h.status === 'deleted').map((h) => h.id),
  };
}

async function heldPhotos(store: MoneyStore): Promise<HeldPhoto[]> {
  return store.db.getAllAsync<HeldPhoto>(
    'SELECT id, photo, status FROM spends WHERE photo IS NOT NULL',
    [],
  );
}

/**
 * At launch and after a restore: every file no standing spend holds is removed, and a spend
 * whose file is gone is told it has none. Runs in the store's turn, so no capture lands half way.
 */
export function prunePhotos(
  store: MoneyStore,
  files: PhotoFiles,
  photos: Pick<SpendPhotos, 'placing'> = NO_SPEND_PHOTOS,
): Promise<number> {
  return store.exclusive(async () => {
    // A photo being written for a spend right now is not an orphan yet.
    const names = files.names().filter((name) => !photos.placing(name));
    const { orphans, clear } = photoPrune(names, await heldPhotos(store));
    for (const name of orphans) files.remove(name);
    if (clear.length > 0) {
      const marks = clear.map(() => '?').join(', ');
      await store.db.runAsync(`UPDATE spends SET photo = NULL WHERE id IN (${marks})`, clear);
      await store.loadInTurn(store.getSnapshot().today);
    }
    return orphans.length;
  });
}

/** How many photos a delete or a remove holds on to for its undo, newest kept. */
const UNDO_HELD = 3;

/** The photo store the money actions write through. */
export interface SpendPhotos {
  /** A new name for the spend's photo, and the `file://` URI it goes at. */
  place(spendId: string): { readonly name: string; readonly uri: string };
  /** Whether a name `place` gave is still being written and saved. */
  placing(name: string): boolean;
  /** The name `place` gave is saved on its spend, or was given up. */
  placed(name: string): void;
  /** Takes the file away now. */
  remove(name: string): void;
  /**
   * Takes the file away now, held in memory for the undo: the spend was deleted or its photo
   * removed. Only the last few are held; an app that quits lets them go.
   */
  letGo(spendId: string, name: string): Promise<void>;
  /** Puts the photo `letGo` held back under its name; null when none is held. */
  bringBack(spendId: string): Promise<string | null>;
}

export function createSpendPhotos(files: PhotoFiles, now: () => number = Date.now): SpendPhotos {
  const held = new Map<string, { readonly name: string; readonly base64: string }>();
  const placing = new Set<string>();
  return {
    place: (spendId) => {
      const name = photoNameFor(spendId, now());
      placing.add(name);
      return { name, uri: files.uri(name) };
    },
    placing: (name) => placing.has(name),
    placed: (name) => {
      placing.delete(name);
    },
    remove: (name) => files.remove(name),
    letGo: async (spendId, name) => {
      if (files.size(name) !== null) {
        held.delete(spendId);
        held.set(spendId, { name, base64: await files.read(name) });
        while (held.size > UNDO_HELD) {
          const oldest = held.keys().next().value;
          if (oldest === undefined) break;
          held.delete(oldest);
        }
      }
      files.remove(name);
    },
    bringBack: async (spendId) => {
      const photo = held.get(spendId);
      if (!photo) return null;
      held.delete(spendId);
      await files.write(photo.name, photo.base64);
      return photo.name;
    },
  };
}

/** No photo folder: the store's tests, and code that never keeps photos. */
export const NO_SPEND_PHOTOS: SpendPhotos = {
  place: (spendId) => ({ name: photoNameFor(spendId, 0), uri: '' }),
  placing: () => false,
  placed: () => undefined,
  remove: () => undefined,
  letGo: () => Promise.resolve(),
  bringBack: () => Promise.resolve(null),
};
