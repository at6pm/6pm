import { describe, expect, it } from 'vitest';

import templateApps from '../../../../tools/scripts/bank-alert-shortcut/apps.json';

import { alertSenderOf } from '../capture/alert-sender';
import { alertPackages, bankOfApp } from '../capture/bank-alert-senders';
import { shortcutAlertResultSchema } from '../contracts/shortcut-alert';
import { bankAlertResultSchema, type SurfaceContext } from '../contracts/surfaces';
import {
  pendingTestAlertSchema,
  TEST_ALERT_CODE_LENGTH,
  TEST_ALERT_CODE_LETTERS,
  TEST_ALERT_FRESH_MS,
  testAlertBodyWithCode,
  testAlertCodeOf,
  type PendingTestAlert,
} from '../contracts/test-alert';
import { findBank } from '../vietqr/bank-catalogue';
import { logBankAlert, logShortcutAlert } from './entry';
import { buildShortcutAlert, ownTestToken } from './log-shortcut-alert';

// Every name, account and amount here is made up.

const NOW = new Date(2026, 10, 23, 9, 30, 5);
const ID = '0b0e7c5e-3f0a-4c1d-9a51-2f6f2f1f7a10';
const OWN = ['6pm', 'ai.sixpm.app'];
const TOKEN = 'K7M29QXR';
const SENT: PendingTestAlert = {
  v: 1,
  token: TOKEN,
  at: new Date(NOW.getTime() - 2000).toISOString(),
};
/** The test alert as the app posts it: its words, then its token on a line of its own. */
const TEST_WORDS = {
  title: '6pm · test alert',
  subtitle: '',
  body: testAlertBodyWithCode('Test: 1.000₫ paid. This is not a real payment.', TOKEN),
};
/** A payment as a bank prints it. */
const PAID =
  'TK 0123xxx456|GD: -50,000VND 23/11/26 09:30|SD: 1,234,567VND|ND: Thanh toan QR PHO HOA';

const context: SurfaceContext = {
  v: 1,
  language: 'en',
  host: 'at6pm.app',
  categories: [],
  rules: [],
  safeToday: 245_000,
  strings: {},
  rates: [],
  // The capture log on: a skipped alert would leave its words, were it read at all.
  keepWords: true,
};

const read = (
  app: string,
  words: { title?: string; subtitle?: string; body: string },
  pending: PendingTestAlert | null = null,
) => buildShortcutAlert({ app, ...words }, OWN, pending, context, NOW, ID);

describe('who sent an alert, from the app alone', () => {
  it('knows a bank or wallet by its app’s name', () => {
    for (const app of ['MB Bank', 'VCB Digibank', 'Techcombank Mobile', 'MoMo', 'Chase']) {
      expect(alertSenderOf(app, OWN)).toBe('bank');
    }
  });

  it('knows 6pm by its whole name or bundle id, whatever the case, and nothing that only starts so', () => {
    expect(alertSenderOf('6pm', OWN)).toBe('own');
    expect(alertSenderOf(' 6PM ', OWN)).toBe('own');
    expect(alertSenderOf('ai.sixpm.app', OWN)).toBe('own');
    expect(alertSenderOf('6pm Dev', OWN)).toBe('other');
    expect(alertSenderOf('6pm Dev', ['6pm Dev', 'ai.sixpm.app.dev'])).toBe('own');
    expect(alertSenderOf('6pm', ['', '  '])).toBe('other');
  });

  it('takes every other app for what it is: not a bank', () => {
    for (const app of ['Zalo', 'Messenger', 'Messages', 'Mail', 'Telegram', 'Shopee', 'X']) {
      expect(alertSenderOf(app, OWN)).toBe('other');
    }
  });

  it('knows every app Android’s listener reads, which names it by its package', () => {
    const packages = alertPackages();
    expect(packages.length).toBeGreaterThan(100);
    expect(packages.filter((pkg) => alertSenderOf(pkg, OWN) !== 'bank')).toEqual([]);
  });

  it('has no sender to check when the automation names no app', () => {
    expect(alertSenderOf('', OWN)).toBe('unnamed');
    expect(alertSenderOf('   ', OWN)).toBe('unnamed');
    expect(alertSenderOf(null, OWN)).toBe('unnamed');
  });
});

describe('an alert from an app that is not a bank or wallet', () => {
  it('leaves nothing, though its words name a bank and an amount that moved', () => {
    const chat = { title: 'Mai', body: `MB Bank: ${PAID}` };
    // Unsorted, those very words are caught as a payment: the sender is what stops them.
    const unsorted = bankAlertResultSchema.parse(
      JSON.parse(
        logBankAlert('', chat.title, '', chat.body, '', JSON.stringify(context), NOW.toISOString()),
      ),
    );
    expect(unsorted.item).toMatchObject({ kind: 'spend', source: 'alert', amount: 50_000 });
    expect(read('Zalo', chat)).toEqual({ item: null, last: null });
  });

  it('leaves no words for a second reading, and none for the capture log', () => {
    // A number no template reads would wait for the server's reading, had a bank sent it.
    const digits = { title: 'Mai', body: 'Chuyển mình 250k nhé, số tài khoản 0123456789' };
    expect(read('MB Bank', digits).unread).toMatchObject({ kind: 'unread' });
    expect(read('Messenger', digits)).toEqual({ item: null, last: null });
    // A code would be noted as skipped, and logged while the log is on, had a bank sent it.
    const code = { title: 'Shop', body: 'Your verification code is 482913' };
    expect(read('MB Bank', code)).toMatchObject({ last: { skipped: 'code' }, heard: {} });
    expect(read('Shopee', code)).toEqual({ item: null, last: null });
  });

  it('notes no last alert, so nothing names the app or says an alert came', () => {
    const result = read('Telegram', { title: 'Vietcombank', body: PAID });
    expect(result.last).toBeNull();
    expect(JSON.stringify(result)).not.toMatch(/Telegram|Vietcombank|50/);
  });

  it('is sorted the same through the native entry, which never throws', () => {
    const answer = (app: unknown, own: unknown = JSON.stringify(OWN)) =>
      shortcutAlertResultSchema.parse(
        JSON.parse(
          logShortcutAlert(
            app as string,
            'Mai',
            '',
            `MB Bank: ${PAID}`,
            '',
            JSON.stringify(context),
            NOW.toISOString(),
            own as string,
            '',
          ),
        ),
      );
    expect(answer('Zalo')).toEqual({ item: null, last: null });
    expect(answer('Zalo', 'not json')).toEqual({ item: null, last: null });
    expect(answer('MB Bank').item).toMatchObject({ kind: 'spend', amount: 50_000 });
    for (const bad of [undefined, null, 7, {}]) {
      // No app at all is an automation built by hand: read as it always was.
      expect(answer(bad).item).toMatchObject({ kind: 'spend', amount: 50_000 });
    }
  });
});

describe('an alert from a bank or wallet 6pm knows, or from an automation that names no app', () => {
  it('is read exactly as before', () => {
    const args = ['Techcombank', '', PAID, '', JSON.stringify(context), NOW.toISOString()] as const;
    for (const app of ['Techcombank Mobile', '']) {
      const before = JSON.parse(logBankAlert(app, ...args)) as { item: { id: string } };
      const sorted = JSON.parse(logShortcutAlert(app, ...args, JSON.stringify(OWN), '')) as {
        item: { id: string };
      };
      // The ids differ only in their random half.
      expect({ ...sorted, item: { ...sorted.item, id: '' } }).toEqual({
        ...before,
        item: { ...before.item, id: '' },
      });
      expect(sorted.item).toMatchObject({ kind: 'spend', source: 'alert', amount: 50_000 });
    }
  });

  it('is never a test alert, even printing the token the app is waiting for', () => {
    const result = read('MB Bank', TEST_WORDS, SENT);
    expect(result.test).toBeUndefined();
    expect(result.last).not.toBeNull();
  });
});

describe('6pm’s own notifications passed by an automation that names no app', () => {
  it('leave a test item for the test alert the app is waiting for, never a spend', () => {
    expect(read('', TEST_WORDS, SENT)).toEqual({
      item: null,
      last: null,
      test: { v: 1, id: ID, kind: 'test', at: NOW.toISOString(), token: TOKEN },
    });
  });

  it('leave nothing for a test alert no longer awaited', () => {
    expect(read('', TEST_WORDS, null)).toEqual({ item: null, last: null });
    const inVietnamese = { ...TEST_WORDS, title: '6pm · thông báo thử' };
    expect(read('', inVietnamese, { ...SENT, token: 'ZZZZ9999' })).toEqual({
      item: null,
      last: null,
    });
  });

  it('leave nothing for the first catch 6pm told, in the words the app left', () => {
    const told = {
      ...context,
      strings: {
        firstCatch: 'Caught your first one: {amount} · {name}. That’s all it takes.',
        firstCatchNoName: 'Caught your first one. That’s all it takes.',
      },
    };
    const said = (body: string) => buildShortcutAlert({ app: '', body }, OWN, null, told, NOW, ID);
    expect(said('Caught your first one: 50.000₫ · MB Bank. That’s all it takes.')).toEqual({
      item: null,
      last: null,
    });
    expect(said('Caught your first one. That’s all it takes.')).toEqual({ item: null, last: null });
    // A bank's alert is still read: only 6pm's own words are passed over.
    expect(said(`MB Bank: ${PAID}`).item).toMatchObject({ kind: 'spend', amount: 50_000 });
  });
});

describe('6pm’s own notifications', () => {
  it('leave a test item, and only that, for the test alert the app is waiting for', () => {
    const result = read('6pm', TEST_WORDS, SENT);
    expect(result).toEqual({
      item: null,
      last: null,
      test: { v: 1, id: ID, kind: 'test', at: NOW.toISOString(), token: TOKEN },
    });
    // Its amount is never read: nothing in the answer is money.
    expect(JSON.stringify(result)).not.toMatch(/1\.000|amount|merchant/);
  });

  it('are not a test by their wording alone', () => {
    expect(read('6pm', TEST_WORDS, null)).toEqual({ item: null, last: null });
    const another = { ...SENT, token: 'ZZZZ9999' };
    expect(read('6pm', TEST_WORDS, another)).toEqual({ item: null, last: null });
  });

  it('are not a test once the app’s wait is over, or before it began', () => {
    const stale = { ...SENT, at: new Date(NOW.getTime() - TEST_ALERT_FRESH_MS - 1).toISOString() };
    expect(read('6pm', TEST_WORDS, stale)).toEqual({ item: null, last: null });
    const ahead = { ...SENT, at: new Date(NOW.getTime() + 1000).toISOString() };
    expect(read('6pm', TEST_WORDS, ahead)).toEqual({ item: null, last: null });
    const edge = { ...SENT, at: new Date(NOW.getTime() - TEST_ALERT_FRESH_MS).toISOString() };
    expect(read('6pm', TEST_WORDS, edge).test).toMatchObject({ token: TOKEN });
    expect(read('6pm', TEST_WORDS, { ...SENT, at: 'not a time at all, really' }).test).toBe(
      undefined,
    );
  });

  it('need the token standing on its own, wherever the automation passes it', () => {
    const inside = { title: '6pm', body: `ref-${TOKEN}9` };
    expect(ownTestToken(inside, SENT, NOW)).toBeNull();
    expect(ownTestToken({ title: TOKEN, body: 'Test' }, SENT, NOW)).toBe(TOKEN);
    expect(ownTestToken({ subtitle: TOKEN, body: 'Test' }, SENT, NOW)).toBe(TOKEN);
    expect(ownTestToken({ body: `Test (${TOKEN}).` }, SENT, NOW)).toBe(TOKEN);
  });

  it('leave nothing otherwise: the close reminder, the first catch said aloud', () => {
    // While a test is awaited, too: only the notification that prints its token is the test.
    for (const pending of [null, SENT]) {
      expect(read('6pm', { body: 'It’s six. Time to close your day.' }, pending)).toEqual({
        item: null,
        last: null,
      });
      expect(
        read('6pm', { body: 'Caught your first one: 50.000₫ · MB Bank. That’s all it takes.' }),
      ).toEqual({ item: null, last: null });
    }
  });

  it('are sorted the same through the native entry', () => {
    const answer = (pendingJson: string) =>
      shortcutAlertResultSchema.parse(
        JSON.parse(
          logShortcutAlert(
            '6pm',
            TEST_WORDS.title,
            '',
            TEST_WORDS.body,
            '',
            JSON.stringify(context),
            NOW.toISOString(),
            JSON.stringify(OWN),
            pendingJson,
          ),
        ),
      );
    expect(answer(JSON.stringify(SENT)).test).toMatchObject({ kind: 'test', token: TOKEN });
    for (const bad of ['', 'not json', '{}', JSON.stringify({ ...SENT, token: 'paid' })]) {
      expect(answer(bad)).toEqual({ item: null, last: null });
    }
  });
});

describe('a test alert’s code', () => {
  it('is eight letters and digits that do not read alike, one from each random byte', () => {
    expect(256 % TEST_ALERT_CODE_LETTERS.length).toBe(0);
    expect(TEST_ALERT_CODE_LETTERS).not.toMatch(/[01OI]/);
    const code = testAlertCodeOf(Uint8Array.from([0, 31, 32, 255, 7, 100, 200, 63, 9]));
    expect(code).toHaveLength(TEST_ALERT_CODE_LENGTH);
    expect(code).toBe('2Z2Z96AZ');
    expect(pendingTestAlertSchema.safeParse({ ...SENT, token: code }).success).toBe(true);
  });

  it('is never a word a notification might say by chance', () => {
    for (const token of ['paid', 'Test', '1000', 'a b c d e f g h']) {
      expect(pendingTestAlertSchema.safeParse({ ...SENT, token }).success).toBe(false);
    }
  });
});

describe('the apps on the published shortcut’s trigger', () => {
  /** The list the shortcut is built from (`tools/scripts/bank-alert-shortcut`). */
  const apps: readonly {
    readonly bundle: string;
    readonly name?: string;
    readonly team?: string;
    readonly own?: boolean;
    readonly bank?: string;
  }[] = templateApps;

  it('are 6pm itself, by the name the action knows it by, and banks and wallets 6pm knows', () => {
    const own = apps.filter((app) => app.own === true);
    expect(own).toEqual([expect.objectContaining({ bundle: 'ai.sixpm.app', name: '6pm' })]);
    expect(alertSenderOf('6pm', ['6pm', 'ai.sixpm.app'])).toBe('own');
    const banks = apps.filter((app) => app.own !== true);
    expect(banks.length).toBeGreaterThanOrEqual(20);
    expect(banks.filter((app) => findBank(app.bank ?? '') === null)).toEqual([]);
  });

  it('are known to the action by the name the trigger passes, wherever the list names one', () => {
    const named = apps.filter((app) => app.own !== true && app.name !== undefined);
    expect(named.length).toBeGreaterThan(0);
    for (const app of named) {
      expect(bankOfApp(app.name)?.id, app.name).toBe(app.bank);
      expect(alertSenderOf(app.name, OWN), app.name).toBe('bank');
    }
  });

  it('are known to the action by their bundle id as well, should the trigger pass that', () => {
    for (const app of apps.filter((entry) => entry.own !== true)) {
      expect(bankOfApp(app.bundle)?.id, app.bundle).toBe(app.bank);
      expect(alertSenderOf(app.bundle, OWN), app.bundle).toBe('bank');
    }
    expect(alertSenderOf('ai.sixpm.app', OWN)).toBe('own');
  });

  it('never carry a name without a team id, which iOS answers with another app', () => {
    expect(apps.filter((app) => app.name !== undefined && app.team === undefined)).toEqual([]);
    // The chat app a bundle-only wallet entry attached itself to stays off the list.
    expect(apps.map((app) => app.bundle.toLowerCase())).not.toContain('vn.com.vng.zalopay');
  });
});
