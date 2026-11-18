import {
  inboxItemSchema,
  inboxItemToNewSpend,
  likelyCategoriesAt,
  sightingOfInboxItem,
  type InboxKept,
  type InboxPaid,
  type InboxSpend,
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
   * Names who a bank alert paid when the phone read no payee from it; without it such a row is
   * saved as read.
   */
  readonly nameAlert?: (item: InboxSpend) => Promise<InboxSpend>;
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

/** What one import did, for the caller to refresh what the extensions show. */
export interface InboxImportResult {
  readonly saved: number;
  readonly removed: number;
}

/**
 * Saves what the share extension, the shortcuts, the Live Activity and Android's bank alert
 * listener left in the inbox, oldest first, through the same capture as every other source (rules, duplicate merge, the money day
 * of when it happened). A file is removed only after what it said is committed, and importing
 * the same file twice changes nothing: its id is the spend's, or its sighting is already there.
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
  for (const file of await inbox.readInbox()) {
    const parsed = inboxItemSchema.safeParse(parseJson(file.json));
    if (!parsed.success) {
      report('inbox: dropped a file that is not a known inbox item');
      await remove(file.id);
      continue;
    }
    const item = parsed.data;
    if (item.kind === 'paid') {
      if (await markPaid(deps, item)) saved += 1;
    } else if (item.kind === 'kept') {
      if (await markKept(deps, item)) saved += 1;
    } else if (item.kind === 'heard') {
      deps.actions.hear(item);
    } else {
      const spendId = await saveInboxSpend(deps, item);
      if (spendId !== null) {
        saved += 1;
        if (file.photo) await keepInboxPhoto(deps, spendId, file.photo);
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
 */
export async function saveInboxSpend(
  deps: Pick<InboxImportDeps, 'store' | 'actions' | 'enrich' | 'nameAlert' | 'home' | 'language'>,
  incoming: InboxSpend,
  channel?: SightingChannel,
): Promise<string | null> {
  const { store, actions } = deps;
  let item = incoming;
  // A bank alert's payee the person named before is called what they called it, and filed where
  // they filed it. One the phone read no payee from is named first, then called the same way.
  const named = async (alert: InboxSpend): Promise<InboxSpend> => {
    if (alert.source !== 'alert') return alert;
    const read = deps.nameAlert ? await deps.nameAlert(alert) : alert;
    const before = await namedBefore(store.db, read.merchant, store.getSnapshot().today).catch(
      () => null,
    );
    if (!before) return read;
    const filed = store.getSnapshot().categories.some((c) => c.id === before.categoryId);
    return {
      ...read,
      merchant: before.merchant,
      categoryId: filed ? before.categoryId : read.categoryId,
    };
  };
  const sighting = sightingOfInboxItem(incoming, channel);
  const { step, capture } = await actions.ingest({
    sighting,
    handed: incoming,
    message: incoming,
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
