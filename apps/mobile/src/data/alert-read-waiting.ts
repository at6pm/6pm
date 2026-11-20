import { alertReadWaitingSchema, alertReadsStillWaiting, type AlertReadWaiting } from '@6pm/domain';

import { UNREAD_ALERT_WAIT_MS } from './inbox-import';
import { createQueue } from './store-queue';

/**
 * The file the waiting alerts are kept in: in the app's own storage on this phone, never in 6pm's
 * backup and never synced. A file held in memory stands in for it in tests.
 */
export interface AlertReadWaitingFile {
  /** The file's text; null when there is no file. */
  read(): Promise<string | null>;
  write(text: string): Promise<void>;
  /** Deletes the file; nothing happens when there is none. */
  remove(): Promise<void>;
}

/**
 * The caught bank alerts whose second reading got no answer, each with its words, waiting to be
 * asked about again. An entry goes when the server has answered, when its alert is two days old
 * (as long as an alert the phone could not read waits), or with everything else when the person
 * deletes their data. The file is there only while
 * something waits.
 */
export interface AlertReadsWaiting {
  /** Keeps one alert waiting; a second keeping of the same alert takes the first one's place. */
  keep(entry: AlertReadWaiting): Promise<void>;
  /** What still waits, oldest first; an alert past its two days is dropped here. */
  list(): Promise<readonly AlertReadWaiting[]>;
  /** Lets these alerts go, by their own ids. */
  drop(captureIds: readonly string[]): Promise<void>;
  /** Lets every one go. */
  clear(): Promise<void>;
}

export function createAlertReadsWaiting(
  file: AlertReadWaitingFile,
  now: () => number = Date.now,
): AlertReadsWaiting {
  const inTurn = createQueue();

  const parse = (text: string | null): AlertReadWaiting[] => {
    if (text === null) return [];
    try {
      const read = alertReadWaitingSchema.array().safeParse(JSON.parse(text));
      return read.success ? read.data : [];
    } catch {
      return [];
    }
  };

  /** The file as it stands, the expired entries dropped and written away. */
  const load = async (): Promise<AlertReadWaiting[]> => {
    const text = await file.read();
    const held = parse(text);
    const young = alertReadsStillWaiting(held, now(), UNREAD_ALERT_WAIT_MS);
    if (text !== null && young.length !== held.length) await store(young);
    else if (text !== null && held.length === 0) await file.remove();
    return young;
  };

  const store = async (entries: readonly AlertReadWaiting[]) => {
    if (entries.length === 0) await file.remove();
    else await file.write(JSON.stringify(entries));
  };

  return {
    keep: (entry) =>
      inTurn(async () => {
        const others = (await load()).filter((held) => held.captureId !== entry.captureId);
        await store([...others, entry]);
      }),
    list: () =>
      inTurn(async () =>
        [...(await load())].sort((a, b) => (a.at < b.at ? -1 : a.at > b.at ? 1 : 0)),
      ),
    drop: (captureIds) =>
      inTurn(async () => {
        if (captureIds.length === 0) return;
        const held = await load();
        const left = held.filter((entry) => !captureIds.includes(entry.captureId));
        if (left.length !== held.length) await store(left);
      }),
    clear: () => inTurn(() => file.remove()),
  };
}

/** A file held in memory, for tests. */
export function memoryAlertReadWaitingFile(): AlertReadWaitingFile & {
  readonly contents: () => string | null;
} {
  let text: string | null = null;
  return {
    contents: () => text,
    read: () => Promise.resolve(text),
    write: (next) => {
      text = next;
      return Promise.resolve();
    },
    remove: () => {
      text = null;
      return Promise.resolve();
    },
  };
}
