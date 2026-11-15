import { useState, type RefObject } from 'react';

import { ENVELOPE_START, envelopeAmounts, envelopeTotal, toMinor } from '@6pm/domain';

import { useMoney, useMoneyActions } from '../../data/money-provider';
import { useCompanionToast } from '../companion/use-companion-toast';
import { useRunAction } from '../companion/use-run-action';
import { useI18n } from '../../i18n/i18n';
import { useMoneyFormat } from '../../money/use-money-format';
import { haptics } from '../../ui/haptics';
import { ENVELOPE_CATEGORY_ID, useNewYear } from '../pots/use-new-year';
import type { EnvelopeDestination } from './lixi-mode';

/**
 * Quick add's lì xì mode in the Lunar New Year season: envelopes counted by the envelope, where
 * they come from or go, and Keep it, which saves one spend (or money in) of every envelope.
 */
export function useLixiEntry({
  saving,
  wallet,
  onKept,
}: {
  readonly saving: RefObject<boolean>;
  readonly wallet: string;
  readonly onKept: () => void;
}) {
  const { t } = useI18n();
  const snap = useMoney();
  const actions = useMoneyActions();
  const run = useRunAction();
  const say = useCompanionToast();
  const money = useMoneyFormat();
  const season = useNewYear();
  const on = season.day !== null && season.tradition !== null;
  const amounts = envelopeAmounts(money.currency);
  const [lixi, setLixi] = useState(() => ({
    given: true,
    count: 5,
    each: amounts[ENVELOPE_START] ?? 0,
    said: false,
  }));

  const total = envelopeTotal(lixi.count, lixi.each);
  const seasonJar = season.jar;
  const jarHeld = seasonJar ? (snap.potSaved[seasonJar.id] ?? 0) : 0;
  const destination: EnvelopeDestination = !lixi.given
    ? {
        kind: 'saved',
        title: t('season.quick.saved'),
        sub: t('season.quick.savedSub'),
        hue: 150,
        level: Math.min(1, 0.3 + total / Math.max(1, toMinor(10_000_000, money.currency))),
      }
    : seasonJar && jarHeld > 0
      ? {
          kind: 'jar',
          title: t('season.quick.fromJar', { festival: season.festival }),
          sub: t('season.quick.jarLeft', {
            from: money.short(jarHeld),
            to: money.short(Math.max(0, jarHeld - total)),
          }),
          hue: seasonJar.hue,
          level: seasonJar.goal > 0 ? Math.max(0, jarHeld - total) / seasonJar.goal : 0,
        }
      : {
          kind: 'today',
          title: t('season.quick.counts'),
          sub: t('season.quick.countsSub', { festival: season.festival }),
          hue: 85,
          level: 0,
        };

  /** Keep it, in the lì xì mode: one spend (or money in) of every envelope, in the Lì xì category. */
  const save = async () => {
    if (total <= 0 || saving.current) return;
    saving.current = true;
    const category = {
      id: ENVELOPE_CATEGORY_ID,
      name: season.envelope,
      icon: 'featured_seasonal_and_gifts',
      hue: 20,
      countsDaily: true,
      sort: snap.categories.reduce((most, c) => Math.max(most, c.sort + 1), 0),
      archivedAt: null,
    };
    const common = {
      amount: total,
      categoryId: ENVELOPE_CATEGORY_ID,
      merchant: season.envelope,
      source: lixi.said ? ('voice' as const) : ('manual' as const),
      wallet,
      envelopes: lixi.count,
      makeCategory: category,
    };
    // Given comes out of the Tết jar while it holds something; received waits for the close.
    const saved = await run(() =>
      actions.addSpend(
        lixi.given
          ? {
              ...common,
              status: 'kept',
              fromPot: destination.kind === 'jar' && seasonJar ? seasonJar.id : null,
            }
          : { ...common, status: 'caught', direction: 'in' },
      ),
    );
    if (!saved) {
      saving.current = false;
      return;
    }
    haptics.success();
    say(lixi.given ? 'envelopes' : 'capture');
    onKept();
  };

  return {
    on,
    season,
    amounts,
    lixi,
    setLixi,
    total,
    destination,
    save,
    /** Lì xì said by the envelope: the lì xì mode takes it while it is in season. */
    heard: ({ count, each, incoming }: { count: number; each: number; incoming: boolean }) => {
      if (!on) return false;
      setLixi({ given: !incoming, count, each, said: true });
      return true;
    },
  };
}
