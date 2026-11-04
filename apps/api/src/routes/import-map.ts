import { importMapRequestSchema, type ImportMapResponse } from '@6pm/domain';

import { mapImport } from '../ai/map-import';
import { limitImportMaps } from '../rate-limit';
import { readBody, type RouteDefinition } from '../route';

/**
 * Reads the columns of an export file the phone does not know, and places category names its own
 * words could not. Only headers, value shapes and category names arrive here (never an amount, a
 * date, a note or a name); the phone shows its own empty table when this is offline or unsure.
 */
export const importMapRoute: RouteDefinition = {
  method: 'POST',
  path: '/v1/import/map',
  access: 'device',
  handle: async (c) => {
    await limitImportMaps(c);
    const request = await readBody(c, importMapRequestSchema, { maxBytes: 16_000 });
    const answer = await mapImport({ env: c.env, deviceHash: c.var.device.hash }, request);
    return c.json(answer satisfies ImportMapResponse);
  },
};
