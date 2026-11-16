import type { MerchantRuleRow } from '@6pm/domain';

import type { MoneyStore } from './money-store';

/**
 * The senders and shops 6pm remembers something about, by merchant key: the rules that remember a
 * place for money in (`rememberedPlaceOf` decides whether it is still usable) or a work stamp
 * (`workMarkOf`).
 */
export async function readRememberedMoney(
  store: Pick<MoneyStore, 'tables'>,
): Promise<ReadonlyMap<string, MerchantRuleRow>> {
  const rules = await store.tables.rules.select(
    'WHERE money_in IS NOT NULL OR work IS NOT NULL',
    [],
  );
  return new Map(rules.map((rule) => [rule.merchantKey, rule]));
}
