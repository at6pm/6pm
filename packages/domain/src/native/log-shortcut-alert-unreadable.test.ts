import { describe, expect, it, vi } from 'vitest';

import { shortcutAlertResultSchema } from '../contracts/shortcut-alert';
import { logShortcutAlert } from './entry';

// The reader fails on every alert here, as it might on words no one foresaw.
vi.mock('./log-shortcut-alert', () => ({
  buildShortcutAlert: () => {
    throw new Error('unreadable');
  },
}));

const NOW = '2026-11-23T02:30:05.000Z';
const OWN = JSON.stringify(['6pm', 'ai.sixpm.app']);

const answer = (app: string) =>
  shortcutAlertResultSchema.parse(
    JSON.parse(logShortcutAlert(app, 'MB Bank', '', 'GD: -50,000VND', '', '', NOW, OWN, '')),
  );

describe('an alert the reader cannot read', () => {
  it('still notes that a bank’s automation ran, as unread, so no quiet-bank question follows', () => {
    for (const app of ['MB Bank', 'com.vcb.VCB', '']) {
      expect(answer(app), app).toEqual({
        item: null,
        last: { v: 1, at: NOW, bank: null, amountText: '', skipped: 'unread' },
      });
    }
  });

  it('notes nothing for 6pm’s own or any other app’s', () => {
    expect(answer('6pm')).toEqual({ item: null, last: null });
    expect(answer('Zalo')).toEqual({ item: null, last: null });
  });
});
