import {
  gapToSpend,
  isObserved,
  newWitness,
  type NewSighting,
  type SightedSpend,
} from './duplicate';
import { namesAgree, namesNoPayee } from './payee-names';

/**
 * A capture that gave no amount (a Wallet tap at 0đ, a receipt whose total was not read) and the
 * sighting of the same payment that did: one of them has an amount and the other has none, so
 * amount cannot join them. Time, the witness and the payee's name can.
 */

const unpriced = (x: { readonly amount: number; readonly foreignAmount?: unknown }) =>
  !(x.amount > 0) && x.foreignAmount == null;

/** Both name a payee and the names cannot be one payee's. */
function namesDisagree(a: string | null | undefined, b: string | null | undefined): boolean {
  const [x, y] = [a?.trim() ?? '', b?.trim() ?? ''];
  if (x === '' || y === '' || namesNoPayee(x) || namesNoPayee(y)) return false;
  return !namesAgree(x, y);
}

/** Both name a payee and the names agree. */
function namesMatch(a: string | null | undefined, b: string | null | undefined): boolean {
  const [x, y] = [a?.trim() ?? '', b?.trim() ?? ''];
  if (x === '' || y === '' || namesNoPayee(x) || namesNoPayee(y)) return false;
  return namesAgree(x, y);
}

/**
 * The spend a capture is the same payment as when exactly one of the two has an amount: the
 * same way, another witness (never something the person typed), within the window their kinds
 * of time allow (`findDuplicate`'s), and not naming two different payees. The nearest whose
 * payee agrees wins; with none agreeing, only a lone candidate is taken, since two payments in
 * those minutes cannot be told apart without an amount. A skipped or deleted spend never takes
 * it. Null when the capture and every spend both have an amount, or both have none.
 */
export function matchWithoutAmount(
  incoming: NewSighting,
  existing: readonly SightedSpend[],
): SightedSpend | null {
  const blank = unpriced(incoming);
  if (!isObserved(incoming.source)) return null;
  const near: { readonly spend: SightedSpend; readonly gap: number; readonly agrees: boolean }[] =
    [];
  for (const spend of existing) {
    if (spend.status === 'skipped' || spend.status === 'deleted') continue;
    if (unpriced(spend) === blank) continue;
    if (!isObserved(spend.source)) continue;
    if ((spend.direction ?? 'out') !== (incoming.direction ?? 'out')) continue;
    if (!newWitness(spend, incoming)) continue;
    if (namesDisagree(spend.merchant, incoming.merchant)) continue;
    const gap = gapToSpend(spend, incoming);
    if (gap === Infinity) continue;
    near.push({ spend, gap, agrees: namesMatch(spend.merchant, incoming.merchant) });
  }
  const agreeing = near.filter((n) => n.agrees);
  const pool = agreeing.length > 0 ? agreeing : near.length === 1 ? near : [];
  return [...pool].sort((a, b) => a.gap - b.gap)[0]?.spend ?? null;
}
