import { createExecutionContext, waitOnExecutionContext } from 'cloudflare:test';
import { env } from 'cloudflare:workers';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { readAlert, readAlertRequestSchema, readAlertSystem } from '../src/ai/read-alert';
import { createApp } from '../src/app';
import { hashDeviceToken } from '../src/device-auth';
import * as routes from '../src/routes/index.generated';

import { anthropicAnswer, sentBody } from './anthropic-stand-in';
import { call, freshIp, registerDevice, wireErrorOf } from './support';

// Every name, account and amount here is made up.

const alert = {
  app: 'MB Bank',
  text: 'Thông báo biến động số dư\nTK •••••••••••••|GD: «1: -50,000VND» 18/11/26 09:41|SD: «2: 1,250,000VND»|ND: Thanh toan QR-PHO HOA',
  amounts: 2,
  home: 'VND',
  categories: ['Food', 'Drinks', 'Transport'],
};

const answer = { moved: 'out', amount: '1', merchant: 'Phở Hòa', category: 'Food' };

/** Sends a request with an Anthropic key set, so the route reaches the (recorded) model. */
async function callWithKey(token: string, body: unknown): Promise<Response> {
  const app = createApp(Object.values(routes));
  const ctx = createExecutionContext();
  const response = await app.fetch(
    new Request('https://6pm-dev.oddeggs.studio/api/v1/read-alert', {
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

describe('POST /v1/read-alert', () => {
  it('needs a registered device', async () => {
    const response = await call('/api/v1/read-alert', { method: 'POST', body: alert });
    expect(response.status).toBe(401);
  });

  it('turns away a long number, a missing mark and no marks at all without calling the model', async () => {
    const token = await registerDevice();
    const model = vi.spyOn(globalThis, 'fetch');
    for (const body of [
      { ...alert, text: alert.text.replace('•••••••••••••', '0123456789012') },
      { ...alert, app: 'Bank 0901234567' },
      { ...alert, text: `${alert.text} Goi 0912 345 678` },
      { ...alert, text: `${alert.text} STK 1903.6789.0123` },
      { ...alert, amounts: 3 },
      { ...alert, amounts: 0 },
      { ...alert, home: 'đồng' },
    ]) {
      const response = await callWithKey(token, body);
      expect(response.status).toBe(400);
      expect(await wireErrorOf(response)).toMatchObject({ code: 'bad_request' });
    }
    expect(model).not.toHaveBeenCalled();
  });

  it('answers with the way, a mark as a number, who and a sent category, and writes the cost ledger', async () => {
    const token = await registerDevice();
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(anthropicAnswer(answer));
    const response = await callWithKey(token, alert);
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      moved: 'out',
      amount: 1,
      merchant: 'Phở Hòa',
      category: 'Food',
    });

    const { results } = await env.DB.prepare(
      "SELECT * FROM ai_usage WHERE route = 'read-alert' AND device_hash = ?",
    )
      .bind(await hashDeviceToken(token))
      .all();
    expect(results).toEqual([expect.objectContaining({ model: 'claude-haiku-5-5' })]);
  });

  it('reads an alert with no categories to choose from', async () => {
    const token = await registerDevice();
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      anthropicAnswer({ moved: 'in', amount: '1', merchant: 'Nguyễn Văn An', category: '' }),
    );
    const response = await callWithKey(token, { ...alert, categories: [] });
    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({ moved: 'in', amount: 1, category: '' });
  });
});

describe('the alert reading contract', () => {
  const ask = (output: unknown) => {
    const send = vi.fn<typeof fetch>(() => Promise.resolve(anthropicAnswer(output)));
    return {
      send,
      read: readAlert({ apiKey: 'test', fetch: send }, readAlertRequestSchema.parse(alert)),
    };
  };

  it('lets the model choose only among the marks and the sent categories', async () => {
    const { send, read } = ask(answer);
    await read;
    const body = sentBody(send.mock.calls[0]?.[1]) as {
      system: unknown;
      output_config: {
        format: { schema: { properties: { amount: unknown; category: unknown; moved: unknown } } };
      };
      messages: { content: string }[];
    };
    expect(JSON.stringify(body.system)).toContain(readAlertSystem.slice(0, 60));
    const { amount, category, moved } = body.output_config.format.schema.properties;
    for (const mark of ['0', '1', '2']) expect(JSON.stringify(amount)).toContain(mark);
    expect(JSON.stringify(amount)).not.toContain('3');
    for (const name of alert.categories) expect(JSON.stringify(category)).toContain(name);
    expect(JSON.stringify(moved)).toContain('none');
    expect(body.messages[0]?.content).toContain(alert.text);
    expect(body.messages[0]?.content).toContain('The person counts in: VND');
  });

  it('reads “no money moved” as no mark, no name and no category, whatever else was said', async () => {
    const { read } = ask({ moved: 'none', amount: '2', merchant: 'MB Bank', category: 'Food' });
    expect((await read).output).toEqual({ moved: 'none', amount: 0, merchant: '', category: '' });
  });

  it('cuts a long name and reads a choice it was not given as none, without failing', async () => {
    const { read } = ask({
      moved: 'out',
      amount: '9',
      merchant: `  CÔNG TY TNHH ${'THƯƠNG MẠI DỊCH VỤ '.repeat(6)} `,
      category: 'Eating out',
    });
    const { output } = await read;
    expect(output).toMatchObject({ moved: 'out', amount: 0, category: '' });
    expect(output.merchant).toHaveLength(60);
    expect(output.merchant.startsWith('CÔNG TY TNHH THƯƠNG MẠI')).toBe(true);
  });

  it('files money in under no category', async () => {
    const { read } = ask({ moved: 'in', amount: '1', merchant: 'Nguyễn Văn An', category: 'Food' });
    expect((await read).output).toEqual({
      moved: 'in',
      amount: 1,
      merchant: 'Nguyễn Văn An',
      category: '',
    });
  });
});
