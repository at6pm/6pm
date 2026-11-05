import { beforeEach, describe, expect, it, jest } from '@jest/globals';

import { openMemoryDb } from '../features/backup/test/memory-db';
import { moneyActions } from './money-actions';
import { createMoneyStore, type MoneyStore } from './money-store';
import { DEFAULT_PLAN, writePlan } from './plan-settings';
import { memoryPhotoFiles } from '../features/backup/test/memory-photos';
import {
  createSpendPhotos,
  photoNameFor,
  photoPrune,
  prunePhotos,
  type SpendPhotos,
} from './spend-photos';

jest.mock('expo-crypto', () => ({ randomUUID: () => crypto.randomUUID() }));

const TODAY = '2026-10-11';

/** A picker that hands back the picture `content` at the URI it is given. */
const picture = (folder: ReturnType<typeof memoryPhotoFiles>, content: string) => (uri: string) => {
  folder.files.set(uri.replace('memory://photos/', ''), Buffer.from(content).toString('base64'));
  return Promise.resolve(true);
};

async function open() {
  const db = openMemoryDb();
  const store = createMoneyStore(db, TODAY);
  await writePlan(db, { ...DEFAULT_PLAN, income: 20_000_000, startedOn: '2026-10-01' });
  await store.tables.categories.put({
    id: 'shopping',
    name: 'Shopping',
    icon: 'local_mall',
    hue: 300,
    countsDaily: true,
    sort: 0,
    archivedAt: null,
  });
  await store.load(TODAY);
  const folder = memoryPhotoFiles();
  let clock = 1_000;
  const photos: SpendPhotos = createSpendPhotos(folder, () => (clock += 1));
  return { store, folder, photos, actions: moneyActions(store, photos) };
}

const shoes = {
  amount: 850_000,
  categoryId: 'shopping',
  merchant: 'Bitis',
  source: 'voice' as const,
  status: 'kept' as const,
};

async function photoOf(store: MoneyStore, id: string) {
  return (await store.tables.spends.get(id))?.photo ?? null;
}

describe('photoNameFor', () => {
  it('names a photo by its spend and its time, safe for a file name', () => {
    expect(photoNameFor('3f2a-11', 36)).toBe('3f2a-11-10.jpg');
    expect(photoNameFor('../etc/passwd', 1)).toBe('___etc_passwd-1.jpg');
  });
});

describe('photoPrune', () => {
  it('lets go of every file no standing spend holds, and never a live one', () => {
    const { orphans, clear } = photoPrune(
      ['a-1.jpg', 'b-1.jpg', 'gone-1.jpg', 'stray.jpg', 'c-1.jpg.partial'],
      [
        { id: 'a', photo: 'a-1.jpg', status: 'kept' },
        { id: 'b', photo: 'b-1.jpg', status: 'caught' },
        { id: 'gone', photo: 'gone-1.jpg', status: 'deleted' },
        { id: 'lost', photo: 'lost-1.jpg', status: 'kept' },
      ],
    );
    expect(orphans.sort()).toEqual(['c-1.jpg.partial', 'gone-1.jpg', 'stray.jpg']);
    expect(clear.sort()).toEqual(['gone', 'lost']);
  });
});

describe('the photo store', () => {
  let ctx: Awaited<ReturnType<typeof open>>;
  beforeEach(async () => {
    ctx = await open();
  });

  it('prunes at launch: no orphan survives, no live photo is pruned', async () => {
    const { store, folder, actions } = ctx;
    const kept = await actions.addSpend(shoes);
    const other = await actions.addSpend({ ...shoes, merchant: 'Circle K', amount: 120_000 });
    await actions.attachPhoto(kept.id, picture(folder, 'shoes'));
    await actions.attachPhoto(other.id, picture(folder, 'receipt'));
    const live = await photoOf(store, kept.id);
    folder.files.set('left-behind.jpg', 'AAAA');
    // A spend whose file went missing, and one deleted by a build that kept its photo.
    folder.files.delete((await photoOf(store, other.id)) ?? '');
    const deleted = await actions.addSpend({ ...shoes, merchant: 'Old', amount: 10_000 });
    await store.db.runAsync("UPDATE spends SET status = 'deleted', photo = ? WHERE id = ?", [
      'old-1.jpg',
      deleted.id,
    ]);
    folder.files.set('old-1.jpg', 'AAAA');

    expect(await prunePhotos(store, folder, ctx.photos)).toBe(2);

    expect(folder.names()).toEqual([live]);
    expect(await photoOf(store, kept.id)).toBe(live);
    expect(await photoOf(store, other.id)).toBeNull();
    expect(await photoOf(store, deleted.id)).toBeNull();
    expect(store.getSnapshot().cycleSpends.find((s) => s.id === other.id)?.photo).toBeNull();
  });

  it('never prunes a photo still being written for its spend', async () => {
    const { store, folder, actions, photos } = ctx;
    const spend = await actions.addSpend(shoes);
    let pruned = -1;
    await actions.attachPhoto(spend.id, async (uri) => {
      await picture(folder, 'shoes')(uri);
      pruned = await prunePhotos(store, folder, photos);
      return true;
    });
    expect(pruned).toBe(0);
    expect(folder.names()).toEqual([await photoOf(store, spend.id)]);
  });

  it('deletes the file with the spend, and brings it back with the undo', async () => {
    const { store, folder, actions } = ctx;
    const spend = await actions.addSpend(shoes);
    await actions.attachPhoto(spend.id, picture(folder, 'shoes'));
    const name = await photoOf(store, spend.id);
    expect(name).not.toBeNull();

    await actions.setStatus(spend.id, 'deleted');
    expect(folder.names()).toEqual([]);
    expect(await photoOf(store, spend.id)).toBeNull();

    await actions.undo(spend.id);
    expect(await photoOf(store, spend.id)).toBe(name);
    expect(folder.files.get(name ?? '')).toBe(Buffer.from('shoes').toString('base64'));
  });

  it('replaces a photo, removing the old file, and removes one with an undo', async () => {
    const { store, folder, actions } = ctx;
    const spend = await actions.addSpend(shoes);
    await actions.attachPhoto(spend.id, picture(folder, 'first'));
    const first = await photoOf(store, spend.id);
    await actions.attachPhoto(spend.id, picture(folder, 'second'));
    const second = await photoOf(store, spend.id);
    expect(second).not.toBe(first);
    expect(folder.names()).toEqual([second]);

    await actions.removePhoto(spend.id);
    expect(folder.names()).toEqual([]);
    expect(store.getSnapshot().cycleSpends[0]?.photo).toBeNull();
    await actions.restorePhoto(spend.id);
    expect(await photoOf(store, spend.id)).toBe(second);
    expect(folder.files.get(second ?? '')).toBe(Buffer.from('second').toString('base64'));
  });

  it("never brings back a removed photo with the spend's own undo", async () => {
    const { store, folder, actions } = ctx;
    const spend = await actions.addSpend(shoes);
    await actions.attachPhoto(spend.id, picture(folder, 'shoes'));
    await actions.removePhoto(spend.id);
    await actions.setStatus(spend.id, 'deleted');
    await actions.undo(spend.id);
    expect(await photoOf(store, spend.id)).toBeNull();
    expect(folder.names()).toEqual([]);
  });

  it('keeps the first photo of a payment seen again, and nothing when the picker is closed', async () => {
    const { store, folder, actions } = ctx;
    const spend = await actions.addSpend(shoes);
    await actions.attachPhoto(spend.id, picture(folder, 'first'));
    const first = await photoOf(store, spend.id);
    expect(await actions.attachPhoto(spend.id, picture(folder, 'again'), true)).toBeNull();
    expect(folder.names()).toEqual([first]);

    expect(await actions.attachPhoto(spend.id, () => Promise.resolve(false))).toBeNull();
    expect(folder.names()).toEqual([first]);
    expect(await photoOf(store, spend.id)).toBe(first);
  });

  it('leaves no file behind when the picture could not be kept', async () => {
    const { store, folder, actions } = ctx;
    const spend = await actions.addSpend(shoes);
    await expect(
      actions.attachPhoto(spend.id, async (uri) => {
        await picture(folder, 'half')(uri);
        throw new Error('encode');
      }),
    ).rejects.toThrow('encode');
    expect(folder.names()).toEqual([]);
    expect(await photoOf(store, spend.id)).toBeNull();
  });
});
