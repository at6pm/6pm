import { File, Paths } from 'expo-file-system';
import { useRouter, type Href } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useEffect } from 'react';
import { AppState } from 'react-native';
import { z } from 'zod';

import { LOOK_IDS } from '@6pm/theme';

import { keepPhotoAt } from '../../data/device-photo-files';
import { useMoneyActions, useMoneyStore } from '../../data/money-provider';
import { useLookSettingsStore } from '../looks/look-settings-provider';
import { setAiMode } from '../privacy/use-ai-mode';
import { pinClock, useClock } from '../../ui/theme/clock';
import { useToast } from '../../ui/toast/toast-host';
import { COMPANION_FORMS } from '../../ui/companion/companion-mood';
import { pinCompanionForm } from './dev-companion-form';
import { CUSTOMER_KEY, serializeCustomer } from '../purchases/customer-memory';
import { FREE_CUSTOMER } from '../purchases/purchases-port';
import { seedDesignFriday } from './design-friday-seed';
import { seedDesignJars } from './design-jars-seed';
import { DEV_MAX, DEV_MAX_KEY } from './dev-max';
import { useI18n } from '../../i18n/i18n';
import { seedDesignMoneyIn } from './design-money-in-seed';
import { seedDesignOwed } from './design-owed-seed';
import { useYearBook } from '../year-book/use-year-book';
import { seedDesignYear } from './design-year-seed';
import { seedDesignTet } from './design-tet-seed';
import { resetSeasonOffer } from '../pots/use-new-year';
import { languages } from '@6pm/i18n';
import { seedCaptureHealth } from './design-capture-health-seed';
import { writeFirstCatch } from '../../data/first-catch';
import { addDays } from '@6pm/domain';

/**
 * Lets scripts drive a developer build with no taps: write `dev-command.json` into the app's
 * Documents folder (`xcrun simctl get_app_container <device> ai.sixpm.app.dev data`), then reload
 * or foreground the app. The file is read once and deleted.
 *
 *   {"seed": "friday", "at": "18:07", "route": "/close", "toast": "Line to show", "companion": "max"}
 *   {"seed": "friday", "jars": "due", "at": "18:00", "max": true}
 *   {"importFile": "momo-history.xlsx"}
 *   {"tet": "bonus", "on": "2027-01-25", "at": "18:00", "route": "/close"}
 *   {"seed": "friday", "photo": "receipt.jpg", "route": "/close"}
 */
const commandSchema = z.object({
  seed: z.enum(['friday', 'year', 'moneyIn']).optional(),
  /** After the seed: the Pots and Plan canvases' jars and states (see `seedDesignJars`). */
  jars: z.enum(['shelf', 'due', 'payday', 'tomorrow', 'over', 'first']).optional(),
  /** After the seed: a split dinner owed by Linh, Nam and Huy, Linh's payback, or both. */
  owed: z.enum(['dinner', 'payback', 'both']).optional(),
  /** The friday or year seed's currency (ISO 4217); đồng when not given. */
  currency: z
    .string()
    .regex(/^[A-Z]{3}$/)
    .optional(),
  /** Multiplies the year seed's earlier days, for long amounts. */
  scale: z.number().positive().optional(),
  /**
   * Moves the app's day to this date (with `at`, or 18:00): the Tết season can be checked before
   * Tết. "" unpins, as `at: ""` does.
   */
  on: z
    .string()
    .regex(/^(\d{4}-\d{2}-\d{2})?$/)
    .optional(),
  /** The Tết Season canvas's states on the designed Friday (see `seedDesignTet`); with `on`. */
  tet: z.enum(['offer', 'bonus', 'window']).optional(),
  /** Speaks this language, as Settings › Language picks it. */
  language: z.enum(languages).optional(),
  /** Pin the clock to today at HH:MM; "" unpins. */
  at: z
    .string()
    .regex(/^(\d{2}:\d{2})?$/)
    .optional(),
  route: z.string().startsWith('/').optional(),
  /** Shows this line in the island toast once the route is open. */
  toast: z.string().min(1).optional(),
  /** Shows the companion in this form whatever was picked or bought; "" follows them again. */
  companion: z.union([z.enum(COMPANION_FORMS), z.literal('')]).optional(),
  /** Wears this look, whether or not it was bought. */
  look: z.enum(LOOK_IDS).optional(),
  /** Where the AI runs, as the Settings choice sets it. */
  aiMode: z.enum(['server', 'device']).optional(),
  /** Holds Max on or off whatever the store says; it takes effect at the next launch. */
  max: z.boolean().optional(),
  /** Binds this year's book and opens the share sheet, as a tap on a bound book does. */
  yearBook: z
    .string()
    .regex(/^\d{4}$/)
    .optional(),
  /** "later": onboarding's "I'll do it later" said yesterday, so Today shows its empty slip. */
  firstCatch: z.literal('later').optional(),
  /** Seeds 14 days of catches per way and this month's receipts read on the phone. */
  captureHealth: z.boolean().optional(),
  /** A file in Documents opened in "Bring your history" as if picked ("momo.xlsx"). */
  importFile: z
    .string()
    .regex(/^[\w.-]+$/)
    .optional(),
  /** A picture in Documents ("receipt.jpg") kept as the photo of today's shared receipts. */
  photo: z
    .string()
    .regex(/^[\w.-]+$/)
    .optional(),
});

export function DevCommands() {
  const router = useRouter();
  const store = useMoneyStore();
  const actions = useMoneyActions();
  const { language, setLanguage } = useI18n();
  const { today } = useClock();
  const toast = useToast();
  const { bind: bindYear } = useYearBook();
  const lookStore = useLookSettingsStore();
  const db = useSQLiteContext();

  useEffect(() => {
    const run = async () => {
      const file = new File(Paths.document, 'dev-command.json');
      if (!file.exists) return;
      const parsed = commandSchema.safeParse(JSON.parse(await file.text()));
      file.delete();
      if (!parsed.success) return;
      const {
        seed,
        jars,
        owed,
        currency,
        scale,
        at,
        route,
        toast: line,
        companion,
        look,
        max,
        yearBook,
        aiMode,
        firstCatch,
        captureHealth,
        importFile,
        photo,
        on,
        tet,
        language: speak,
      } = parsed.data;
      if (speak !== undefined) setLanguage(speak);
      if (aiMode !== undefined) setAiMode(db, aiMode);
      if (look !== undefined) lookStore.setLook(look, () => true);
      if (companion !== undefined) pinCompanionForm(companion === '' ? null : companion);
      if (max !== undefined) {
        const customer = max ? { ...FREE_CUSTOMER, max: DEV_MAX } : FREE_CUSTOMER;
        await store.db.runAsync('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)', [
          CUSTOMER_KEY,
          serializeCustomer(customer),
        ]);
        // Held through the store's answers, which a simulator gives as free.
        await store.db.runAsync('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)', [
          DEV_MAX_KEY,
          max ? '1' : '0',
        ]);
      }
      // The day seeds file under: the pinned one when `on` moves it.
      let day = today;
      if (on !== undefined && on !== '') {
        const [y = 0, mo = 1, d = 1] = on.split('-').map(Number);
        const [h = 18, m = 0] = (at || '18:00').split(':').map(Number);
        pinClock(new Date(y, mo - 1, d, h, m, 0, 0));
        day = on;
      } else if (at !== undefined) {
        const [h = 0, m = 0] = at.split(':').map(Number);
        const pin = new Date();
        pin.setHours(h, m, 0, 0);
        pinClock(at === '' || on === '' ? null : pin);
      } else if (on === '') pinClock(null);
      // In the store's turn, so a load or write already under way never meets a half-cleared
      // database (a set-aside written for a jar the seed has just deleted).
      await store.exclusive(async () => {
        if (captureHealth) await seedCaptureHealth(store, day);
        if (seed === 'friday') await seedDesignFriday(store, day, currency, language);
        if (tet) {
          await seedDesignTet(store, day, tet, currency, speak ?? language);
          await resetSeasonOffer(store.db);
        }
        if (seed === 'year')
          await seedDesignYear(store, day, {
            ...(currency ? { code: currency } : {}),
            ...(scale ? { scale } : {}),
          });
        if (seed === 'moneyIn') await seedDesignMoneyIn(store, day);
        if (jars) await seedDesignJars(store, day, jars);
        if (owed) await seedDesignOwed(store, day, owed);
      });
      if (photo) {
        const picture = new File(Paths.document, photo).uri;
        const shared = store
          .getSnapshot()
          .cycleSpends.filter((s) => s.day === today && s.source === 'shared');
        for (const s of shared) {
          await actions.attachPhoto(s.id, (to) => keepPhotoAt(picture, to).then(() => true));
        }
      }
      // Said yesterday, but after anything seeded: only a catch from now on clears the card.
      if (firstCatch === 'later') {
        await writeFirstCatch(store.db, {
          state: 'later',
          day: addDays(today, -1),
          at: new Date().toISOString(),
          ways: ['wallet'],
        });
        await store.load(today);
      }
      // Over Home, so sheets present as sheets.
      if (route) {
        router.replace('/');
        if (route !== '/') setTimeout(() => router.push(route as Href), 400);
      }
      if (importFile) {
        const picked = new File(Paths.document, importFile);
        router.replace('/');
        setTimeout(() => router.push({ pathname: '/import', params: { uri: picked.uri } }), 400);
      }
      // Held long enough for a headless screenshot to catch it.
      if (line) setTimeout(() => toast(line, 20_000), 1200);
      if (yearBook) setTimeout(() => void bindYear(yearBook), 1200);
    };
    void run();
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') void run();
    });
    return () => subscription.remove();
  }, [router, store, actions, today, toast, bindYear, lookStore, db, language, setLanguage]);

  return null;
}
