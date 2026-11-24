import { env } from 'cloudflare:workers';
import { describe, expect, it } from 'vitest';

import { funnelResponseSchema } from '@6pm/domain';

import { call, freshIp, registerDevice, wireErrorOf } from './support';

type CountRow = {
  step: string;
  detail: string;
  since_open: number;
  platform: string;
  version: string;
  language: string;
  count: number;
};

let nextVersion = 0;

/** A version no other test has reported, so each test reads only its own counters. */
function freshVersion(): string {
  nextVersion += 1;
  return `9.0.${nextVersion}`;
}

function report(body: unknown, ip = freshIp(), token?: string): Promise<Response> {
  return call('/api/v1/funnel', {
    method: 'POST',
    body,
    ip,
    ...(token === undefined ? {} : { token }),
  });
}

async function countsFor(version: string): Promise<CountRow[]> {
  const { results } = await env.DB.prepare(
    `SELECT step, detail, since_open, platform, version, language, count
     FROM funnel_counts WHERE version = ? ORDER BY step, detail, since_open`,
  )
    .bind(version)
    .all<CountRow>();
  return results;
}

describe('funnel counts', () => {
  it('adds one to each step reached, and keeps nothing else', async () => {
    const version = freshVersion();
    const response = await report({
      platform: 'android',
      version,
      language: 'vi',
      events: [
        { step: 'first_open' },
        { step: 'capture', detail: 'alert', day: 3 },
        { step: 'onboarding_step', detail: 'money_in' },
      ],
    });
    expect(response.status).toBe(200);
    expect(funnelResponseSchema.parse(await response.json())).toEqual({ counted: 3 });

    const base = { platform: 'android', version, language: 'vi', count: 1 };
    expect(await countsFor(version)).toEqual([
      { ...base, step: 'capture', detail: 'alert', since_open: 3 },
      { ...base, step: 'first_open', detail: '', since_open: -1 },
      { ...base, step: 'onboarding_step', detail: 'money_in', since_open: -1 },
    ]);
    const { results } = await env.DB.prepare('PRAGMA table_info(funnel_counts)').all<{
      name: string;
    }>();
    expect(results.map((column) => column.name)).toEqual([
      'day',
      'step',
      'detail',
      'since_open',
      'platform',
      'version',
      'language',
      'count',
    ]);
  });

  it('counts two phones reaching the same step as two, and one step twice in a report as one', async () => {
    const version = freshVersion();
    const body = {
      platform: 'ios',
      version,
      language: 'en',
      events: [
        { step: 'open', day: 7 },
        { step: 'open', day: 7 },
      ],
    };
    await report(body);
    await report(body);
    expect(await countsFor(version)).toEqual([
      expect.objectContaining({ step: 'open', since_open: 7, count: 2 }),
    ]);
  });

  it('never reads or stores a device token sent with it', async () => {
    const version = freshVersion();
    const token = await registerDevice();
    const response = await report(
      { platform: 'ios', version, language: 'en', events: [{ step: 'first_open' }] },
      freshIp(),
      token,
    );
    expect(response.status).toBe(200);
    const row = await env.DB.prepare('SELECT * FROM funnel_counts WHERE version = ?')
      .bind(version)
      .first<Record<string, unknown>>();
    expect(Object.values(row ?? {})).not.toContain(token);
  });

  it('refuses words, ids and steps it does not know, and counts nothing from them', async () => {
    const version = freshVersion();
    const refused = [
      { platform: 'ios', version, language: 'en', events: [{ step: 'first_open', id: 'x' }] },
      { platform: 'ios', version, language: 'en', device: 'abc', events: [{ step: 'first_open' }] },
      {
        platform: 'ios',
        version,
        language: 'en',
        events: [{ step: 'capture', detail: 'Vietcombank', day: 1 }],
      },
      { platform: 'ios', version, language: 'en', events: [{ step: 'spent', detail: '50000' }] },
    ];
    for (const body of refused) {
      const response = await report(body);
      expect(response.status).toBe(400);
      expect(await wireErrorOf(response)).toMatchObject({ code: 'bad_request' });
    }
    expect(await countsFor(version)).toEqual([]);
  });

  it('turns away a body too large to be a report', async () => {
    const response = await report({
      platform: 'ios',
      version: freshVersion(),
      language: 'en',
      events: [{ step: 'first_open' }],
      padding: 'x'.repeat(8 * 1024),
    });
    expect(response.status).toBe(400);
    expect(await wireErrorOf(response)).toMatchObject({ detail: { reason: 'too_large' } });
  });

  it('stops one address after its small allowance', async () => {
    const ip = freshIp();
    const body = {
      platform: 'ios',
      version: freshVersion(),
      language: 'en',
      events: [{ step: 'first_open' }],
    };
    const statuses: number[] = [];
    for (let attempt = 0; attempt < 12; attempt += 1) {
      statuses.push((await report(body, ip)).status);
    }
    expect(statuses.slice(0, 10).every((status) => status === 200)).toBe(true);
    expect(statuses.at(-1)).toBe(429);
  });
});
