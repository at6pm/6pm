import { useEffect, useMemo, useState } from 'react';

import { fxRatesResponseSchema, type FxRate } from '@6pm/domain';

import { useMoneyStore } from '../../data/money-provider';
import { useApi } from '../api/native-api';
import { FX_CACHE_KEY, parseFxCache } from '../travel/trip';

/**
 * The server's đồng quotes for changing the plan's currency: today's when the phone can reach the
 * server, else the set it last kept. The answer is a lookup by code, null without a quote.
 */
export function useDongQuotes(): (code: string) => string | null {
  const { db } = useMoneyStore();
  const api = useApi();
  const [kept, setKept] = useState<readonly FxRate[]>([]);
  const [fresh, setFresh] = useState<readonly FxRate[]>([]);
  useEffect(() => {
    let live = true;
    void db
      .getAllAsync<{ value: string }>('SELECT value FROM settings WHERE key = ?', [FX_CACHE_KEY])
      .then(([row]) => {
        const cache = parseFxCache(row?.value);
        if (live && cache) setKept(cache.rates.rates);
      })
      .catch(() => undefined);
    api
      .request({ path: '/v1/fx', schema: fxRatesResponseSchema })
      .then((answer) => {
        if (live) setFresh(answer.rates);
      })
      // Offline or the server is down: what is kept stands.
      .catch(() => undefined);
    return () => {
      live = false;
    };
  }, [api, db]);
  return useMemo(
    () => (code: string) =>
      (fresh.find((r) => r.currency === code) ?? kept.find((r) => r.currency === code))?.rate ??
      null,
    [fresh, kept],
  );
}
