import { describe, expect, it } from 'vitest';

import { futureYouPotRow } from '../plan/pots';
import { dueJarFor, readyJarFor, readyKey } from './jar-match';

const jar = {
  id: 'dalat',
  kind: 'occasion' as const,
  icon: 'landscape',
  goal: 6_000_000,
  neededBy: '2026-12',
  paused: false,
  archivedAt: null,
};
const rainy = { ...jar, id: 'rainy', icon: 'umbrella', neededBy: null };
const fy = futureYouPotRow('2026-11-04T10:00:00.000Z');
const saved = { dalat: 6_000_000, rainy: 5_000_000, futureYou: 18_900_000 };
const hotel = { day: '2026-12-20', amount: 1_200_000 };
const away = { travelling: false };

describe('the close asks "From your jar?" only for a dated jar that is due', () => {
  it('asks about a 1,2tr hotel on 20 Dec for a Đà Lạt jar due in December', () => {
    expect(dueJarFor(hotel, [fy, rainy, jar], saved, away)?.id).toBe('dalat');
  });

  it('never for Future you or a jar with no date, even in the same month', () => {
    expect(dueJarFor(hotel, [fy, rainy], saved, away)).toBeNull();
  });

  it('never before the jar’s month, nor for a jar named in the spend', () => {
    expect(dueJarFor({ ...hotel, day: '2026-11-20' }, [jar], saved, away)).toBeNull();
    expect(dueJarFor({ day: '2027-01-02', amount: 100_000 }, [jar], saved, away)).toBeNull();
  });

  it('asks about a trip jar while Travel mode is on, up to its month', () => {
    const trip = { travelling: true };
    expect(dueJarFor({ ...hotel, day: '2026-11-20' }, [jar], saved, trip)?.id).toBe('dalat');
    expect(dueJarFor({ ...hotel, day: '2027-01-20' }, [jar], saved, trip)).toBeNull();
    const tet = { ...jar, id: 'tet', icon: 'local_florist', neededBy: '2027-02' };
    expect(dueJarFor({ ...hotel, day: '2026-11-20' }, [tet], { tet: 1 }, trip)).toBeNull();
  });

  it('never for an empty, paused or deleted jar, money in, work or a bill', () => {
    expect(dueJarFor(hotel, [jar], { dalat: 0 }, away)).toBeNull();
    expect(dueJarFor(hotel, [{ ...jar, paused: true }], saved, away)).toBeNull();
    expect(
      dueJarFor(hotel, [{ ...jar, archivedAt: '2026-12-01T00:00:00Z' }], saved, away),
    ).toBeNull();
    expect(dueJarFor({ ...hotel, direction: 'in' }, [jar], saved, away)).toBeNull();
    expect(dueJarFor({ ...hotel, forWork: true }, [jar], saved, away)).toBeNull();
    expect(dueJarFor({ ...hotel, paysBill: 'rent' }, [jar], saved, away)).toBeNull();
    expect(dueJarFor({ ...hotel, fromPot: 'rainy' }, [jar], saved, away)).toBeNull();
  });
});

describe('a jar is ready once per reason', () => {
  it('celebrates a full jar once, then its date once', () => {
    const shown = new Set<string>();
    const first = readyJarFor([fy, jar], saved, '2026-11-20', shown);
    expect(first).toEqual({ jar, reason: 'full' });
    shown.add(readyKey('dalat', 'full'));
    expect(readyJarFor([fy, jar], saved, '2026-11-21', shown)).toBeNull();
    const short = { dalat: 5_400_000 };
    expect(readyJarFor([jar], short, '2026-12-01', new Set())).toEqual({ jar, reason: 'date' });
    expect(
      readyJarFor([jar], short, '2026-12-02', new Set([readyKey('dalat', 'date')])),
    ).toBeNull();
  });

  it('never celebrates Future you', () => {
    const target = { ...fy, goal: 1_000_000 };
    expect(readyJarFor([target], { futureYou: 5_000_000 }, '2026-12-01', new Set())).toBeNull();
  });
});
