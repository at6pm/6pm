import {
  CAPTURE_LOG_DAYS,
  captureLogHead,
  captureLogLine,
  captureLogText,
  readCaptureLog,
  type CaptureLogContents,
  type CaptureLogEvent,
} from '@6pm/domain';

import { createQueue } from './store-queue';

/**
 * The file the capture log is kept in: in the app's own storage on this phone, never in 6pm's
 * backup and never synced. A file held in memory stands in for it in tests.
 */
export interface CaptureLogFile {
  /** The file's text; null when there is no file. */
  read(): Promise<string | null>;
  write(text: string): Promise<void>;
  append(text: string): Promise<void>;
  /** Deletes the file; nothing happens when there is none. */
  remove(): Promise<void>;
}

/**
 * The capture log: off until the person turns it on in Settings. While on, every capture adds
 * what it was handed, the sighting read from it, the step that decided and the row it touched.
 * An event is kept `CAPTURE_LOG_DAYS` days, then dropped. Turning it off deletes the file. It
 * never leaves the phone by itself: only "Send the log" hands its text to the share sheet.
 */
export interface CaptureLog {
  isOn(): Promise<boolean>;
  turnOn(): Promise<void>;
  /** Turns the log off and deletes everything it holds. */
  turnOff(): Promise<void>;
  /** Adds one event, when the log is on; never rejects, so a capture never fails for its log. */
  record(event: CaptureLogEvent): Promise<void>;
  /** What the log holds now, oldest first; null when it is off. */
  read(): Promise<CaptureLogContents | null>;
  /** The file's text as it would be sent, every expired event dropped; null when it is off. */
  text(): Promise<string | null>;
  /** Told after every change; returns the way to stop being told. */
  subscribe(listener: () => void): () => void;
}

const KEEP_MS = CAPTURE_LOG_DAYS * 24 * 60 * 60_000;

export function createCaptureLog(
  file: CaptureLogFile,
  now: () => Date = () => new Date(),
): CaptureLog {
  const inTurn = createQueue();
  const listeners = new Set<() => void>();
  const notify = () => {
    for (const listener of listeners) listener();
  };
  /** Known once the file has been read: whether it exists, and its oldest event's time. */
  type State = { readonly on: boolean; readonly oldest: number | null };
  let state: State | null = null;
  const OFF: State = { on: false, oldest: null };

  /** The log as the file holds it, the expired events dropped and written away. */
  const load = async (): Promise<CaptureLogContents | null> => {
    const text = await file.read();
    const contents = text === null ? null : readCaptureLog(text, now());
    if (text !== null && contents === null) {
      // Not a log this build can read: it starts again rather than growing a file nobody reads.
      await file.remove();
    }
    if (contents === null) {
      state = OFF;
      return null;
    }
    const kept = captureLogText(contents);
    if (kept !== text) await file.write(kept);
    const first = contents.events[0];
    state = { on: true, oldest: first ? Date.parse(first.loggedAt) : null };
    return contents;
  };

  const known = async (): Promise<State> => {
    if (state) return state;
    const contents = await load();
    if (!contents) return OFF;
    const first = contents.events[0];
    return { on: true, oldest: first ? Date.parse(first.loggedAt) : null };
  };

  return {
    isOn: () => inTurn(async () => (await known()).on),
    turnOn: () =>
      inTurn(async () => {
        if ((await known()).on) return;
        await file.write(captureLogHead(now()));
        state = { on: true, oldest: null };
        notify();
      }),
    turnOff: () =>
      inTurn(async () => {
        await file.remove();
        state = { on: false, oldest: null };
        notify();
      }),
    record: (event) =>
      inTurn(async () => {
        const at = await known();
        if (!at.on) return;
        // An event past its fourteen days goes before the new one is added.
        if (at.oldest !== null && at.oldest < now().getTime() - KEEP_MS) {
          if ((await load()) === null) return;
        }
        await file.append(captureLogLine(event));
        if (state === null || state.oldest === null) {
          state = { on: true, oldest: Date.parse(event.loggedAt) };
        }
        notify();
      }).catch(() => undefined),
    read: () => inTurn(load),
    text: () =>
      inTurn(async () => {
        const contents = await load();
        return contents ? captureLogText(contents) : null;
      }),
    subscribe: (listener) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
  };
}

/** A log that is always off: tests and code paths that keep none. */
export const NO_CAPTURE_LOG: CaptureLog = {
  isOn: () => Promise.resolve(false),
  turnOn: () => Promise.resolve(),
  turnOff: () => Promise.resolve(),
  record: () => Promise.resolve(),
  read: () => Promise.resolve(null),
  text: () => Promise.resolve(null),
  subscribe: () => () => undefined,
};

/** A log file held in memory. */
export function memoryCaptureLogFile(): CaptureLogFile & {
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
    append: (more) => {
      text = (text ?? '') + more;
      return Promise.resolve();
    },
    remove: () => {
      text = null;
      return Promise.resolve();
    },
  };
}
