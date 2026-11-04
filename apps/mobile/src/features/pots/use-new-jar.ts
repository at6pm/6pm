import { useMemo, useState } from 'react';

import {
  dailyNumber,
  hasTet,
  isFutureYouPot,
  isLegacyGoal,
  jarPresets,
  lineWithSetAside,
  newJarMonths,
  potSetAside,
  savedBefore,
  steadyChoices,
  suggestCategoryIcon,
  type JarPreset,
  type PotRow,
} from '@6pm/domain';

import { useMoney } from '../../data/money-provider';
import { dailyInputOf } from '../../data/money-store';
import type { JarFillChoice } from '../../data/plan-actions';
import { useI18n } from '../../i18n/i18n';
import { useMoneyFormat } from '../../money/use-money-format';
import { readDeviceRegion } from '../banks/device-region';

/** How many months "By a date" offers; four show at once and the rest scroll. */
const MONTHS = 24;

export type FillMode = 'date' | 'steady';

export interface NewJarDraft {
  readonly preset: JarPreset['id'] | null;
  readonly name: string;
  readonly icon: string;
  readonly hue: number;
  readonly target: number;
  readonly mode: FillMode;
  readonly month: string;
  readonly steady: number;
}

/** What Ask heard ("tạo hũ du lịch 10tr"): a name, a target and a month. */
export interface AskedJar {
  readonly name: string;
  readonly goal: number;
  readonly by: string | null;
}

/**
 * New jar's state, or a jar's in edit mode: the preset, name, icon, colour and target, how it
 * fills, what that puts in each payday, and today's line before and after.
 */
export function useNewJar(editing: PotRow | null, asked: AskedJar | null) {
  const snap = useMoney();
  const { t } = useI18n();
  const money = useMoneyFormat();
  const currency = money.currency;
  const presets = useMemo(
    () =>
      jarPresets(hasTet({ currency: currency.code, region: readDeviceRegion().region }), currency),
    [currency],
  );
  const months = useMemo(() => newJarMonths(snap.cycle, MONTHS), [snap.cycle]);
  const choices = useMemo(() => steadyChoices(currency), [currency]);
  const presetName = (p: JarPreset) => t(`pots.preset.${p.id}`);

  const [draft, setDraft] = useState<NewJarDraft>(() => {
    if (editing) {
      return {
        preset: presets.find((p) => p.icon === editing.icon)?.id ?? null,
        name: editing.name,
        icon: editing.icon,
        hue: editing.hue,
        target: editing.goal,
        mode: editing.neededBy !== null ? 'date' : 'steady',
        month: editing.neededBy ?? months[1] ?? '',
        steady: editing.monthly ?? choices[1] ?? 0,
      };
    }
    const first = presets[0] as JarPreset;
    const askedIcon = asked && asked.name !== '' ? suggestCategoryIcon(asked.name) : null;
    return {
      preset: asked ? null : first.id,
      name: asked?.name || presetName(first),
      icon: askedIcon ?? first.icon,
      hue: first.hue,
      target: asked && asked.goal > 0 ? asked.goal : first.target,
      mode: asked?.by ? 'date' : first.fills,
      month: asked?.by ?? months[1] ?? '',
      steady: choices[1] ?? 0,
    };
  });
  // A 2.1 goal keeps filling from the slice until the person chooses how it fills.
  const [fillTouched, setFillTouched] = useState(false);

  const change = (patch: Partial<NewJarDraft>) => setDraft((d) => ({ ...d, ...patch }));
  const pick = (p: JarPreset) =>
    change({
      preset: p.id,
      name: presetName(p),
      icon: p.icon,
      hue: p.hue,
      target: p.target,
      mode: p.fills,
      month: months[1] ?? '',
      steady: choices[1] ?? 0,
    });
  const setFill = (patch: Partial<Pick<NewJarDraft, 'mode' | 'month' | 'steady'>>) => {
    setFillTouched(true);
    change(patch);
  };

  const futureYou = editing !== null && isFutureYouPot(editing);
  const legacy = editing !== null && isLegacyGoal(editing) && !fillTouched;
  const held = editing ? savedBefore(snap.potMoves, editing.id, snap.cycle.start) : 0;
  const each =
    futureYou || legacy
      ? (snap.setAsideThisCycle[editing?.id ?? ''] ?? 0)
      : potSetAside({
          pot: {
            kind: 'occasion',
            goal: draft.target,
            neededBy: draft.mode === 'date' ? draft.month : null,
            monthly: draft.mode === 'steady' ? draft.steady : null,
            share: null,
            paused: false,
          },
          savedBefore: held,
          futureYou: 0,
          cycle: snap.cycle,
          currency,
        });
  // Today's line before, and with this jar's set-aside (in place of what it takes now).
  const input = dailyInputOf(snap);
  const before = input ? dailyNumber(input).line : 0;
  const takes =
    editing && editing.kind === 'occasion' ? (snap.setAsideThisCycle[editing.id] ?? 0) : 0;
  const after = input ? lineWithSetAside(input, futureYou || legacy ? 0 : each - takes) : 0;
  const fill: JarFillChoice =
    draft.mode === 'date'
      ? { by: 'date', neededBy: draft.month }
      : { by: 'steady', monthly: draft.steady };

  return {
    draft,
    change,
    pick,
    setFill,
    fillTouched,
    presets,
    presetName,
    months,
    choices,
    each,
    before,
    after,
    fill,
    futureYou,
  };
}
