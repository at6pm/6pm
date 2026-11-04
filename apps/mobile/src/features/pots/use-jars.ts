import { useMemo } from 'react';

import {
  currencyOf,
  cycleFutureYou,
  intoJarsEachPayday,
  isFutureYouPot,
  jarFillOf,
  jarShelfState,
  jarsEachPayday,
  newJarLocked,
  sharedPotProgress,
  type JarFill,
  type MoneyFormat,
  type PotRow,
  type SharedPot,
} from '@6pm/domain';

import { useMoney } from '../../data/money-provider';
import { dailyInputOf, type MoneySnapshot } from '../../data/money-store';
import { useI18n } from '../../i18n/i18n';
import { moneyFormatFor } from '../../money/use-money-format';
import { useEntitlement } from '../purchases/purchases-provider';
import { useTogether } from '../together/together-provider';
import { initialOf, partnerOf } from '../together/together-state';
import { jarLevel, type JarState } from './jar';
import { jarName } from './jar-name';

/** One of the person's own jars, as the shelf, Pots and its page draw it. */
export interface OwnJar {
  readonly kind: 'own';
  readonly id: string;
  readonly pot: PotRow;
  readonly name: string;
  readonly futureYou: boolean;
  readonly fill: JarFill;
  readonly saved: number;
  /** Its target; 0 for none. */
  readonly target: number;
  /** What it takes each payday (`jarsEachPayday`). */
  readonly each: number;
  readonly level: number;
  readonly state: JarState;
}

/** A jar shared with the partner in Budget together. */
export interface SharedJarView {
  readonly kind: 'shared';
  readonly id: string;
  readonly pot: SharedPot;
  readonly name: string;
  readonly saved: number;
  readonly target: number;
  readonly mine: number;
  readonly theirs: number;
  readonly level: number;
  readonly partnerLevel: number;
  readonly partnerInitial: string;
  readonly partnerName: string | null;
  /** Its money is written in the pot's own currency. */
  readonly money: MoneyFormat;
}

export type ShelfJar = OwnJar | SharedJarView;

export interface Jars {
  /** Future you first, then one's own jars as they were made, then the shared ones. */
  readonly all: readonly ShelfJar[];
  readonly own: readonly OwnJar[];
  /** The plan's one line: what goes into jars each payday. */
  readonly eachPayday: number;
  /** A new jar waits behind Max. */
  readonly locked: boolean;
}

/** One's own jars out of a snapshot. */
export function ownJarsOf(snap: MoneySnapshot, t: Parameters<typeof jarName>[1]): OwnJar[] {
  const input = dailyInputOf(snap);
  const slice = input ? cycleFutureYou(input) : (snap.plan?.futureYou ?? 0);
  const each = jarsEachPayday({ pots: snap.pots, setAside: snap.setAsideThisCycle, slice });
  return snap.pots.map((pot) => {
    const saved = snap.potSaved[pot.id] ?? 0;
    const spentFrom =
      (snap.potSpentThisCycle[pot.id] ?? 0) > 0 ||
      snap.earlierJarSpends.some((s) => s.fromPot === pot.id);
    return {
      kind: 'own',
      id: pot.id,
      pot,
      name: jarName(pot, t),
      futureYou: isFutureYouPot(pot),
      fill: jarFillOf(pot),
      saved,
      target: pot.goal,
      each: each[pot.id] ?? 0,
      level: jarLevel(saved, pot.goal),
      state: jarShelfState({
        pot,
        saved,
        futureYou: snap.plan?.futureYou ?? 0,
        cycle: snap.cycle,
        spentFrom,
      }),
    };
  });
}

/** Every jar for the shelf and Pots, and the plan's line for them. */
export function useJars(): Jars {
  const snap = useMoney();
  const { t, language } = useI18n();
  const together = useTogether();
  const { max } = useEntitlement();
  return useMemo(() => {
    const own = ownJarsOf(snap, t);
    const { state } = together;
    const partner = partnerOf(state);
    const shared: SharedJarView[] =
      state.me === null || state.pair === null
        ? []
        : state.pair.pots.map((pot) => {
            const members =
              partner === null ? [state.me?.id ?? ''] : [state.me?.id ?? '', partner.id];
            const progress = sharedPotProgress(pot.goal, pot.contributions, members);
            const mine = progress.byMember[state.me?.id ?? ''] ?? 0;
            const theirs = partner === null ? 0 : (progress.byMember[partner.id] ?? 0);
            return {
              kind: 'shared',
              id: pot.id,
              pot,
              name: pot.name,
              saved: progress.saved,
              target: pot.goal,
              mine,
              theirs,
              level: jarLevel(progress.saved, pot.goal),
              partnerLevel: pot.goal > 0 ? Math.min(1, theirs / pot.goal) : 0,
              partnerInitial: initialOf(partner?.name),
              partnerName: partner?.name ?? null,
              money: moneyFormatFor(currencyOf(pot.currency), language),
            };
          });
    const input = dailyInputOf(snap);
    const slice = input ? cycleFutureYou(input) : (snap.plan?.futureYou ?? 0);
    return {
      all: [...own, ...shared],
      own,
      eachPayday: intoJarsEachPayday(slice, snap.pots, snap.setAsideThisCycle),
      locked: newJarLocked(snap.pots, max),
    };
  }, [snap, t, language, together, max]);
}
