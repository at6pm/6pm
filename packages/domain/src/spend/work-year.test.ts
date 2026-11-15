import { describe, expect, it } from 'vitest';

import {
  heldBackList,
  NEAR_LINE_SHARE,
  WORK_YEAR_LINE,
  workYearCsv,
  yearLine,
  yearWork,
  type WorkYearCsvLabels,
  type WorkYearCsvRow,
} from './work-year';

const tr = (millions: number) => Math.round(millions * 1_000_000);

let next = 0;
/** Work money in that landed: billed less what was held back. */
function paid(
  day: string,
  from: string,
  billed: number,
  held = 0,
  certificateOn: string | null = null,
  over: Partial<WorkYearCsvRow> = {},
): WorkYearCsvRow {
  next += 1;
  return {
    id: `in-${next}`,
    day,
    merchant: from,
    amount: tr(billed) - tr(held),
    heldBack: held > 0 ? tr(held) : null,
    certificate: certificateOn === null ? null : true,
    certificateOn,
    status: 'kept',
    direction: 'in',
    forWork: true,
    ...over,
  };
}

function cost(day: string, shop: string, millions: number, over: Partial<WorkYearCsvRow> = {}) {
  next += 1;
  return {
    id: `out-${next}`,
    day,
    merchant: shop,
    amount: tr(millions),
    status: 'kept',
    direction: null,
    forWork: true,
    categoryId: 'tools',
    ...over,
  } satisfies WorkYearCsvRow;
}

/** Vy's 2026 as of 30 November: the year drawn on board 8. */
const vy: WorkYearCsvRow[] = [
  paid('2026-01-12', 'Agency Tre', 30, 3, null, { note: 'Lookbook' }),
  paid('2026-01-25', 'Agency Tre', 24.6),
  paid('2026-02-10', 'Studio Mây', 20),
  paid('2026-03-03', 'Agency Tre', 40, 4, '2026-04-02', { note: 'Packaging' }),
  paid('2026-04-18', 'Nhà sách Gió', 25),
  paid('2026-05-20', 'Cà phê Lối', 6, 0.6, '2026-06-15'),
  paid('2026-06-02', 'Anh Minh', 1.2, 0, null, { note: '=Retouch' }),
  paid('2026-07-02', 'Studio Mây', 18, 1.8, '2026-07-30'),
  paid('2026-08-08', 'Agency Tre', 30),
  paid('2026-09-14', 'Nhà sách Gió', 12, 1.2),
  paid('2026-10-21', 'Studio Mây', 40),
  paid('2026-11-08', 'Studio Mây', 20, 2),
  paid('2026-11-21', 'Anh Minh', 1.5, 0, null, { source: 'cash' }),
  paid('2026-11-27', 'Nhà sách Gió', 6, 0.6),
  cost('2026-03-10', 'Adobe', 8),
  cost('2026-07-15', 'Phong Vũ', 5),
  cost('2026-09-01', 'In Kỹ Thuật Số', 3.6),
  cost('2026-11-03', 'Wacom', 5),
  // Not the year's work: deleted, set aside, not work, or last year.
  paid('2026-04-01', 'Agency Tre', 5, 0, null, { status: 'deleted' }),
  cost('2026-05-01', 'Grab', 0.2, { status: 'skipped' }),
  paid('2026-10-01', 'Công ty Mây', 10, 0, null, { forWork: false }),
  paid('2025-12-20', 'Agency Tre', 9, 0.9),
];

describe('the work year', () => {
  const year = yearWork(vy, 2026);

  it('counts work money in as billed: 274,3tr, of which 13,2tr held back', () => {
    expect(year.billed).toBe(274_300_000);
    expect(year.heldBack).toBe(13_200_000);
    expect(year.heldPayments).toBe(7);
  });

  it('knows which certificates are still to come: 4, for 6,8tr', () => {
    expect(year.uncertified).toEqual({ count: 4, amount: 6_800_000 });
  });

  it('keeps what is left once held back and costs are out: 274,3 − 13,2 − 21,6 = 239,5', () => {
    expect(year.costs).toBe(21_600_000);
    expect(year.kept).toBe(239_500_000);
  });

  it('draws the months as billed', () => {
    expect(year.months.map((m) => m / 100_000)).toEqual([
      546, 200, 400, 250, 60, 12, 180, 300, 120, 400, 275, 0,
    ]);
    expect(year.months.reduce((a, b) => a + b, 0)).toBe(year.billed);
  });

  it('counts Studio Mây’s 18tr landing on 8 Nov as 20tr', () => {
    const nov8 = yearWork(
      vy.filter((r) => r.day === '2026-11-08'),
      2026,
    );
    expect(nov8.billed).toBe(20_000_000);
  });

  it('is nothing in a year with no work', () => {
    expect(yearWork(vy, 2024)).toMatchObject({ billed: 0, heldBack: 0, costs: 0, kept: 0 });
  });
});

describe('the line', () => {
  it('stands 725,7tr above 274,3tr, at 27%', () => {
    expect(WORK_YEAR_LINE).toBe(1_000_000_000);
    expect(yearLine(274_300_000)).toEqual({
      line: 1_000_000_000,
      under: 725_700_000,
      share: 0.2743,
      percent: 27,
      near: false,
    });
  });

  it('is near from 80%, and nothing is left under it past it', () => {
    expect(NEAR_LINE_SHARE).toBe(0.8);
    expect(yearLine(799_999_999).near).toBe(false);
    expect(yearLine(800_000_000).near).toBe(true);
    expect(yearLine(1_200_000_000)).toMatchObject({ under: 0, percent: 120 });
  });
});

describe('held back: certificates to chase', () => {
  it('lists every payment a client held tax from, oldest first, inked ones kept', () => {
    const list = heldBackList(vy, 2026);
    expect(
      list.map((e) => [e.row.day, e.row.merchant, e.heldBack, e.arrived, e.certificateOn]),
    ).toEqual([
      ['2026-01-12', 'Agency Tre', 3_000_000, false, null],
      ['2026-03-03', 'Agency Tre', 4_000_000, true, '2026-04-02'],
      ['2026-05-20', 'Cà phê Lối', 600_000, true, '2026-06-15'],
      ['2026-07-02', 'Studio Mây', 1_800_000, true, '2026-07-30'],
      ['2026-09-14', 'Nhà sách Gió', 1_200_000, false, null],
      ['2026-11-08', 'Studio Mây', 2_000_000, false, null],
      ['2026-11-27', 'Nhà sách Gió', 600_000, false, null],
    ]);
  });
});

describe('for whoever files', () => {
  const labels: WorkYearCsvLabels = {
    income: {
      date: 'Date',
      from: 'From',
      job: 'Job',
      billed: 'Billed',
      heldBack: 'Held back',
      landed: 'Landed',
      certificate: 'Certificate',
    },
    costs: { date: 'Date', to: 'To', category: 'Category', amount: 'Amount', note: 'Note' },
  };
  const files = workYearCsv(vy, 2026, labels, {
    jobs: new Map([[vy[11]?.id ?? '', 'Brand kit, part 2']]),
    categories: new Map([['tools', 'Công cụ']]),
  });
  const lines = (text: string) => text.split('\r\n').filter(Boolean);

  it('writes income and costs as two UTF-8 files with a byte order mark', () => {
    expect(files.income.startsWith('﻿')).toBe(true);
    expect(files.costs.startsWith('﻿')).toBe(true);
    expect(lines(files.income)[0]).toBe('﻿Date,From,Job,Billed,Held back,Landed,Certificate');
  });

  it('has one income row for each piece of work money in, amounts as integers', () => {
    expect(files.incomeRows).toBe(14);
    const rows = lines(files.income).slice(1);
    expect(rows[0]).toBe('2026-01-12,Agency Tre,Lookbook,30000000,3000000,27000000,');
    expect(rows[3]).toBe('2026-03-03,Agency Tre,Packaging,40000000,4000000,36000000,2026-04-02');
    expect(rows).toContain('2026-11-08,Studio Mây,"Brand kit, part 2",20000000,2000000,18000000,');
    // Text a spreadsheet would run as a formula is kept as text.
    expect(rows).toContain("2026-06-02,Anh Minh,'=Retouch,1200000,0,1200000,");
    const billed = rows.reduce((sum, row) => sum + Number(row.split(',').at(-4)), 0);
    expect(Number.isNaN(billed)).toBe(false);
  });

  it('puts the costs on a second file', () => {
    expect(lines(files.costs)).toEqual([
      '﻿Date,To,Category,Amount,Note',
      '2026-03-10,Adobe,Công cụ,8000000,',
      '2026-07-15,Phong Vũ,Công cụ,5000000,',
      '2026-09-01,In Kỹ Thuật Số,Công cụ,3600000,',
      '2026-11-03,Wacom,Công cụ,5000000,',
    ]);
  });
});
