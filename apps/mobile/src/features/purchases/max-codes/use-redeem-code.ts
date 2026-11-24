import * as Clipboard from 'expo-clipboard';
import { useCallback, useRef, useState } from 'react';

import type { MaxCodeArrival } from '@6pm/domain';

import { usePurchases } from '../purchases-provider';
import { deviceMaxChannel } from './device-max-channel';

/** What the Max sheet says under its button while Google Play is to take a code. */
export interface PlayCodeHint {
  /** The code, copied to paste into Google Play; null when the person brings their own. */
  readonly code: string | null;
}

/**
 * "Redeem a code" on the Max sheet, and a code link that opened it. The channel is kept first (a
 * link's own, or `other` for a code with no link), then the store's redemption opens: on iPhone
 * Apple's sheet or the App Store's page with the link's code filled in, its answer arriving as a
 * change of customer; on Android the code is copied and the sheet says where Google Play takes it.
 */
export function useRedeemCode() {
  const { port } = usePurchases();
  const [playHint, setPlayHint] = useState<PlayCodeHint | null>(null);
  /** A redemption was opened from this sheet: Max turning on after it is that code's doing. */
  const opened = useRef(false);

  const redeem = useCallback(
    async (arrival: MaxCodeArrival | null): Promise<void> => {
      await (
        arrival
          ? deviceMaxChannel.remember(arrival.channel, arrival.code)
          : deviceMaxChannel.remember('other')
      ).catch(() => undefined);
      const code = arrival?.code ?? (await deviceMaxChannel.code().catch(() => null));
      const route = await port.redeemCode(code);
      opened.current = true;
      if (route === 'store') return;
      if (code !== null) await Clipboard.setStringAsync(code).catch(() => undefined);
      setPlayHint({ code });
    },
    [port],
  );

  return { redeem, playHint, opened };
}
