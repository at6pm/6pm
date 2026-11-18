import { createExecutionContext, waitOnExecutionContext } from 'cloudflare:test';
import { env } from 'cloudflare:workers';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { nameAlert, nameAlertRequestSchema, nameAlertSystem } from '../src/ai/name-alert';
import { createApp } from '../src/app';
import { hashDeviceToken } from '../src/device-auth';
import * as routes from '../src/routes/index.generated';

import { anthropicAnswer, sentBody } from './anthropic-stand-in';
import { call, freshIp, registerDevice, wireErrorOf } from './support';

const alert = {
  name: '',
  lines: [
    'Thanh toán HIGHLANDS COFFEE thành công',
    'Bạn đã thực hiện thanh toán thành công cho HIGHLANDS COFFEE với số tiền',
  ],
  categories: ['Food', 'Drinks', 'Transport'],
};

/** Sends a request with an Anthropic key set, so the route reaches the (recorded) model. */
async function callWithKey(token: string, body: unknown): Promise<Response> {
  const app = createApp(Object.values(routes));
  const ctx = createExecutionContext();
  const response = await app.fetch(
    new Request('https://6pm-dev.oddeggs.studio/api/v1/name-alert', {
      method: 'POST',
      headers: {
        'CF-Connecting-IP': freshIp(),
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    }),
    { ...env, ANTHROPIC_API_KEY: 'test' },
    ctx,
  );
  await waitOnExecutionContext(ctx);
  return response;
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe('POST /v1/name-alert', () => {
  it('needs a registered device', async () => {
    const response = await call('/api/v1/name-alert', { method: 'POST', body: alert });
    expect(response.status).toBe(401);
  });

  it('turns away any digit without calling the model', async () => {
    const token = await registerDevice();
    const model = vi.spyOn(globalThis, 'fetch');
    for (const body of [
      { ...alert, lines: [...alert.lines, 'với số tiền 119.000đ'] },
      { ...alert, lines: ['TK 0123xxx456'] },
      { ...alert, name: 'CIRCLE K 24' },
    ]) {
      const response = await callWithKey(token, body);
      expect(response.status).toBe(400);
      expect(await wireErrorOf(response)).toMatchObject({ code: 'bad_request' });
    }
    expect(model).not.toHaveBeenCalled();
  });

  it('answers with a merchant and one of the sent categories, and writes the cost ledger', async () => {
    const token = await registerDevice();
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      anthropicAnswer({ merchant: 'Highlands Coffee', category: 'Drinks' }),
    );
    const response = await callWithKey(token, alert);
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ merchant: 'Highlands Coffee', category: 'Drinks' });

    const { results } = await env.DB.prepare(
      "SELECT * FROM ai_usage WHERE route = 'name-alert' AND device_hash = ?",
    )
      .bind(await hashDeviceToken(token))
      .all();
    expect(results).toEqual([expect.objectContaining({ model: 'claude-haiku-5-5' })]);
  });
});

describe('the alert naming contract', () => {
  it('reads it as a notification, with only the sent categories as choices and no digit', async () => {
    const send = vi.fn<typeof fetch>(() =>
      Promise.resolve(anthropicAnswer({ merchant: 'Highlands Coffee', category: 'Drinks' })),
    );
    await nameAlert({ apiKey: 'test', fetch: send }, nameAlertRequestSchema.parse(alert));
    const body = sentBody(send.mock.calls[0]?.[1]) as {
      system: unknown;
      output_config: { format: { schema: { properties: { category: unknown } } } };
      messages: { content: string }[];
    };
    expect(JSON.stringify(body.system)).toContain(nameAlertSystem.slice(0, 60));
    const category = JSON.stringify(body.output_config.format.schema.properties.category);
    for (const name of alert.categories) expect(category).toContain(name);
    expect(body.messages[0]?.content).toContain('Notification:');
    expect(body.messages[0]?.content).not.toMatch(/\d/);
  });
});
