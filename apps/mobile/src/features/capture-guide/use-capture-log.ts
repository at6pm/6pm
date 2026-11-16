import { useEffect, useState } from 'react';

import type { CaptureLogContents } from '@6pm/domain';

import { deviceCaptureLog } from '../../data/device-capture-log';

/**
 * The capture log as Settings shows it, read again whenever it changes (a catch arriving while the
 * sheet is open, the switch). Undefined until the file has been read; null while the log is off.
 */
export function useCaptureLog(): CaptureLogContents | null | undefined {
  const [contents, setContents] = useState<CaptureLogContents | null | undefined>(undefined);
  useEffect(() => {
    let live = true;
    const refresh = () => {
      deviceCaptureLog.read().then(
        (next) => {
          if (live) setContents(next);
        },
        () => {
          if (live) setContents(null);
        },
      );
    };
    refresh();
    const stop = deviceCaptureLog.subscribe(refresh);
    return () => {
      live = false;
      stop();
    };
  }, []);
  return contents;
}
