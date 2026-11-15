import { useEffect, useMemo, useState } from 'react';

import { heldBackList, yearWork, type SpendRow, type WorkYear } from '@6pm/domain';

import { useMoney, useMoneyStore } from '../../data/money-provider';
import { readRequestJobs, readWorkYearRows } from '../../data/request-actions';

const EMPTY: readonly SpendRow[] = [];

/**
 * The work year of today's calendar year, read from every work spend and money in of the year,
 * and read again after each write (the snapshot changes with it). `rows` is empty until read.
 */
export function useWorkYear() {
  const snap = useMoney();
  const store = useMoneyStore();
  const year = Number(snap.today.slice(0, 4));
  const [rows, setRows] = useState<readonly SpendRow[] | null>(null);
  const [jobs, setJobs] = useState<ReadonlyMap<string, string>>(new Map());
  useEffect(() => {
    let live = true;
    Promise.all([
      readWorkYearRows(store, year),
      readRequestJobs(store, `${year}-01-01`, `${year}-12-31`),
    ])
      .then(([read, named]) => {
        if (!live) return;
        setRows(read);
        setJobs(named);
      })
      .catch(() => live && setRows(EMPTY));
    return () => {
      live = false;
    };
  }, [store, year, snap]);
  const all = rows ?? EMPTY;
  const work: WorkYear = useMemo(() => yearWork(all, year), [all, year]);
  const held = useMemo(() => heldBackList(all, year), [all, year]);
  return { year, rows: all, read: rows !== null, work, held, jobs };
}
