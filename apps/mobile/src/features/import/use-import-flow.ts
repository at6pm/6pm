import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import {
  currencyOf,
  mainSheet,
  openImportFile,
  pickableRole,
  planOf,
  planReads,
  readLines,
  summariseImport,
  type ColumnPlan,
  type ColumnRole,
  type ImportApp,
  type ImportSummary,
  type OpenFailure,
  type Sheet,
} from '@6pm/domain';

import { bringIn, importedIds, startDayOf } from '../../data/import-actions';
import { useMoney, useMoneyStore } from '../../data/money-provider';
import { homeCurrencyCode } from '../../data/plan-settings';
import { useI18n } from '../../i18n/i18n';
import { deviceCurrencyCode } from '../../money/device-money';
import { useApi } from '../api/native-api';
import { askColumns, askLabels } from './ask-import-map';
import { choiceOf, picksOf, type Choice } from './label-picks';
import type { PickedFile } from './open-file';

/**
 * The bring-in, step by step: the guide, opening the file (asking MoMo's birthday when it is
 * locked), the column table for a file 6pm does not know, what is in it, labelling its categories,
 * and bringing it in. Everything is read on the phone; only an unknown file's headers and value
 * shapes, and category names 6pm could not place, may go to the server, never a value.
 */

export type ImportStep =
  | { readonly kind: 'guide'; readonly error: OpenFailure | null }
  | { readonly kind: 'opening'; readonly locked: boolean }
  | { readonly kind: 'password'; readonly wrong: boolean }
  | { readonly kind: 'columns'; readonly roles: readonly ColumnRole[]; readonly asked: boolean }
  | { readonly kind: 'box' }
  | { readonly kind: 'labels' }
  | { readonly kind: 'bring' };

export interface BringProgress {
  readonly state: 'idle' | 'busy' | 'done' | 'failed';
  readonly written: number;
  /** The oldest day written so far: the months shelve back to it. */
  readonly reached: string | null;
}

/** How long the "Opening…" state shows before heavy work holds the JavaScript thread. */
const PAINT_MS = 60;

export function useImportFlow() {
  const store = useMoneyStore();
  const snap = useMoney();
  const db = useSQLiteContext();
  const api = useApi();
  const { language } = useI18n();
  const [step, setStep] = useState<ImportStep>({ kind: 'guide', error: null });
  const [file, setFile] = useState<PickedFile | null>(null);
  const [sheet, setSheet] = useState<Sheet | null>(null);
  const [plan, setPlan] = useState<ColumnPlan | null>(null);
  const [summary, setSummary] = useState<ImportSummary | null>(null);
  const [app, setApp] = useState<ImportApp>('other');
  const [choices, setChoices] = useState<ReadonlyMap<string, Choice>>(new Map());
  // Labels the person picked themselves; every other filled one is 6pm's suggestion.
  const [chosen, setChosen] = useState<ReadonlySet<string>>(new Set());
  const [progress, setProgress] = useState<BringProgress>({
    state: 'idle',
    written: 0,
    reached: null,
  });
  const [openedMs, setOpenedMs] = useState<number | null>(null);
  const live = useRef(true);
  useEffect(() => {
    live.current = true;
    return () => {
      live.current = false;
    };
  }, []);
  const home = currencyOf(homeCurrencyCode(snap.plan, deviceCurrencyCode()));

  /** Reads the lines with a plan, and sums them up for the box. */
  const unpack = useCallback(
    async (read: Sheet, using: ColumnPlan) => {
      const lines = readLines(read, using, { code: home.code, minorDigits: home.minorDigits });
      const [start, have] = await Promise.all([startDayOf(store), importedIds(store)]);
      const fresh = lines.rows.filter((r) => !have.has(r.id));
      const unpacked = summariseImport({ ...lines, rows: fresh }, start);
      const already = lines.rows.length - fresh.length;
      if (!live.current) return;
      setApp(using.app);
      setPlan(using);
      setSummary({ ...unpacked, alreadyIn: unpacked.alreadyIn + already });
      const categories = store.getSnapshot().categories;
      const picked = new Map<string, Choice>();
      for (const { label, target } of unpacked.labels) {
        if (target !== null) picked.set(label, choiceOf(target, categories));
      }
      setChoices(picked);
      setChosen(new Set());
      setStep({ kind: 'box' });
      // A MoMo history's labels are shops and people: they never leave the phone.
      const unknown = unpacked.labels.filter((l) => !picked.has(l.label)).map((l) => l.label);
      if (using.app !== 'momo' && unknown.length > 0) {
        const answer = await askLabels((r) => api.request(r), db, unknown);
        if (!live.current) return;
        setChoices((now) => {
          const next = new Map(now);
          for (const label of unknown) {
            const target = answer[label.trim().slice(0, 40)];
            if (target && !next.has(label)) next.set(label, choiceOf(target, categories));
          }
          return next;
        });
      }
    },
    [api, db, home.code, home.minorDigits, store],
  );

  /** Opens the bytes: a locked file asks for the birthday, an unknown one for its columns. */
  const open = useCallback(
    (picked: PickedFile, password?: string) => {
      setFile(picked);
      setStep({ kind: 'opening', locked: password !== undefined });
      setTimeout(() => {
        const started = Date.now();
        const opened = openImportFile(picked.bytes, password);
        if (password !== undefined) {
          const took = Date.now() - started;
          setOpenedMs(took);
          // How long the phone took to unlock it, for checking on a device; never the password.
          if (__DEV__) console.info(`import: unlocked in ${took} ms`);
        }
        if (!opened.ok) {
          if (opened.reason === 'locked') setStep({ kind: 'password', wrong: false });
          else if (opened.reason === 'wrongPassword') setStep({ kind: 'password', wrong: true });
          else setStep({ kind: 'guide', error: opened.reason });
          return;
        }
        const read = mainSheet(opened.sheets);
        if (read === null) {
          setStep({ kind: 'guide', error: 'empty' });
          return;
        }
        setSheet(read);
        const found = planOf(read);
        if (found.app !== 'other') {
          void unpack(read, found);
          return;
        }
        setPlan(found);
        const roles = found.roles.map(pickableRole);
        setStep({ kind: 'columns', roles, asked: planReads(found) });
        if (planReads(found)) return;
        void askColumns((r) => api.request(r), db, read, found.header).then((answer) => {
          if (!live.current) return;
          setStep((now) =>
            now.kind === 'columns' && !now.asked
              ? { kind: 'columns', roles: answer ?? now.roles, asked: true }
              : now,
          );
        });
      }, PAINT_MS);
    },
    [api, db, unpack],
  );

  const unlock = useCallback(
    (password: string) => {
      if (file) open(file, password);
    },
    [file, open],
  );

  /** "Read 1.204 lines": the person's roles over the file's header row. */
  const readColumns = useCallback(
    (roles: readonly ColumnRole[]) => {
      if (!sheet || !plan) return;
      void unpack(sheet, { app: 'other', header: plan.header, roles });
    },
    [plan, sheet, unpack],
  );

  const choose = useCallback((label: string, choice: Choice) => {
    setChoices((now) => new Map(now).set(label, choice));
    setChosen((now) => (now.has(label) ? now : new Set(now).add(label)));
  }, []);

  const start = useCallback(async () => {
    if (!summary || progress.state === 'busy') return;
    setStep({ kind: 'bring' });
    setProgress({ state: 'busy', written: 0, reached: null });
    const categories = store.getSnapshot().categories;
    try {
      await bringIn(store, {
        app,
        rows: summary.rows,
        picks: picksOf(choices, categories, language),
        moneyInCategory: categories[0]?.id ?? 'food',
        language,
        onProgress: (written, day) => {
          if (live.current) setProgress({ state: 'busy', written, reached: day });
        },
      });
      if (live.current) {
        setProgress({ state: 'done', written: summary.rows.length, reached: summary.first });
      }
    } catch {
      if (live.current) setProgress((now) => ({ ...now, state: 'failed' }));
    }
  }, [app, choices, language, progress.state, store, summary]);

  const suggested = useMemo(
    () => new Set([...choices.keys()].filter((label) => !chosen.has(label))),
    [choices, chosen],
  );

  const lines = useMemo(() => {
    if (!sheet || !plan) return 0;
    return Math.max(0, sheet.rows.length - plan.header - 1);
  }, [plan, sheet]);

  return {
    categories: snap.categories,
    step,
    setStep,
    file,
    sheet,
    plan,
    lines,
    summary,
    app,
    choices,
    suggested,
    progress,
    openedMs,
    open,
    unlock,
    readColumns,
    choose,
    start,
  };
}

export type ImportFlow = ReturnType<typeof useImportFlow>;
