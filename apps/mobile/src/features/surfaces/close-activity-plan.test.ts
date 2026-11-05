import { describe, expect, it } from '@jest/globals';

import { closeActivityPlan, type ClosePlanInput } from './close-activity-plan';

const today = '2026-10-09';
const at = (time: string) => new Date(`${today}T${time}:00`);

function input(extra: Partial<ClosePlanInput> = {}): ClosePlanInput {
  return {
    running: [],
    today,
    closed: false,
    closeAt: '18:00',
    now: at('13:00'),
    foreground: true,
    enabled: true,
    canSchedule: true,
    stateJson: '{"slips":2}',
    alertTitle: 'It’s six. Close your day.',
    alertBody: '2 waiting',
    ...extra,
  };
}

const running = (key: string, stateJson = '{"slips":2}') => ({
  id: `a-${key}`,
  kind: 'close' as const,
  key,
  stateJson,
});

describe('closeActivityPlan', () => {
  it('asks iOS during the day to bring the close at six, until three hours after it', () => {
    const plan = closeActivityPlan(input());
    expect(plan.start).toMatchObject({ kind: 'close', key: today });
    expect(plan.start?.timing.startAt).toBe(at('18:00').toISOString());
    expect(plan.start?.timing.staleAt).toBe(at('21:00').toISOString());
  });

  it('waits for the window where iOS cannot schedule one', () => {
    expect(closeActivityPlan(input({ canSchedule: false })).start).toBeNull();
    const six = closeActivityPlan(input({ canSchedule: false, now: at('18:20') }));
    expect(six.start).not.toBeNull();
    expect(six.start?.timing.startAt).toBeUndefined();
  });

  it('follows the close the person set', () => {
    const plan = closeActivityPlan(input({ closeAt: '19:30' }));
    expect(plan.start?.timing.startAt).toBe(at('19:30').toISOString());
  });

  it('keeps one for the day, and updates it as spends wait', () => {
    const plan = closeActivityPlan(
      input({ now: at('18:30'), running: [running(today, '{"slips":1}')] }),
    );
    expect(plan.start).toBeNull();
    expect(plan.update).toEqual([{ id: `a-${today}`, stateJson: '{"slips":2}' }]);
    expect(plan.end).toEqual([]);
  });

  it('ends once the day is closed, the window is over, or the day has turned', () => {
    const closed = closeActivityPlan(input({ closed: true, running: [running(today)] }));
    expect(closed.end).toHaveLength(1);
    expect(closed.start).toBeNull();
    const late = closeActivityPlan(input({ now: at('21:05'), running: [running(today)] }));
    expect(late.end).toHaveLength(1);
    const turned = closeActivityPlan(input({ running: [running('2026-10-08')] }));
    expect(turned.end).toEqual([{ id: 'a-2026-10-08', finalStateJson: null }]);
    expect(turned.start).not.toBeNull();
  });

  it('starts nothing in the background or with Live Activities off', () => {
    expect(closeActivityPlan(input({ foreground: false })).start).toBeNull();
    expect(closeActivityPlan(input({ enabled: false })).start).toBeNull();
  });
});
