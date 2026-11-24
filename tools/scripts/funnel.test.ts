import { describe, expect, it } from 'vitest';

import { funnelReport, type CountRow } from './funnel';

const row = (over: Partial<CountRow>): CountRow => ({
  day: '2026-11-10',
  step: 'first_open',
  detail: '',
  since_open: -1,
  platform: 'android',
  n: 1,
  ...over,
});

describe('funnelReport', () => {
  const window = { from: '2026-11-01', today: '2026-11-20' };

  it('reads day N out of the copies old enough to reach it', () => {
    const text = funnelReport(
      [
        // Ten copies on the 10th, ten on the 18th: only the first ten can have reached day 7.
        row({ n: 10 }),
        row({ day: '2026-11-18', n: 10 }),
        row({ day: '2026-11-17', step: 'open', since_open: 7, n: 4 }),
        // A count for a copy that first opened before the window is left out.
        row({ day: '2026-11-03', step: 'open', since_open: 7, n: 9 }),
      ],
      window,
    );
    const opened = text.split('\n').find((line) => line.trim().startsWith('opened')) ?? '';
    expect(opened).toContain('  4  40%');
    expect(text).toContain('New copies (first open)         20');
  });

  it('names a bank alert by the platform it was caught on', () => {
    const text = funnelReport(
      [
        row({ n: 2 }),
        row({ step: 'capture', detail: 'alert', since_open: 0 }),
        row({ platform: 'ios', step: 'capture', detail: 'alert', since_open: 0 }),
      ],
      window,
    );
    expect(text).toContain('bank alert (android)');
    expect(text).toContain('bank alert, iPhone Shortcut (ios)');
  });
});
