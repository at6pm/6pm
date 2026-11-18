import { readUtcOffset, UTC_OFFSET_HEADER } from '@6pm/domain';

import { readAlert, readAlertRequestSchema } from '../ai/read-alert';
import { recordAiUsage, requireAiBudget } from '../ledger';
import { readBody, type RouteDefinition } from '../route';

/**
 * Alerts one device may have read in a day, from midnight on the user's clock. The phone asks
 * once for each alert it brings in; someone selling all day gets a few hundred. Past this the
 * phone's own reading stands. It only stops a runaway client from spending the model budget.
 */
const alertsPerDay = 300;

/**
 * Reads one bank or wallet alert a second time, after the phone: whether money moved and which
 * way, which of the amounts the phone marked is the one that moved, who was paid or paid in, and
 * the category. The model answers with a mark's number and never an amount; the phone keeps the
 * amount it parsed at that mark. Nothing of the alert is stored: only the cost ledger's counts.
 */
export const readAlertRoute: RouteDefinition = {
  method: 'POST',
  path: '/v1/read-alert',
  access: 'device',
  handle: async (c) => {
    const request = await readBody(c, readAlertRequestSchema, { maxBytes: 12_000 });
    await requireAiBudget(
      c.env.DB,
      c.var.device.hash,
      'read-alert',
      alertsPerDay,
      readUtcOffset(c.req.header(UTC_OFFSET_HEADER)),
    );
    const generated = await readAlert({ apiKey: c.env.ANTHROPIC_API_KEY }, request);
    c.executionCtx.waitUntil(
      recordAiUsage(c.env.DB, {
        route: 'read-alert',
        model: generated.model,
        inputTokens: generated.inputTokens,
        outputTokens: generated.outputTokens,
        deviceHash: c.var.device.hash,
      }),
    );
    return c.json(generated.output);
  },
};
