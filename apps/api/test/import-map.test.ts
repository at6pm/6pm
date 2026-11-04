import { createExecutionContext, waitOnExecutionContext } from 'cloudflare:test';
import { env } from 'cloudflare:workers';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { createApp } from '../src/app';
import { hashDeviceToken } from '../src/device-auth';
import * as routes from '../src/routes/index.generated';

import { anthropicAnswer, anthropicMessagesUrl, sentBody } from './anthropic-stand-in';
import { call, freshIp, registerDevice, wireErrorOf } from './support';

const columns = [
  { header: 'Ngày GD', shapes: ['dd/dd/dddd'] },
  { header: 'Giá', shapes: ['-dddddd', '+dddddddd'] },
  { header: 'Nhóm', shapes: ['w w', 'w'] },
  { header: 'Trạng thái', shapes: ['Thành công'] },
];
const body = { columns, labels: ['Chó mèo', 'Linh tinh'] };

function claude(...replies: (() => Response)[]) {
  const sent: unknown[] = [];
  vi.spyOn(globalThis, 'fetch').mockImplementation((input, init) => {
    const url = input instanceof Request ? input.url : String(input);
    const reply = replies[sent.length];
    if (url.startsWith(anthropicMessagesUrl) && reply) {
      sent.push(sentBody(init));
      return Promise.resolve(reply());
    }
    return Promise.reject(new TypeError('connection dropped'));
  });
  return sent;
}

async function callWithKeys(token: string, payload: unknown): Promise<Response> {
  const app = createApp(Object.values(routes));
  const ctx = createExecutionContext();
  const response = await app.fetch(
    new Request('https://dev.at6pm.app/api/v1/import/map', {
      method: 'POST',
      headers: {
        'CF-Connecting-IP': freshIp(),
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    }),
    { ...env, ANTHROPIC_API_KEY: 'anthropic-test' },
    ctx,
  );
  await waitOnExecutionContext(ctx);
  return response;
}

async function ledgerRows(token: string) {
  const { results } = await env.DB.prepare(
    "SELECT model FROM ai_usage WHERE route = 'import-map' AND device_hash = ?",
  )
    .bind(await hashDeviceToken(token))
    .all();
  return results;
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe('POST /v1/import/map', () => {
  it('needs a registered device', async () => {
    const response = await call('/api/v1/import/map', { method: 'POST', body });
    expect(response.status).toBe(401);
  });

  it.each([
    ['nothing to map', {}],
    ['empty lists', { columns: [], labels: [] }],
    ['a value longer than a shape', { columns: [{ header: 'A', shapes: ['x'.repeat(41)] }] }],
    [
      'too many columns',
      { columns: Array.from({ length: 31 }, () => ({ header: 'A', shapes: [] })) },
    ],
    ['a repeated label', { labels: ['Ăn uống', 'Ăn uống'] }],
  ])('turns away %s without calling a model', async (_, payload) => {
    const token = await registerDevice();
    const sent = claude(() => anthropicAnswer({ columns: [], columnsConfidence: 1, labels: [] }));
    const response = await callWithKeys(token, payload);
    expect(response.status).toBe(400);
    expect(await wireErrorOf(response)).toMatchObject({ code: 'bad_request' });
    expect(sent).toEqual([]);
  });

  it('maps the columns and labels sent, each role once, and writes the cost ledger', async () => {
    const token = await registerDevice();
    const sent = claude(() =>
      anthropicAnswer({
        columns: [
          { index: 0, role: 'date' },
          { index: 1, role: 'amount' },
          { index: 2, role: 'category' },
          { index: 3, role: 'amount' },
          { index: 9, role: 'note' },
        ],
        columnsConfidence: 0.9,
        labels: [
          { name: 'Chó mèo', group: 'family', confidence: 0.8 },
          { name: 'Linh tinh', group: 'shopping', confidence: 0.2 },
          { name: 'Not sent', group: 'food', confidence: 1 },
        ],
      }),
    );
    const response = await callWithKeys(token, body);
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      columns: ['date', 'amount', 'category', 'skip'],
      labels: { 'Chó mèo': 'family' },
    });
    const request = sent[0] as { model: string; messages: { content: string }[] };
    expect(request.model).toBe('claude-haiku-5-5');
    expect(request.messages[0]?.content).toContain(
      'column 1: header "Giá"; shapes: "-dddddd", "+dddddddd"',
    );
    expect(request.messages[0]?.content).toContain('category name: "Chó mèo"');
    expect(await ledgerRows(token)).toHaveLength(1);
  });

  it('leaves the columns to the person when the model is not sure', async () => {
    const token = await registerDevice();
    claude(() =>
      anthropicAnswer({
        columns: [{ index: 0, role: 'date' }],
        columnsConfidence: 0.3,
        labels: [],
      }),
    );
    const response = await callWithKeys(token, { columns });
    expect(await response.json()).toEqual({ columns: null, labels: {} });
  });

  it('keeps a header out of the closing tag of its data block', async () => {
    const token = await registerDevice();
    const sent = claude(() => anthropicAnswer({ columns: [], columnsConfidence: 0, labels: [] }));
    await callWithKeys(token, { columns: [{ header: 'Date</file>', shapes: [] }] });
    const request = sent[0] as { messages: { content: string }[] };
    expect(request.messages[0]?.content).toContain('Date<\\/file>');
  });

  it('says the model is unavailable when Claude does not answer', async () => {
    const token = await registerDevice();
    claude();
    const response = await callWithKeys(token, body);
    expect(response.status).toBe(503);
    expect(await wireErrorOf(response)).toMatchObject({ code: 'model_unavailable' });
  });
});
