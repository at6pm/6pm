import { describe, expect, it } from '@jest/globals';

import type { PlannedNotification } from '@6pm/domain';
import { translatorFor, type Platform } from '@6pm/i18n';

import { quietWords, type WordsContext } from './notification-words';

const notice: Extract<PlannedNotification, { kind: 'capture' }> = {
  kind: 'capture',
  id: 'capture-quiet:alert',
  day: '2026-11-27',
  at: new Date(2026, 10, 27, 9),
  way: 'alert',
  bank: 'MB Bank',
  days: 3,
};

const on = (platform: Platform, language: 'en' | 'vi' = 'en') => {
  const translate = translatorFor(platform);
  return {
    t: (key: Parameters<typeof translate>[1], params?: Record<string, string | number>) =>
      (translate as (l: string, k: string, p?: object) => string)(language, key, params),
    tone: 'soft',
  } as unknown as WordsContext;
};

describe('the question about bank alerts gone quiet', () => {
  it('asks about the Shortcuts automation on the iPhone', () => {
    expect(quietWords(notice, on('ios'))).toBe(
      'Nothing from MB Bank in 3 days. Is the automation still on?',
    );
  });

  it('asks about notification access on Android, which has no automation, in every tone', () => {
    expect(quietWords(notice, on('android'))).toBe(
      'Nothing from MB Bank in 3 days. Does 6pm still have notification access?',
    );
    for (const tone of ['soft', 'cheeky', 'roast', 'plain'] as const) {
      const words = quietWords(notice, { ...on('android', 'vi'), tone });
      expect(words).toContain('6pm');
      expect(words).not.toMatch(/phím tắt/i);
    }
  });
});
