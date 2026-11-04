import { describe, expect, it } from 'vitest';
import { z } from 'zod';

import { generate } from '../src/ai/anthropic';
import { ApiError } from '../src/errors';

import { anthropicAnswer } from './anthropic-stand-in';

const request = {
  system: 'Say hello.',
  prompt: 'Hello',
  schema: z.object({ greeting: z.string() }),
  maxTokens: 64,
};

/** A model that never answers: the call hangs until it is aborted. */
function hanging(_url: unknown, init?: RequestInit): Promise<Response> {
  return new Promise((_resolve, reject) => {
    init?.signal?.addEventListener('abort', () =>
      reject(new DOMException('aborted', 'AbortError')),
    );
  });
}

describe('generate', () => {
  it('tries again after a busy provider, within the time it was given', async () => {
    let calls = 0;
    const answer = await generate(
      {
        apiKey: 'test',
        fetch: () => {
          calls += 1;
          return Promise.resolve(
            calls === 1
              ? Response.json(
                  { type: 'error', error: { type: 'overloaded_error' } },
                  { status: 529 },
                )
              : anthropicAnswer({ greeting: 'hi' }),
          );
        },
      },
      { ...request, timeoutMs: 3_000, totalMs: 3_000 },
    );
    expect(calls).toBe(2);
    expect(answer.output).toEqual({ greeting: 'hi' });
  });

  it('ends a slow call, second attempt included, by its total time', async () => {
    const started = Date.now();
    const failure = await generate(
      { apiKey: 'test', fetch: hanging },
      { ...request, timeoutMs: 300, totalMs: 300 },
    ).catch((error: unknown) => error);
    expect(failure).toBeInstanceOf(ApiError);
    expect((failure as ApiError).code).toBe('model_timeout');
    // A second 300 ms attempt after the SDK's backoff would end past 700 ms.
    expect(Date.now() - started).toBeLessThan(650);
  });
});
