import { describe, expect, it } from 'vitest';

import { alertSenderOf } from './alert-sender';
import { bankOfApp } from './bank-alert-senders';
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

// The alert reader reads a notification only when it knows the app it came from. Every app the
// world alert samples come from must be known by the name its iPhone shows, or its alerts are
// never read at all.

const SAMPLES: readonly WorldAlertSample[] = [
  ...ENGLISH_ALERTS,
  ...EUROPE_ALERTS,
  ...SOUTH_ASIA_ALERTS,
  ...AFRICA_GULF_ALERTS,
  ...AFRICA_GULF_SHAPES,
  ...MARITIME_ASIA_ALERTS,
  ...MAINLAND_ASIA_ALERTS,
  ...EAST_ASIA_ALERTS,
  ...EAST_ASIA_SHAPES,
  ...LATIN_AMERICA_ALERTS,
  ...PATTERN_ALERTS,
];

/**
 * A sample's app label that is not the name of the app the notification comes from, with that
 * name; or null with the reason it reaches no app 6pm reads: a text message, an email, a chat
 * channel, a merchant's app, a bank the source left unnamed, or an app inside a super-app.
 */
const NOT_THE_APP_NAME: Readonly<Record<string, string | null>> = {
  'PayPayカード (PayPay app)': 'PayPay',
  'HDFC Bank (PayZapp)': 'PayZapp',
  'PKO BP (IKO)': 'IKO',
  'ING (Moje ING)': 'Moje ING',
  'BCA mobile / myBCA (Catatan Finansial)': 'myBCA',
  'Teachers Mutual Bank / UniBank': 'Teachers Mutual Bank',
  'Liv (Emirates NBD)': 'Liv',
  'Rize (AmBank)': 'Rize',
  // UOB's app in Singapore; a bare "UOB" is UOB Vietnam's.
  UOB: 'UOB TMRW',
  // Text messages, emails and chat channels: not an app's notification.
  'Sparkasse (Kontowecker SMS)': null,
  'comdirect (SMS)': null,
  'BoursoBank (SMS)': null,
  'LCL (SMS)': null,
  'Bizum (bank SMS)': null,
  'BNL (SMS Alert)': null,
  'Intesa Sanpaolo (SMS)': null,
  'Bank Millennium (SMS)': null,
  'Santander Bank Polska (Alerty24 SMS)': null,
  'BDO (SMS)': null,
  'GCash (SMS)': null,
  'Maya (SMS)': null,
  'SCB (SMS)': null,
  'DBS digibank (email alert)': null,
  'OCBC (email alert)': null,
  'UOB (email alert)': null,
  'KBank (LINE KBank)': null,
  'Krungthai (Krungthai Connext on LINE)': null,
  'SCB (SCB Connect on LINE)': null,
  'ABA PayWay (merchant alert, Telegram)': null,
  // A merchant's app: money its business took, not the person's.
  'DANA Bisnis': null,
  'GoPay Merchant': null,
  // Inside the Coupang shopping app, a super-app.
  '쿠팡페이 (하나 체크카드)': null,
  // The source left the bank unnamed.
  'unknown e-wallet/bank (Malaysia)': null,
  'unknown bank': null,
  'unknown card issuer (Opet campaign)': null,
  'A銀行 (bank anonymised by source)': null,
};

/** The name a sample's notification arrives under: its label, less a note in brackets. */
function appNameOf(label: string): string | null {
  if (label in NOT_THE_APP_NAME) return NOT_THE_APP_NAME[label] ?? null;
  return label.replace(/\s*\([^)]*\)\s*$/, '');
}

const OWN = ['6pm', 'ai.sixpm.app'];
const apps = [
  ...new Map(
    SAMPLES.flatMap((sample) => {
      const name = appNameOf(sample.app);
      return name === null ? [] : [[`${sample.country} ${name}`, { ...sample, name }] as const];
    }),
  ).values(),
];

describe('the apps the world alert samples come from', () => {
  it('are many, across every region', () => {
    expect(apps.length).toBeGreaterThan(100);
  });

  it('are each known to the reader by the name the iPhone shows', () => {
    const unknown = apps.filter((app) => alertSenderOf(app.name, OWN) !== 'bank');
    expect(unknown.map((app) => `${app.country} ${app.name}`)).toEqual([]);
  });

  it('are never taken for a Vietnamese bank, whose alerts are read in Vietnamese', () => {
    const vietnamese = apps.filter(
      (app) => app.country !== 'VN' && bankOfApp(app.name)?.country === 'VN',
    );
    expect(vietnamese.map((app) => `${app.country} ${app.name}`)).toEqual([]);
  });
});
