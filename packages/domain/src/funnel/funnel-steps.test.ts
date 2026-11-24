import { describe, expect, it } from 'vitest';

import { funnelEventSchema, funnelKey, funnelReportSchema } from '../contracts/funnel';
import { funnelStepsFrom, type FunnelFacts } from './funnel-steps';

const SINCE = '2026-11-20';

function facts(over: Partial<FunnelFacts> = {}): FunnelFacts {
  return { since: SINCE, today: SINCE, opens: [], catches: [], closes: [], ...over };
}

describe('funnelStepsFrom', () => {
  it('gives nothing on the first day before anything happens', () => {
    expect(funnelStepsFrom(facts({ opens: [0] }))).toEqual([]);
  });

  it('counts opens from day 1 to day 30 once each', () => {
    const steps = funnelStepsFrom(facts({ today: '2026-12-30', opens: [0, 1, 1, 7, 30, 31] }));
    expect(steps.filter((s) => s.step === 'open')).toEqual([
      { step: 'open', day: 1 },
      { step: 'open', day: 7 },
      { step: 'open', day: 30 },
    ]);
  });

  it('names the first catch by its way and counts each way once a day', () => {
    const steps = funnelStepsFrom(
      facts({
        today: '2026-11-23',
        catches: [
          { source: 'alert', day: '2026-11-21' },
          { source: 'manual', day: '2026-11-20' },
          { source: 'alert', day: '2026-11-21' },
          { source: 'alert', day: '2026-11-23' },
        ],
      }),
    );
    expect(steps).toEqual([
      { step: 'first_capture', detail: 'manual', day: 0 },
      { step: 'capture', detail: 'manual', day: 0 },
      { step: 'capture', detail: 'alert', day: 1 },
      { step: 'capture', detail: 'alert', day: 3 },
      { step: 'capture_day', day: 0 },
      { step: 'capture_day', day: 1 },
      { step: 'capture_day', day: 3 },
      { step: 'auto_capture_day', day: 1 },
      { step: 'auto_capture_day', day: 3 },
    ]);
  });

  it('never counts brought-in history, or a catch outside the first 30 days', () => {
    const steps = funnelStepsFrom(
      facts({
        today: '2027-01-30',
        catches: [
          { source: 'import', day: '2026-11-20' },
          { source: 'qr', day: '2026-11-19' },
          { source: 'qr', day: '2026-12-21' },
        ],
      }),
    );
    expect(steps).toEqual([
      { step: 'week_capture_days', detail: '0' },
      { step: 'week_closes', detail: '0' },
    ]);
  });

  it('counts the first close and each day closed', () => {
    const steps = funnelStepsFrom(
      facts({ today: '2026-11-22', closes: ['2026-11-22', '2026-11-21', '2026-11-21'] }),
    );
    expect(steps).toEqual([
      { step: 'first_close', day: 1 },
      { step: 'close', day: 1 },
      { step: 'close', day: 2 },
    ]);
  });

  it('sums up the first week once it is over', () => {
    const during = facts({
      today: '2026-11-26',
      catches: [{ source: 'email', day: '2026-11-20' }],
      closes: ['2026-11-20'],
    });
    expect(funnelStepsFrom(during).some((s) => s.step.startsWith('week_'))).toBe(false);
    const after = funnelStepsFrom({
      ...during,
      today: '2026-11-27',
      catches: [
        { source: 'email', day: '2026-11-20' },
        { source: 'alert', day: '2026-11-20' },
        { source: 'alert', day: '2026-11-26' },
        { source: 'alert', day: '2026-11-27' },
      ],
      closes: ['2026-11-20', '2026-11-27'],
    });
    expect(after).toContainEqual({ step: 'week_capture_days', detail: '2' });
    expect(after).toContainEqual({ step: 'week_closes', detail: '1' });
  });

  it('makes steps the report contract takes, each with its own key', () => {
    const steps = funnelStepsFrom(
      facts({
        today: '2026-12-01',
        opens: [1, 2],
        catches: [{ source: 'applePay', day: '2026-11-21' }],
        closes: ['2026-11-21'],
      }),
    );
    for (const step of steps) expect(funnelEventSchema.safeParse(step).success).toBe(true);
    expect(new Set(steps.map(funnelKey)).size).toBe(steps.length);
  });
});

describe('funnel report contract', () => {
  const report = {
    platform: 'ios',
    version: '2.2.2',
    language: 'vi',
    events: [{ step: 'first_open' }],
  };

  it('takes a plain report', () => {
    expect(funnelReportSchema.safeParse(report).success).toBe(true);
  });

  it('refuses anything that could identify a phone or carry words', () => {
    const refused = [
      { ...report, device: 'abc' },
      { ...report, events: [{ step: 'first_open', token: 'x' }] },
      { ...report, events: [{ step: 'capture', detail: 'MB Bank', day: 1 }] },
      { ...report, events: [{ step: 'max_shown', detail: 'looks', note: 'hi' }] },
      { ...report, events: [{ step: 'open', day: 31 }] },
      { ...report, events: [{ step: 'open', day: 1.5 }] },
      { ...report, version: '2.2.2 (build 7)' },
      { ...report, language: 'pt' },
      { ...report, events: [] },
    ];
    for (const body of refused) expect(funnelReportSchema.safeParse(body).success).toBe(false);
  });
});
