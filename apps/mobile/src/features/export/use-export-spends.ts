import { useCallback, useRef, useState } from 'react';

import { localTimeOf, spendsCsv, type Currency, type SpendsCsvLabels } from '@6pm/domain';

import { notDailyOf } from '../../data/diary-queries';
import { useMoneyStore } from '../../data/money-provider';
import { useI18n } from '../../i18n/i18n';
import { useHomeCurrency, useMoneyFormat } from '../../money/use-money-format';
import { jarName } from '../pots/jar-name';
import { useToast } from '../../ui/toast/toast-host';
import { useClock } from '../../ui/theme/clock';
import { exportFileName } from './export-file';
import { withJarNotes } from './jar-notes';
import { shareCsv } from './share-csv';

type T = ReturnType<typeof useI18n>['t'];

/** The file's words in the app's language. Statuses and sources read as the spend's details do. */
function labelsOf(t: T, currency: Currency): SpendsCsvLabels {
  return {
    headers: {
      date: t('export.csv.date'),
      time: t('export.csv.time'),
      merchant: t('export.csv.merchant'),
      category: t('export.csv.category'),
      amount: t('export.csv.amount', { code: currency.code }),
      status: t('export.csv.status'),
      source: t('export.csv.source'),
      wallet: t('export.csv.wallet'),
      note: t('export.csv.note'),
      detail: t('export.csv.detail'),
      forWork: t('export.csv.forWork'),
      foreignAmount: t('export.csv.foreignAmount'),
      currency: t('export.csv.currency'),
    },
    status: {
      kept: t('details.status.kept'),
      caught: t('details.status.caught'),
      pending: t('details.status.pending'),
      skipped: t('details.status.skipped'),
    },
    source: {
      manual: t('source.manual'),
      voice: t('source.voice'),
      shared: t('source.shared'),
      qr: t('source.qr'),
      email: t('source.email'),
      applePay: t('source.applePay'),
      cash: t('source.cash'),
      alert: t('source.alert'),
    },
    yes: t('export.csv.yes'),
    no: t('export.csv.no'),
  };
}

/**
 * Exports every spend the phone holds (every pay cycle, not only this one) as a CSV and opens
 * the share sheet with it. One export at a time; `busy` is true while the file is made and shared.
 */
export function useExportSpends() {
  const store = useMoneyStore();
  const { t } = useI18n();
  const currency = useHomeCurrency();
  const money = useMoneyFormat();
  const { today } = useClock();
  const toast = useToast();
  const [busy, setBusy] = useState(false);
  const running = useRef(false);

  const run = useCallback(async () => {
    if (running.current) return;
    running.current = true;
    setBusy(true);
    try {
      // After any write still in flight, so the file has the spend just added.
      // Jars since deleted too: a spend taken from one still says which.
      const [spends, categories, pots] = await store.exclusive(() =>
        Promise.all([
          store.tables.spends.select("WHERE status != 'deleted' ORDER BY day, at", []),
          store.tables.categories.all(),
          store.tables.pots.all(),
        ]),
      );
      if (spends.length === 0) {
        toast(t('export.empty'));
        return;
      }
      const names = new Map(pots.map((p) => [p.id, jarName(p, t)]));
      // A jar the phone no longer has at all is just "From a jar".
      const rows = withJarNotes(spends, notDailyOf({ categories }), {
        whole: (potId) => {
          const jar = names.get(potId);
          return jar ? t('export.csv.fromJar', { jar }) : t('potsClose.fromJar');
        },
        part: (potId, covered) => {
          const jar = names.get(potId);
          return jar
            ? t('export.csv.fromJarPart', { jar, amount: money.full(covered) })
            : t('potsClose.fromJar');
        },
      });
      const csv = spendsCsv(rows, categories, labelsOf(t, currency), localTimeOf, currency);
      await shareCsv(exportFileName(today), csv);
    } catch (error: unknown) {
      console.error('Exporting the spends failed', error);
      toast(t('export.failed'));
    } finally {
      running.current = false;
      setBusy(false);
    }
  }, [currency, money, store, t, today, toast]);

  return { run, busy };
}
