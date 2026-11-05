import { describe, expect, it } from '@jest/globals';

import {
  FUTURE_YOU_POT_ID,
  futureYouPotRow,
  spendsCsv,
  type CategoryRow,
  type SpendRow,
  type SpendsCsvLabels,
} from '@6pm/domain';
import { t } from '@6pm/i18n';

import { fromJarLabeller } from '../diary/jar-lines';
import { withJarNotes } from './jar-notes';

const at = '2026-10-11T05:00:00.000Z';
const spend = (id: string, amount: number, more: Partial<SpendRow> = {}): SpendRow => ({
  id,
  day: '2026-10-11',
  at,
  amount,
  categoryId: 'food',
  merchant: id,
  note: null,
  source: 'cash',
  status: 'kept',
  previousStatus: null,
  wallet: null,
  forWork: false,
  detail: null,
  foreignAmount: null,
  createdAt: at,
  updatedAt: at,
  ...more,
});

const categories: CategoryRow[] = [
  {
    id: 'food',
    name: 'Food',
    icon: 'restaurant',
    hue: 40,
    countsDaily: true,
    sort: 0,
    archivedAt: null,
  },
];
const headers = Object.fromEntries(
  ['date', 'time', 'merchant', 'category', 'amount', 'status', 'source', 'wallet', 'note']
    .concat(['detail', 'forWork', 'foreignAmount', 'currency'])
    .map((c) => [c, c]),
) as SpendsCsvLabels['headers'];
const labels: SpendsCsvLabels = {
  headers,
  status: { kept: 'kept', caught: 'caught', pending: 'pending', skipped: 'skipped' },
  source: {
    manual: 'manual',
    voice: 'voice',
    shared: 'shared',
    qr: 'qr',
    email: 'email',
    applePay: 'applePay',
    cash: 'cash',
    alert: 'alert',
    import: 'import',
  },
  yes: 'yes',
  no: 'no',
};

const words = {
  whole: (potId: string) => t('en', 'export.csv.fromJar', { jar: potId }),
  part: (potId: string, covered: number) =>
    t('en', 'export.csv.fromJarPart', { jar: potId, amount: String(covered) }),
};

describe('withJarNotes', () => {
  it('keeps a spend from a jar at its full amount and says the jar in its note', () => {
    const rows = withJarNotes(
      [
        spend('hotel', 1_200_000, { fromPot: 'Đà Lạt', fromPotAmount: 1_200_000, note: 'Trip' }),
        spend('coffee', 50_000, { fromPot: 'Đà Lạt', fromPotAmount: 30_000 }),
        spend('lunch', 60_000),
      ],
      new Set(),
      words,
    );
    const csv = spendsCsv(rows, categories, labels, () => '12:00').split('\r\n');
    expect(csv[1]).toBe('2026-10-11,12:00,hotel,Food,1200000,kept,cash,,Trip · From Đà Lạt,,no,,');
    expect(csv[2]).toBe('2026-10-11,12:00,coffee,Food,50000,kept,cash,,From Đà Lạt: 30000,,no,,');
    expect(csv[3]).toBe('2026-10-11,12:00,lunch,Food,60000,kept,cash,,,,no,,');
  });

  it('names Future you in the phone’s language', () => {
    const name = fromJarLabeller([futureYouPotRow(at)], (key, ...params) =>
      t('vi', key, ...params),
    );
    expect(name(FUTURE_YOU_POT_ID)).toBe('Từ hũ Tương lai');
    expect(name('gone')).toBe(t('vi', 'potsClose.fromJar'));
  });
});
