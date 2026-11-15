import type { SpendRow } from '@6pm/domain';

import type { SqlDatabase } from './table';

/** One way a spend was seen: the source trail on Details. */
export interface Sighting {
  readonly source: SpendRow['source'];
  readonly seenAt: string;
  readonly detail: string | null;
}

/** Every way a spend was seen, oldest first. Empty for a spend seen only once. */
export async function readSightings(db: SqlDatabase, spendId: string): Promise<Sighting[]> {
  const rows = await db.getAllAsync<{
    source: SpendRow['source'];
    seen_at: string;
    detail: string | null;
  }>('SELECT source, seen_at, detail FROM spend_sightings WHERE spend_id = ? ORDER BY seen_at', [
    spendId,
  ]);
  return rows.map((r) => ({ source: r.source, seenAt: r.seen_at, detail: r.detail }));
}
