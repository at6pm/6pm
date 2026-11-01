import { env } from 'cloudflare:workers';
import { describe, expect, it } from 'vitest';

import { androidTesterResponseSchema } from '@6pm/domain';

import { call, wireErrorOf } from './support';

let nextAccount = 0;

/** A Google account no other test has used. */
function freshEmail(): string {
  nextAccount += 1;
  return `tester${nextAccount}@gmail.com`;
}

function signUp(body: unknown): Promise<Response> {
  return call('/api/v1/android-testers', { method: 'POST', body });
}

async function rowsFor(email: string): Promise<Record<string, unknown>[]> {
  const { results } = await env.DB.prepare('SELECT * FROM android_testers WHERE email = ?')
    .bind(email)
    .all();
  return results;
}

describe('signing up for the Android test', () => {
  it('stores the account trimmed and lowercased, not yet added, and answers only that it is listed', async () => {
    const email = freshEmail();
    const response = await signUp({ email: `  ${email.toUpperCase()} `, language: 'vi' });
    expect(response.status).toBe(200);
    const body: unknown = await response.json();
    expect(androidTesterResponseSchema.parse(body)).toEqual({ listed: true });
    expect(Object.keys(body as object)).toEqual(['listed']);

    const rows = await rowsFor(email);
    expect(rows).toEqual([expect.objectContaining({ email, language: 'vi', added_at: null })]);
    expect(typeof rows[0]?.['created_at']).toBe('string');
  });

  it('takes any Google account address, not only Gmail', async () => {
    const response = await signUp({ email: 'someone@company.vn', language: 'en' });
    expect(response.status).toBe(200);
    expect(await rowsFor('someone@company.vn')).toHaveLength(1);
  });
});

describe('signing up twice', () => {
  it('answers the same and keeps the first signup once, however the email is typed', async () => {
    const email = freshEmail();
    await signUp({ email, language: 'en' });
    const again = await signUp({ email: ` ${email.toUpperCase()}`, language: 'vi' });
    expect(again.status).toBe(200);
    expect(await again.json()).toEqual({ listed: true });
    expect(await rowsFor(email)).toEqual([expect.objectContaining({ language: 'en' })]);
  });

  it('never clears the mark that the founder added someone', async () => {
    const email = freshEmail();
    await signUp({ email, language: 'en' });
    await env.DB.prepare('UPDATE android_testers SET added_at = ? WHERE email = ?')
      .bind('2026-11-02T03:00:00.000Z', email)
      .run();
    await signUp({ email, language: 'en' });
    expect(await rowsFor(email)).toEqual([
      expect.objectContaining({ added_at: '2026-11-02T03:00:00.000Z' }),
    ]);
  });
});

describe('a request the list turns down', () => {
  it.each([
    ['no at sign', 'tester.gmail.com'],
    ['no domain', 'tester@'],
    ['spaces inside', 'tes ter@gmail.com'],
    ['empty', '   '],
  ])('rejects an email with %s', async (_, email) => {
    const response = await signUp({ email, language: 'en' });
    expect(response.status).toBe(400);
    expect(await wireErrorOf(response)).toMatchObject({ code: 'bad_request', retryable: false });
  });

  it.each([
    ['no language', { email: 'a@gmail.com' }],
    ['an unknown language', { email: 'a@gmail.com', language: 'fr' }],
    ['no email', { language: 'en' }],
    ['a list instead of an object', ['a@gmail.com']],
  ])('rejects a body with %s and stores nothing', async (_, body) => {
    const response = await signUp(body);
    expect(response.status).toBe(400);
    const error = await wireErrorOf(response);
    expect(error).toMatchObject({ code: 'bad_request' });
    // The reason names the field, never the value that was sent.
    expect(JSON.stringify(error)).not.toContain('a@gmail.com');
    expect(await rowsFor('a@gmail.com')).toEqual([]);
  });

  it('rejects a body that is not JSON', async () => {
    const response = await call('/api/v1/android-testers', { method: 'POST', body: undefined });
    expect(response.status).toBe(400);
    expect(await wireErrorOf(response)).toMatchObject({ code: 'bad_request' });
  });

  it('only accepts POST', async () => {
    const response = await call('/api/v1/android-testers');
    expect(response.status).toBe(404);
  });
});
