import { fxRatesResponseSchema, type Currency } from '@6pm/domain';

import { priceWaitingForeign } from '../../data/foreign-pricing';
import type { moneyActions } from '../../data/money-actions';
import type { MoneyStore } from '../../data/money-store';
import type { ApiClient } from '../api/api-client';
import { FX_CACHE_KEY, parseFxCache, rateFor } from './trip';

export interface WaitingPricerDeps {
  readonly store: MoneyStore;
  readonly actions: ReturnType<typeof moneyActions>;
  readonly api: ApiClient;
  readonly home: Currency;
}

/**
 * Prices every captured foreign amount still waiting for a rate: at the server's rate of the day it
 * was paid, else the last rate the phone kept. Run after anything that can bring one in (the inbox,
 * receipt email), so a charge abroad is never left at 0 for the close. Returns how many were priced.
 */
export async function priceWaitingNow(deps: WaitingPricerDeps): Promise<number> {
  const { store, actions, api, home } = deps;
  const [kept] = await store.db.getAllAsync<{ value: string }>(
    'SELECT value FROM settings WHERE key = ?',
    [FX_CACHE_KEY],
  );
  const cache = parseFxCache(kept?.value);
  return priceWaitingForeign({
    store,
    actions,
    home,
    lastRate: (currency) => rateFor(cache, currency, home)?.rate ?? null,
    ratesOn: async (day) =>
      (await api.request({ path: `/v1/fx?on=${day}`, schema: fxRatesResponseSchema })).rates,
  });
}
