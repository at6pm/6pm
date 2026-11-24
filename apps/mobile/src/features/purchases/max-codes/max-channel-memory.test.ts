import { describe, expect, it } from '@jest/globals';

import { maxCodeReferrer } from '@6pm/domain';

import { createMaxChannelMemory, type MaxChannelFile } from './max-channel-memory';

function memoryAt(start: string) {
  let text: string | null = null;
  let now = new Date(start);
  const file: MaxChannelFile = {
    read: () => Promise.resolve(text),
    write: (next) => {
      text = next;
      return Promise.resolve();
    },
    remove: () => {
      text = null;
      return Promise.resolve();
    },
  };
  const memory = createMaxChannelMemory(file, () => now);
  return {
    memory,
    later: (days: number) => {
      now = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
    },
    text: () => text,
    corrupt: (next: string) => {
      text = next;
    },
  };
}

describe('the Max channel memory', () => {
  it('knows nothing on a new phone', async () => {
    const { memory } = memoryAt('2026-12-01T10:00:00Z');
    await expect(memory.channel()).resolves.toBeNull();
    await expect(memory.code()).resolves.toBeNull();
  });

  it('keeps a code link for thirty days, then lets it go', async () => {
    const { memory, later } = memoryAt('2026-12-01T10:00:00Z');
    await memory.remember('threads', 'threads6pm');
    await expect(memory.channel()).resolves.toBe('threads');
    await expect(memory.code()).resolves.toBe('THREADS6PM');
    later(31);
    await expect(memory.channel()).resolves.toBeNull();
    await expect(memory.code()).resolves.toBeNull();
  });

  it('keeps only the slug and a store code, nothing else', async () => {
    const { memory, text } = memoryAt('2026-12-01T10:00:00Z');
    await memory.remember('friend', 'not a code');
    expect(JSON.parse(text() ?? '')).toEqual({
      referrerChecked: false,
      kept: { channel: 'friend', at: '2026-12-01T10:00:00.000Z' },
      code: null,
    });
  });

  it('lets a newer link take over', async () => {
    const { memory, later } = memoryAt('2026-12-01T10:00:00Z');
    await memory.remember('threads', 'THREADS6PM');
    later(2);
    await memory.remember('friend', 'FRIEND6PM');
    await expect(memory.channel()).resolves.toBe('friend');
    await expect(memory.code()).resolves.toBe('FRIEND6PM');
  });

  it('counts a redemption with no link as other, but never over a link still counting', async () => {
    const { memory, later } = memoryAt('2026-12-01T10:00:00Z');
    await memory.remember('other');
    await expect(memory.channel()).resolves.toBe('other');

    await memory.remember('youtube', 'YOUTUBE6PM');
    await memory.remember('other');
    await expect(memory.channel()).resolves.toBe('youtube');

    later(31);
    await memory.remember('other');
    await expect(memory.channel()).resolves.toBe('other');
    await expect(memory.code()).resolves.toBeNull();
  });

  it('reads an unreadable file as nothing kept', async () => {
    const { memory, corrupt } = memoryAt('2026-12-01T10:00:00Z');
    corrupt('{nope');
    await expect(memory.channel()).resolves.toBeNull();
    corrupt('{"kept":{"channel":"tiktok","at":"2026-12-01T10:00:00Z"}}');
    await expect(memory.channel()).resolves.toBeNull();
  });

  it('forgets everything with the rest of the data', async () => {
    const { memory, text } = memoryAt('2026-12-01T10:00:00Z');
    await memory.remember('facebook', 'FB6PM');
    await memory.forget();
    expect(text()).toBeNull();
    await expect(memory.channel()).resolves.toBeNull();
  });
});

describe('the install referrer', () => {
  const fromLink = () => Promise.resolve(maxCodeReferrer('tinhte', 'TINHTE6PM'));

  it('keeps the channel and code of an install that came from a code link', async () => {
    const { memory } = memoryAt('2026-12-01T10:00:00Z');
    await memory.checkReferrer(fromLink);
    await expect(memory.channel()).resolves.toBe('tinhte');
    await expect(memory.code()).resolves.toBe('TINHTE6PM');
  });

  it('is read once in the life of the install', async () => {
    const { memory } = memoryAt('2026-12-01T10:00:00Z');
    let asked = 0;
    const organic = () => {
      asked += 1;
      return Promise.resolve('utm_source=google-play&utm_medium=organic');
    };
    await memory.checkReferrer(organic);
    await memory.checkReferrer(organic);
    await memory.checkReferrer(fromLink);
    expect(asked).toBe(1);
    await expect(memory.channel()).resolves.toBeNull();
  });

  it('asks again next time when Google Play could not answer', async () => {
    const { memory } = memoryAt('2026-12-01T10:00:00Z');
    await memory.checkReferrer(() => Promise.reject(new Error('Play services missing')));
    await memory.checkReferrer(fromLink);
    await expect(memory.channel()).resolves.toBe('tinhte');
  });

  it('does not replace a link the app was already opened with', async () => {
    const { memory } = memoryAt('2026-12-01T10:00:00Z');
    await memory.remember('friend', 'FRIEND6PM');
    await memory.checkReferrer(fromLink);
    await expect(memory.channel()).resolves.toBe('friend');
  });
});
