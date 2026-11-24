import {
  alertSenderOf,
  inboxItemSchema,
  inboxItemToNewSpend,
  likelyCategoriesAt,
  sightingOfInboxItem,
  type InboxItem,
  type InboxKept,
  type InboxPaid,
  type InboxSpend,
  type InboxTest,
  type InboxUnread,
  waitsForLateRead,
  type AlertReadWaiting,
  type SecondReadOutcome,
  type SightingChannel,
} from '@6pm/domain';
import type { Language } from '@6pm/i18n';

import { billPayments } from './bill-payments';
import { noteReceiptRead } from './first-catch';
import { namedBefore } from './named-before';
import type { moneyActions } from './money-actions';
import type { MoneyStore } from './money-store';
import { stampOnArrival } from './work-actions';
import { workOf } from './work-money';
import { seedStarterCategories } from './onboarding';

/** The App Group inbox as the surfaces module exposes it. */
export interface InboxSource {
  /** Each capture, and the photo the share extension left beside it (a `file://` URI). */
  readInbox(): Promise<
    readonly { readonly id: string; readonly json: string; readonly photo?: string }[]
  >;
  removeInbox(ids: readonly string[]): Promise<void>;
}

export interface InboxImportDeps {
  readonly store: MoneyStore;
  readonly actions: ReturnType<typeof moneyActions>;
  readonly inbox: InboxSource;
  /** Adds what can be learned about a shared receipt before it is saved (the payee's name). */
  readonly enrich: (item: InboxSpend) => Promise<InboxSpend>;
  /**
   * Reads the bank alerts of one import a second time (the server, where 6pm's AI runs there),
   * answering by item id, and saying what became of each asking. Without it every caught alert is
   * saved as the phone read it, and one the phone could not read is let go.
   */
  readonly readAlerts?: (items: readonly (InboxSpend | InboxUnread)[]) => Promise<AlertSecondReads>;
  /**
   * Keeps a caught alert whose second reading got no answer, with its words, to be asked about
   * again (`createLateAlertReads`). Without it such an alert's row stays as the phone read it.
   */
  readonly keepForLateRead?: (entry: AlertReadWaiting) => Promise<void>;
  /**
   * Told that a test alert the person sent to themselves came all the way in. Nothing else is
   * done with one: it is never a spend.
   */
  readonly testArrived?: (item: InboxTest) => void;
  /** Told when a file is dropped; never given the file's content. */
  readonly report: (message: string) => void;
  /**
   * The home currency the app counts in now (ISO 4217); đồng when not given. An item counted in
   * another is kept as a foreign amount, priced when its rate arrives.
   */
  readonly home?: string;
  /**
   * The app's language (the phone's, unless one was picked in Settings): a catch that arrives
   * before onboarding has made the starter categories makes them, named in it.
   */
  readonly language?: Language;
  /**
   * Keeps the photo a capture was read from (`from`) as its spend's (at `to`); left out, the
   * photo stays behind and goes with the capture's file.
   */
  readonly keepPhoto?: (from: string, to: string) => Promise<void>;
}

/**
 * What the second reader made of one alert: the item to save in place of the phone's (or, for an
 * alert the phone could not read, the payment found in it), or no money that moved. An alert with
 * no answer was not read: a caught one is saved as the phone read it, an unread one waits.
 */
export type AlertSecondRead =
  { readonly kind: 'spend'; readonly item: InboxSpend } | { readonly kind: 'none' };

/**
 * One import's second readings: the answers by item id, and what became of each alert the reader
 * was given (`outcomes`), which goes to the capture log and decides nothing.
 */
export interface AlertSecondReads {
  readonly answers: ReadonlyMap<string, AlertSecondRead>;
  readonly outcomes: ReadonlyMap<string, SecondReadOutcome>;
}

const NO_SECOND_READS: AlertSecondReads = { answers: new Map(), outcomes: new Map() };

/** How long an alert the phone could not read waits for the second reader before it is let go. */
export const UNREAD_ALERT_WAIT_MS = 48 * 60 * 60_000;

/** Whether an item is a bank alert the second reader is asked about. */
const asksSecondRead = (item: InboxItem): item is InboxSpend | InboxUnread =>
  item.kind === 'unread' ||
  (item.kind === 'spend' &&
    item.source === 'alert' &&
    item.alertWords !== undefined &&
    item.what !== 'failed');

/**
 * Whether an item is an alert from an app that is named and is not a bank or wallet 6pm knows: a
 * chat or a shop someone put on the Shortcut's trigger. The iPhone's action leaves nothing for
 * such an app, so this only meets one left by a build from before it looked at the sender; it is
 * dropped here just the same, before anything reads its words.
 */
function fromUnknownApp(item: InboxItem): boolean {
  const words =
    item.kind === 'unread'
      ? item.alertWords
      : item.kind === 'heard'
        ? item.words
        : item.kind === 'spend' && item.source === 'alert'
          ? (item.alertWords ?? item.words)
          : undefined;
  return words !== undefined && alertSenderOf(words.app, []) === 'other';
}

/** An alert's own words go no further than its second reading. */
function withoutAlertWords(item: InboxSpend): InboxSpend {
  const { alertWords: _alertWords, ...rest } = item;
  return rest;
}

/** What one import did, for the caller to refresh what the extensions show. */
export interface InboxImportResult {
  readonly saved: number;
  readonly removed: number;
}

/**
 * Saves what the share extension, the shortcuts, the Live Activity and Android's bank alert
 * listener left in the inbox, oldest first, through the same capture as every other source (rules, duplicate merge, the money day
 * of when it happened). A bank alert is saved as its second reader read it, when there is one and
 * it answered (one that got no answer is saved as the phone read it and kept to be asked about
 * again); an alert the phone could not read is saved only if that reader finds a payment in
 * it, and waits two days at most for an answer. A file is removed only after what it said is committed, and importing
 * the same file twice changes nothing: its id is the spend's, or its sighting is already there.
 * An alert from a named app that is not a bank or wallet 6pm knows is dropped before any of that:
 * nothing of it is saved, logged or sent for a second reading.
 * A test alert the person sent to themselves (`test`) is never money: its arrival is told to the
 * screen that sent it and its file removed, with nothing saved, logged or read a second time.
 * Then every caught spend that looks like an unpaid bill's payment is marked as paying it.
 */
export async function importInbox(deps: InboxImportDeps): Promise<InboxImportResult> {
  const { inbox, report } = deps;
  let saved = 0;
  let removed = 0;
  const remove = async (id: string) => {
    await inbox.removeInbox([id]);
    removed += 1;
  };
  const files = (await inbox.readInbox()).map((file) => ({
    file,
    parsed: inboxItemSchema.safeParse(parseJson(file.json)),
  }));
  // Every bank alert of this import is read a second time together, before any is saved: what
  // tells one payment from another (its amount, its way) is read from the item as saved.
  const alerts = files.flatMap(({ parsed }) =>
    parsed.success && asksSecondRead(parsed.data) && !fromUnknownApp(parsed.data)
      ? [parsed.data]
      : [],
  );
  const readAlerts = deps.readAlerts;
  const { answers: reread, outcomes } =
    readAlerts && alerts.length > 0
      ? await readAlerts(alerts).catch(() => NO_SECOND_READS)
      : NO_SECOND_READS;
  for (const { file, parsed } of files) {
    if (!parsed.success) {
      report('inbox: dropped a file that is not a known inbox item');
      await remove(file.id);
      continue;
    }
    const item = parsed.data;
    if (fromUnknownApp(item)) {
      // Not saved, not logged, not read a second time: only its file goes.
      report('inbox: dropped an alert from an app that is not a bank or wallet');
      await remove(file.id);
      continue;
    }
    if (item.kind === 'paid') {
      if (await markPaid(deps, item)) saved += 1;
    } else if (item.kind === 'kept') {
      if (await markKept(deps, item)) saved += 1;
    } else if (item.kind === 'heard') {
      deps.actions.hear(item);
    } else if (item.kind === 'test') {
      deps.testArrived?.(item);
    } else if (item.kind === 'unread') {
      const read = reread.get(item.id);
      if (read?.kind === 'spend') {
        if ((await saveInboxSpend(deps, read.item, undefined, outcomes.get(item.id))) !== null) {
          saved += 1;
        }
      } else if (read === undefined && readAlerts && waitsForSecondRead(item)) {
        // Not answered this time (offline, slow): its file stays for the next import.
        continue;
      } else {
        // Let go: while the capture log is on it says so, as for any alert that moved no money.
        deps.actions.hear(
          {
            v: 1,
            id: item.id,
            kind: 'heard',
            at: item.at,
            bank: item.bank,
            skipped: 'unread',
            words: item.alertWords,
          },
          outcomes.get(item.id),
        );
      }
    } else {
      const read = reread.get(item.id);
      const spendId = await saveInboxSpend(
        deps,
        withoutAlertWords(read?.kind === 'spend' ? read.item : item),
        undefined,
        outcomes.get(item.id),
      );
      if (spendId !== null) {
        saved += 1;
        if (file.photo) await keepInboxPhoto(deps, spendId, file.photo);
        if (waitsForLateRead(outcomes.get(item.id))) await keepAlertWaiting(deps, item, spendId);
      }
    }
    await remove(file.id);
  }
  // A bill's payment caught now, or before this build could tell, is marked as paying it at once.
  await billPayments(deps.store).markCaught();
  return { saved, removed };
}

/**
 * The receipt's photo kept with its spend before the capture's file (and the photo beside it) is
 * removed. A payment seen another way first keeps the photo it has (M9). A photo that cannot be
 * kept never stops the spend from being saved.
 */
async function keepInboxPhoto(deps: InboxImportDeps, spendId: string, from: string) {
  const keep = deps.keepPhoto;
  if (!keep) return;
  try {
    await deps.actions.attachPhoto(
      spendId,
      async (to) => {
        await keep(from, to);
        return true;
      },
      true,
    );
  } catch {
    deps.report('inbox: a capture photo could not be kept');
  }
}

/**
 * A caught alert whose second reading got no answer is kept, with its words and the name and
 * category its row was saved with, to be asked about again. Keeping it never stops the import.
 */
async function keepAlertWaiting(deps: InboxImportDeps, item: InboxSpend, spendId: string) {
  const keep = deps.keepForLateRead;
  const words = item.alertWords;
  if (!keep || !words || item.source !== 'alert') return;
  try {
    const row = await deps.store.tables.spends.get(spendId);
    if (!row) return;
    await keep({
      spendId,
      captureId: item.id,
      at: item.at,
      words,
      read: {
        direction: item.direction === 'in' ? 'in' : 'out',
        amount: item.amount,
        ...(item.foreign ? { foreign: item.foreign } : {}),
        merchant: item.merchant,
      },
      saved: { merchant: row.merchant, categoryId: row.categoryId },
    });
  } catch {
    deps.report('inbox: an alert could not be kept for its second reading');
  }
}

/** An alert the phone could not read is asked about again until it is two days old. */
function waitsForSecondRead(item: InboxUnread): boolean {
  const at = Date.parse(item.at);
  return !Number.isNaN(at) && Date.now() - at < UNREAD_ALERT_WAIT_MS;
}

function parseJson(json: string): unknown {
  try {
    return JSON.parse(json) as unknown;
  } catch {
    return null;
  }
}

/**
 * Saves one spend as the inbox does, through `ingest`: never twice (the same message, a repeat
 * tap or the same receipt again is skipped, and null returned), named first when it is a receipt,
 * then filed and captured with the duplicate merge. Returns the spend it was saved as (the one it
 * merged into, when it did). Scan saves the receipts it reads through here too, as `receiptPhoto`.
 * A bank alert's `secondRead` is what became of its second reading, kept by the capture log.
 */
export async function saveInboxSpend(
  deps: Pick<InboxImportDeps, 'store' | 'actions' | 'enrich' | 'home' | 'language'>,
  incoming: InboxSpend,
  channel?: SightingChannel,
  secondRead?: SecondReadOutcome,
): Promise<string | null> {
  const { store, actions } = deps;
  let item = incoming;
  // A bank alert's payee the person named before is called what they called it, and filed where
  // they filed it.
  const named = async (alert: InboxSpend): Promise<InboxSpend> => {
    if (alert.source !== 'alert') return alert;
    const before = await namedBefore(store.db, alert.merchant, store.getSnapshot().today).catch(
      () => null,
    );
    if (!before) return alert;
    const filed = store.getSnapshot().categories.some((c) => c.id === before.categoryId);
    return {
      ...alert,
      merchant: before.merchant,
      categoryId: filed ? before.categoryId : alert.categoryId,
    };
  };
  const sighting = sightingOfInboxItem(incoming, channel);
  const { step, capture } = await actions.ingest({
    sighting,
    handed: incoming,
    message: incoming,
    ...(secondRead !== undefined ? { secondRead } : {}),
    inbox: {
      item: incoming,
      // The first catch can land while onboarding is still open, before it has made the categories.
      ready: async () => {
        const language = deps.language;
        if (!language || store.getSnapshot().categories.length > 0) return;
        await store.exclusive(async () => {
          if (await seedStarterCategories(store, language)) {
            await store.loadInTurn(store.getSnapshot().today);
          }
        });
      },
    },
    spend: async () => {
      const snap = store.getSnapshot();
      item = incoming.source === 'shared' ? await deps.enrich(incoming) : await named(incoming);
      const categoryIds = new Set(snap.categories.map((c) => c.id));
      const likely = likelyCategoriesAt(new Date(item.at).getHours()).map((n) => n.toLowerCase());
      return inboxItemToNewSpend(item, {
        ruleCategoryId: await actions.ruleCategory(item.merchant).catch(() => null),
        fallbackCategoryId:
          snap.categories.find((c) => likely.includes(c.id))?.id ??
          snap.categories[0]?.id ??
          'food',
        categoryIds,
        ...(deps.home ? { home: deps.home } : {}),
        // Work's banks say whether money in is work, so it keeps the bank it came into.
        ...(workOf(snap) === null ? {} : { walletIn: true }),
      });
    },
  });
  if (!capture) return null;
  // A new payment or money in, for someone with work money, is inked as work when it is known to
  // be; a refund, a reversal or an own transfer is what capture said it is, never takings.
  if (step === 'newRow' && sighting.what !== 'refund' && capture.row.moneyIn !== 'refund') {
    await stampOnArrival(store, actions, capture.row);
  }
  if (!capture.merged && item.source === 'shared') {
    await noteReceiptRead(store.db, capture.row, item.receipt);
  }
  return capture.row.id;
}

/** A waiting payment the Live Activity says went through; anything already answered stays. */
async function markPaid(deps: InboxImportDeps, item: InboxPaid): Promise<boolean> {
  const row = await deps.store.tables.spends.get(item.spendId);
  if (row?.status !== 'pending') return false;
  await deps.actions.update(row.id, { status: 'kept' });
  return true;
}

/**
 * A caught payment confirmed from Android's notification. Its capture may have merged into a
 * payment seen another way first, which is then the one kept; anything already answered stays.
 */
async function markKept(deps: InboxImportDeps, item: InboxKept): Promise<boolean> {
  const own = await deps.store.tables.spends.get(item.spendId);
  const merged = own
    ? []
    : await deps.store.db.getAllAsync<{ spend_id: string }>(
        'SELECT spend_id FROM spend_sightings WHERE capture_id = ? LIMIT 1',
        [item.spendId],
      );
  const into = merged[0]?.spend_id;
  const row = own ?? (into ? await deps.store.tables.spends.get(into) : null);
  if (row?.status !== 'caught') return false;
  await deps.actions.update(row.id, { status: 'kept' });
  return true;
}
