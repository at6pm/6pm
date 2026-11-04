import {
  columnSamples,
  importMapResponseSchema,
  IMPORT_MAP_MAX_LABELS,
  type ColumnRole,
  type ImportTarget,
  type Sheet,
} from '@6pm/domain';

import type { ApiClient } from '../api/api-client';
import { requireServerAi, type AiModeSettings } from '../privacy/ai-mode';

/** The column table and the labels wait this long at most; then the person's own picks stand. */
const MAP_TIMEOUT_MS = 9_000;

/**
 * Asks the server how to read a file 6pm does not know. Only the headers and the shapes of the
 * values go (every digit a `d`, every word a `w`, short repeated words such as "Thành công"
 * kept): never an amount, a date, a note or a name. Null when offline, slow, unsure, or in
 * on-device mode: the table opens empty and the person says.
 */
export async function askColumns(
  request: ApiClient['request'],
  settings: AiModeSettings,
  sheet: Sheet,
  header: number,
): Promise<ColumnRole[] | null> {
  try {
    requireServerAi(settings, 'import-map');
    const columns = columnSamples(sheet, header);
    const answer = await request({
      method: 'POST',
      path: '/v1/import/map',
      body: { columns },
      schema: importMapResponseSchema,
      timeoutMs: MAP_TIMEOUT_MS,
    });
    return answer.columns && answer.columns.length === columns.length ? answer.columns : null;
  } catch {
    return null;
  }
}

/**
 * Asks where category names 6pm's own words could not place go. Only the names are sent (from
 * Money Lover, MISA or another app's own categories; never a MoMo history's shops or people).
 */
export async function askLabels(
  request: ApiClient['request'],
  settings: AiModeSettings,
  labels: readonly string[],
): Promise<Readonly<Record<string, ImportTarget>>> {
  const names = [...new Set(labels.map((l) => l.trim().slice(0, 40)).filter(Boolean))].slice(
    0,
    IMPORT_MAP_MAX_LABELS,
  );
  if (names.length === 0) return {};
  try {
    requireServerAi(settings, 'import-map');
    const answer = await request({
      method: 'POST',
      path: '/v1/import/map',
      body: { labels: names },
      schema: importMapResponseSchema,
      timeoutMs: MAP_TIMEOUT_MS,
    });
    return answer.labels;
  } catch {
    return {};
  }
}
