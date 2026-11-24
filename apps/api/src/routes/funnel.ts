import { funnelKey, funnelReportSchema, type FunnelEvent } from '@6pm/domain';

import { limitFunnelReports } from '../rate-limit';
import { readBody, type RouteDefinition } from '../route';

/** A full report is about 40 short steps; anything much larger is not from the app. */
const MAX_BYTES = 6 * 1024;

/**
 * Anonymous funnel counts. Public on purpose: a device token would tie the counts to a phone, so
 * none is asked for or read. Each step reached adds one to its counter for the day, the platform,
 * the app version and the language; nothing about the sender is stored, and the address is only
 * the rate limit's key. The same step twice in one report counts once.
 */
export const funnelRoute: RouteDefinition = {
  method: 'POST',
  path: '/v1/funnel',
  access: 'public',
  handle: async (c) => {
    await limitFunnelReports(c);
    const report = await readBody(c, funnelReportSchema, { maxBytes: MAX_BYTES });
    const steps = new Map<string, FunnelEvent>();
    for (const event of report.events) steps.set(funnelKey(event), event);

    const day = new Date().toISOString().slice(0, 10);
    const add = c.env.DB.prepare(
      `INSERT INTO funnel_counts (day, step, detail, since_open, platform, version, language, count)
       VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, 1)
       ON CONFLICT (day, step, detail, since_open, platform, version, language)
         DO UPDATE SET count = count + 1`,
    );
    await c.env.DB.batch(
      [...steps.values()].map((event) =>
        add.bind(
          day,
          event.step,
          'detail' in event ? event.detail : '',
          'day' in event ? event.day : -1,
          report.platform,
          report.version,
          report.language,
        ),
      ),
    );
    return c.json({ counted: steps.size });
  },
};
