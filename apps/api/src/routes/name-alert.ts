import { readUtcOffset, UTC_OFFSET_HEADER } from '@6pm/domain';

import { nameAlert, nameAlertRequestSchema } from '../ai/name-alert';
import { recordAiUsage, requireAiBudget } from '../ledger';
import { readBody, type RouteDefinition } from '../route';

/**
 * Alerts one device may have named in a day, from midnight on the user's clock. The phone asks
 * once for each wording it has not seen a name for; this only stops a runaway client from
 * spending the model budget.
 */
const alertsPerDay = 60;

/**
 * Names who a bank or wallet alert says was paid, when the phone read the payment and could not
 * read a payee from it. The phone sends the alert's words with every number taken out: a body
 * holding a digit is turned away before the model is called.
 */
export const nameAlertRoute: RouteDefinition = {
  method: 'POST',
  path: '/v1/name-alert',
  access: 'device',
  handle: async (c) => {
    const request = await readBody(c, nameAlertRequestSchema, { maxBytes: 12_000 });
    await requireAiBudget(
      c.env.DB,
      c.var.device.hash,
      'name-alert',
      alertsPerDay,
      readUtcOffset(c.req.header(UTC_OFFSET_HEADER)),
    );
    const generated = await nameAlert({ apiKey: c.env.ANTHROPIC_API_KEY }, request);
    c.executionCtx.waitUntil(
      recordAiUsage(c.env.DB, {
        route: 'name-alert',
        model: generated.model,
        inputTokens: generated.inputTokens,
        outputTokens: generated.outputTokens,
        deviceHash: c.var.device.hash,
      }),
    );
    return c.json(generated.output);
  },
};
