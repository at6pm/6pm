import { describe, expect, it } from '@jest/globals';

import { funnelReportSchema } from '@6pm/domain';

import { createFunnelSend } from './funnel-send';

function sender(status: number | 'down', calls: { url: string; init: RequestInit }[] = []) {
  return createFunnelSend({
    baseUrl: 'https://six.test/api',
    fetch: (url, init) => {
      const href = typeof url === 'string' ? url : url instanceof URL ? url.href : url.url;
      calls.push({ url: href, init: init ?? {} });
      return status === 'down'
        ? Promise.reject(new Error('offline'))
        : Promise.resolve(new Response('{}', { status }));
    },
    platform: 'ios',
    version: '2.2.2',
    language: () => 'vi',
  });
}

describe('sending funnel counts', () => {
  it('sends the steps with only the platform, version and language, and no token', async () => {
    const calls: { url: string; init: RequestInit }[] = [];
    expect(await sender(200, calls)([{ step: 'first_open' }])).toBe('counted');
    const [call] = calls;
    expect(call?.url).toBe('https://six.test/api/v1/funnel');
    expect(Object.keys(call?.init.headers ?? {}).sort()).toEqual(['Accept', 'Content-Type']);
    const body: unknown = JSON.parse(typeof call?.init.body === 'string' ? call.init.body : '');
    expect(funnelReportSchema.parse(body)).toEqual({
      platform: 'ios',
      version: '2.2.2',
      language: 'vi',
      events: [{ step: 'first_open' }],
    });
  });

  it('gives up on a refusal and tries again after a fault or no answer', async () => {
    expect(await sender(400)([{ step: 'first_open' }])).toBe('refused');
    expect(await sender(429)([{ step: 'first_open' }])).toBe('later');
    expect(await sender(500)([{ step: 'first_open' }])).toBe('later');
    expect(await sender('down')([{ step: 'first_open' }])).toBe('later');
  });
});
