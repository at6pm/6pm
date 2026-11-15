import { addDays, foldWords, namesNoPayee, type LocalDate } from '@6pm/domain';

import type { SqlDatabase } from './table';

/** How far back a name the person gave a payee is looked for. */
export const NAMED_BEFORE_DAYS = 180;

/**
 * The name, and the category, the person gave before to the payee a bank alert names: the newest
 * kept row whose alert named this payee and whose name no witness but the person gave (they
 * typed it, renamed it in Details, or joined the alert to a spend they typed). Null when they
 * never named it, or the alert names nobody.
 */
export async function namedBefore(
  db: SqlDatabase,
  payee: string,
  today: LocalDate,
): Promise<{ readonly merchant: string; readonly categoryId: string } | null> {
  const said = foldWords(payee).trim();
  if (said === '' || namesNoPayee(payee)) return null;
  const rows = await db.getAllAsync<{ merchant: string; categoryId: string; payee: string }>(
    `SELECT p.merchant AS merchant, p.category_id AS categoryId, s.payee AS payee
       FROM spend_sightings s JOIN spends p ON p.id = s.spend_id
      WHERE s.channel = 'alert' AND s.payee IS NOT NULL AND p.status = 'kept' AND p.day >= ?
        AND TRIM(p.merchant) != ''
        AND NOT EXISTS (
          SELECT 1 FROM spend_sightings x
           WHERE x.spend_id = p.id AND x.payee = p.merchant
             AND COALESCE(x.witness_kind, '') != 'person'
        )
      ORDER BY p.at DESC`,
    [addDays(today, -NAMED_BEFORE_DAYS)],
  );
  const named = rows.find(
    (row) => foldWords(row.payee).trim() === said && foldWords(row.merchant).trim() !== said,
  );
  return named ? { merchant: named.merchant.trim(), categoryId: named.categoryId } : null;
}
