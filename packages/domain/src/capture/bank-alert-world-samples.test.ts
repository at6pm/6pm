import { describe, expect, it } from 'vitest';

import { currencyOf } from '../money/currency';
import { COUNTRY_CURRENCY } from '../travel/countries';
import { readBankAlert } from './bank-alert';
import type { WorldAlertSample } from './fixtures/world-alerts';
import { AFRICA_GULF_ALERTS, AFRICA_GULF_SHAPES } from './fixtures/world-alerts-africa-gulf';
import { EAST_ASIA_ALERTS, EAST_ASIA_SHAPES } from './fixtures/world-alerts-east-asia';
import { ENGLISH_ALERTS } from './fixtures/world-alerts-english';
import { EUROPE_ALERTS } from './fixtures/world-alerts-europe';
import { LATIN_AMERICA_ALERTS } from './fixtures/world-alerts-latin-america';
import { MAINLAND_ASIA_ALERTS } from './fixtures/world-alerts-mainland-asia';
import { MARITIME_ASIA_ALERTS } from './fixtures/world-alerts-maritime-asia';
import { PATTERN_ALERTS } from './fixtures/world-alerts-patterns';
import { SOUTH_ASIA_ALERTS } from './fixtures/world-alerts-south-asia';

/** What one alert reads as on a phone counting in its country's currency. */
function readAs(sample: WorldAlertSample) {
  const home = currencyOf(COUNTRY_CURRENCY[sample.country] ?? 'USD');
  const alert = readBankAlert({ app: null, title: sample.title ?? null, body: sample.body }, home);
  if (alert.kind === 'moved') {
    return { way: alert.direction, amount: alert.amount, currency: alert.currency };
  }
  return { skip: alert.reason };
}

function check(sample: WorldAlertSample) {
  const read = readAs(sample);
  if ('skip' in sample.reads && sample.reads.skip === 'any') {
    expect(read).toHaveProperty('skip');
  } else {
    expect(read).toEqual(sample.reads);
  }
}

const name = (sample: WorldAlertSample, index: number) => {
  const reads = 'skip' in sample.reads ? `skipped (${sample.reads.skip})` : sample.reads.way;
  return `${sample.country} ${sample.app} #${index + 1}: ${reads}`;
};

describe.each([
  ['English-speaking banks and global wallets', ENGLISH_ALERTS],
  ['Europe and Turkey', EUROPE_ALERTS],
  ['South Asia', SOUTH_ASIA_ALERTS],
  ['Africa and the Gulf', AFRICA_GULF_ALERTS],
  ['Singapore, Malaysia, Indonesia and the Philippines', MARITIME_ASIA_ALERTS],
  ['Thailand, Cambodia and Laos', MAINLAND_ASIA_ALERTS],
  ['East Asia', EAST_ASIA_ALERTS],
  ['Latin America', LATIN_AMERICA_ALERTS],
] as const)('real alerts: %s', (_, samples) => {
  it.each(samples.map((sample, index) => [name(sample, index), sample] as const))('%s', (_, s) =>
    check(s),
  );
});

/** Written in a country's common shape, or a parser's test data whose wording is unconfirmed. */
const PATTERNS = [...PATTERN_ALERTS, ...AFRICA_GULF_SHAPES, ...EAST_ASIA_SHAPES];

describe('pattern cases', () => {
  it.each(PATTERNS.map((sample, index) => [name(sample, index), sample] as const))(
    'pattern case: %s',
    (_, s) => check(s),
  );
});
