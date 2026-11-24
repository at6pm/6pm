import { execFileSync } from 'node:child_process';
import path from 'node:path';

/**
 * Prints where new people drop off, from the anonymous funnel counts in an environment's D1.
 * Read only: two SELECTs over counters and device totals, nothing per phone.
 *
 *   node tools/scripts/funnel.ts --env prd [--days 28] [--platform ios|android] [--local]
 *   [--persist-to <dir>]
 *
 * Needs a Wrangler login with access to the database (`npx wrangler login`). `--local` reads the
 * local database `wrangler dev` uses instead of the deployed one (`--persist-to` names its folder).
 *
 * How to read it: every count is copies of the app, not people (a reinstall is a new copy).
 * Steps that happen over the first weeks are tied to the day each copy first opened (its cohort),
 * so "day 7" is out of the copies that first opened at least seven days ago.
 */

export interface CountRow {
  /** The UTC day the count arrived. */
  readonly day: string;
  readonly step: string;
  readonly detail: string;
  /** Days since the copy's first open; -1 for a step without one. */
  readonly since_open: number;
  readonly platform: string;
  readonly n: number;
}

const DAY_MS = 86_400_000;
const MILESTONES = [0, 1, 3, 7, 14, 30] as const;
const ONBOARDING = [
  'welcome',
  'privacy',
  'money_in',
  'bills',
  'future_you',
  'pay_with',
  'ai',
  'catching',
  'close_time',
  'first_number',
] as const;
const WAYS = ['alert', 'applePay', 'email', 'shared', 'qr', 'voice', 'manual', 'cash'] as const;

/** Each way by the name the founder knows it by; a bank alert differs by platform. */
function wayName(way: string, platform: string): string {
  if (way === 'alert') return platform === 'ios' ? 'bank alert, iPhone Shortcut' : 'bank alert';
  const names: Record<string, string> = {
    applePay: 'Wallet automation',
    email: 'receipt email',
    shared: 'shared receipt',
    qr: 'scan',
    voice: 'voice',
    manual: 'typed',
    cash: 'cash',
  };
  return names[way] ?? way;
}

function addDays(day: string, days: number): string {
  return new Date(Date.parse(`${day}T00:00:00Z`) + days * DAY_MS).toISOString().slice(0, 10);
}

/** A step's own day since the first open; the first open is day 0. */
function dayOf(row: CountRow): number {
  return row.step === 'first_open' ? 0 : row.since_open;
}

/** The day a copy first opened, for a step that carries its own day. */
function cohortOf(row: CountRow): string {
  return row.since_open < 0 ? row.day : addDays(row.day, -row.since_open);
}

function percent(part: number, whole: number): string {
  if (whole === 0) return '   –';
  return `${Math.round((part / whole) * 100)}%`.padStart(4);
}

function sum(rows: readonly CountRow[], keep: (row: CountRow) => boolean): number {
  return rows.reduce((total, row) => (keep(row) ? total + row.n : total), 0);
}

export interface FunnelWindow {
  /** The first cohort day counted. */
  readonly from: string;
  /** Today, UTC. */
  readonly today: string;
}

/** The printed report, from the counters of one window. Pure, so it can be checked by a test. */
export function funnelReport(rows: readonly CountRow[], window: FunnelWindow): string {
  const { from, today } = window;
  const inWindow = rows.filter((row) => cohortOf(row) >= from && cohortOf(row) <= today);
  const firstOpens = (latest: string) =>
    sum(inWindow, (row) => row.step === 'first_open' && row.day <= latest);
  const opened = firstOpens(today);
  const lines: string[] = [];
  const out = (line = '') => lines.push(line);

  const byPlatform = ['ios', 'android']
    .map((p) => `${p} ${sum(inWindow, (row) => row.step === 'first_open' && row.platform === p)}`)
    .join(' · ');
  out(`New copies (first open)      ${String(opened).padStart(5)}   ${byPlatform}`);
  out();

  out('Onboarding                   reached   of first opens');
  for (const step of ONBOARDING) {
    const n = sum(inWindow, (row) => row.step === 'onboarding_step' && row.detail === step);
    out(`  ${step.padEnd(26)} ${String(n).padStart(5)}   ${percent(n, opened)}`);
  }
  const done = sum(inWindow, (row) => row.step === 'onboarding_done');
  out(`  ${'finished'.padEnd(26)} ${String(done).padStart(5)}   ${percent(done, opened)}`);
  out();

  /** Of the copies old enough to have reached day `n`, how many reached `keep` on it. */
  const onDay = (n: number, keep: (row: CountRow) => boolean) => {
    const latest = addDays(today, -n);
    const whole = firstOpens(latest);
    const part = sum(inWindow, (row) => dayOf(row) === n && cohortOf(row) <= latest && keep(row));
    return whole === 0
      ? '     –'
      : `${String(part).padStart(3)} ${percent(part, whole)}`.padStart(6);
  };
  const header = MILESTONES.map((n) => `day ${n}`.padStart(9)).join('');
  const dayRow = (label: string, keep: (row: CountRow) => boolean) =>
    out(`  ${label.padEnd(36)}${MILESTONES.map((n) => onDay(n, keep).padStart(9)).join('')}`);

  out(`${'Capture: copies that caught on day N'.padEnd(38)}${header}`);
  dayRow('anything', (row) => row.step === 'capture_day');
  dayRow('on its own (alert, Wallet, email)', (row) => row.step === 'auto_capture_day');
  for (const platform of ['android', 'ios']) {
    for (const way of WAYS) {
      const keep = (row: CountRow) =>
        row.step === 'capture' && row.detail === way && row.platform === platform;
      if (sum(inWindow, keep) === 0) continue;
      dayRow(`${wayName(way, platform)} (${platform})`, keep);
    }
  }
  out();

  out('First catch, by way');
  const caughtFirst = sum(inWindow, (row) => row.step === 'first_capture');
  out(
    `  ${'any way'.padEnd(34)} ${String(caughtFirst).padStart(5)}   ${percent(caughtFirst, opened)}`,
  );
  for (const platform of ['android', 'ios']) {
    for (const way of WAYS) {
      const n = sum(
        inWindow,
        (row) => row.step === 'first_capture' && row.detail === way && row.platform === platform,
      );
      if (n === 0) continue;
      const label = `${wayName(way, platform)} (${platform})`;
      out(
        `  ${label.padEnd(34)} ${String(n).padStart(5)}   ${percent(n, caughtFirst)} of first catches`,
      );
    }
  }
  out();

  const firstClose = sum(inWindow, (row) => row.step === 'first_close');
  out(
    `Close                        ${String(firstClose).padStart(5)}   ${percent(firstClose, opened)} closed at least once`,
  );
  dayRow('closed on day N', (row) => row.step === 'close');
  const weekly = (step: string) =>
    ['0', '1', '2', '3', '4', '5', '6', '7']
      .map((k) => `${k}:${sum(inWindow, (row) => row.step === step && row.detail === k)}`)
      .join(' ');
  out(`  days closed in week 1        ${weekly('week_closes')}`);
  out(`  days caught in week 1        ${weekly('week_capture_days')}`);
  out();

  out(`${'Retention: copies opened on day N'.padEnd(38)}${header}`);
  dayRow('opened', (row) => row.step === 'first_open' || row.step === 'open');
  out();

  const shown = sum(inWindow, (row) => row.step === 'max_shown');
  const bought = sum(inWindow, (row) => row.step === 'max_bought');
  const details = (step: string) => {
    const by = new Map<string, number>();
    for (const row of inWindow) {
      if (row.step === step) by.set(row.detail, (by.get(row.detail) ?? 0) + row.n);
    }
    return [...by].map(([k, n]) => `${k} ${n}`).join(' · ') || '–';
  };
  out(`Max sheet shown              ${String(shown).padStart(5)}   ${details('max_shown')}`);
  out(`Max bought                   ${String(bought).padStart(5)}   ${details('max_bought')}`);
  out(`  heard of 6pm from                  ${details('max_bought_from')}`);
  return lines.join('\n');
}

function argValue(args: readonly string[], name: string): string | undefined {
  const at = args.indexOf(name);
  return at >= 0 ? args[at + 1] : undefined;
}

const DATABASES: Record<string, string> = { dev: 'sixpm-dev', prd: 'sixpm' };

/** `local` is the local database, or a folder `wrangler dev --persist-to` keeps it in. */
function query(env: string, local: boolean | string, sql: string): Record<string, unknown>[] {
  const database = DATABASES[env];
  if (database === undefined) throw new Error('--env must be dev or prd');
  const output = execFileSync(
    'npx',
    [
      'wrangler',
      'd1',
      'execute',
      database,
      '--env',
      env,
      ...(local === false
        ? ['--remote']
        : ['--local', ...(local === true ? [] : ['--persist-to', local])]),
      '--json',
      '--command',
      sql,
    ],
    { cwd: path.join(import.meta.dirname, '../../apps/api'), encoding: 'utf8' },
  );
  const parsed = JSON.parse(output) as { results?: Record<string, unknown>[] }[];
  return parsed[0]?.results ?? [];
}

function main(args: readonly string[]): void {
  const env = argValue(args, '--env') ?? 'dev';
  const days = Number(argValue(args, '--days') ?? '28');
  const platform = argValue(args, '--platform');
  const persisted = argValue(args, '--persist-to');
  const local = persisted ?? args.includes('--local');
  if (!Number.isInteger(days) || days < 1 || days > 400) throw new Error('--days is 1 to 400');
  if (platform !== undefined && platform !== 'ios' && platform !== 'android') {
    throw new Error('--platform is ios or android');
  }
  const today = new Date().toISOString().slice(0, 10);
  const from = addDays(today, -(days - 1));
  // Only dates the script made itself and a fixed platform word go into the SQL.
  const where = `day >= '${from}'${platform ? ` AND platform = '${platform}'` : ''}`;
  const rows = query(
    env,
    local,
    `SELECT day, step, detail, since_open, platform, SUM(count) AS n FROM funnel_counts
     WHERE ${where} GROUP BY day, step, detail, since_open, platform`,
  ) as unknown as CountRow[];
  const scope = platform ?? 'all platforms';
  console.log(`6pm funnel · ${env} · copies first opened ${from} → ${today} (UTC) · ${scope}\n`);
  console.log(funnelReport(rows, { from, today }));

  // The device table's totals, as before the counts existed: every platform, server mode only.
  const [devices] = query(
    env,
    local,
    `SELECT
       SUM(CASE WHEN created_at >= '${from}' THEN 1 ELSE 0 END) AS new_devices,
       SUM(CASE WHEN last_seen_at >= '${addDays(today, -6)}'
                 AND julianday(last_seen_at) - julianday(created_at) >= 1 THEN 1 ELSE 0 END)
         AS weekly_returning
     FROM devices`,
  );
  console.log(
    `\nDevices registered in the window ${Number(devices?.['new_devices'] ?? 0)} · ` +
      `seen in the last 7 days and back a day or more after their first ${Number(devices?.['weekly_returning'] ?? 0)}`,
  );
}

if (import.meta.url === `file://${process.argv[1]}`) main(process.argv.slice(2));
