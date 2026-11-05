import { useMemo } from 'react';

import type { SurfaceSnapshot } from '@6pm/domain';
import { paletteFor, type Palette } from '@6pm/theme';

import { useMoney } from '../../data/money-provider';
import { useI18n } from '../../i18n/i18n';
import { useMoneyFormat } from '../../money/use-money-format';
import { symbolCodepoints, type SymbolName } from '../../ui/icons/symbols.generated';
import { useClock } from '../../ui/theme/clock';
import { useLookSettings } from '../looks/look-settings-provider';
import { useNewYear } from '../pots/use-new-year';
import { resolveLook } from '../purchases/entitlement';
import { useEntitlement } from '../purchases/purchases-provider';
import { widgetLook, widgetTokens } from '../surfaces/surface-palette';
import { surfaceSnapshot } from '../surfaces/surface-snapshot';
import { useClosedHistory } from '../surfaces/use-closed-history';
import { useHideAmounts } from '../surfaces/use-hide-amounts';

type Entry = SurfaceSnapshot['entries'][number];
type Jar = NonNullable<SurfaceSnapshot['jars']>[number];

/** One of the jars, with its glyph as the app names it. */
export interface PreviewJar extends Omit<Jar, 'icon'> {
  readonly icon: SymbolName;
}

/** What the widgets show right now, worked out exactly as the app writes it for them. */
export interface WidgetPreview {
  /** The stretch of the money day showing now; null before the month is set up. */
  readonly entry: Entry | null;
  readonly card: NonNullable<Entry['card']> | null;
  readonly jars: readonly PreviewJar[];
  readonly streak: SurfaceSnapshot['streak'] | null;
  readonly month: SurfaceSnapshot['month'] | null;
  readonly look: NonNullable<SurfaceSnapshot['look']> | null;
  readonly strings: SurfaceSnapshot['strings'];
  /** The widgets' colours this stretch, by the names Swift reads them under. */
  readonly ink: Readonly<Record<string, string>>;
  /** The look the widgets wear this stretch: its display face sets the big number. */
  readonly palette: Palette;
  /** The widgets wear the person's own look (Max), not Golden Hour. */
  readonly ownLook: boolean;
  /** Serious mode: no companion on the Live Activity. */
  readonly serious: boolean;
  /** Amounts hide on the widgets until the phone is unlocked. */
  readonly hideAmounts: boolean;
}

const byCodepoint = new Map<number, SymbolName>(
  (Object.entries(symbolCodepoints) as [SymbolName, number][]).map(([name, code]) => [code, name]),
);

function nameOfGlyph(glyph: string): SymbolName {
  return byCodepoint.get(glyph.codePointAt(0) ?? 0) ?? 'savings';
}

/**
 * The widgets as they stand: the same snapshot the app hands to WidgetKit (the person's numbers,
 * jars, evenings and words), at the stretch of the day showing now. The guide draws its
 * miniatures from it, so what it shows is what the person will see once they add one.
 */
export function useWidgetPreview(): WidgetPreview {
  const money = useMoney();
  const { t, language } = useI18n();
  const format = useMoneyFormat();
  const { look, config } = useLookSettings();
  const { customer, max } = useEntitlement();
  const { tradition } = useNewYear();
  const [hideAmounts] = useHideAmounts();
  const history = useClosedHistory();
  const { now } = useClock();
  const serious = money.plan?.serious ?? false;
  const worn = resolveLook(look, customer);
  const ownConfig = config[worn];
  const minute = Math.floor(now.getTime() / 60_000);

  return useMemo(() => {
    const widget = widgetLook({
      max,
      look: worn,
      serious,
      ...(ownConfig ? { config: ownConfig } : {}),
    });
    const snapshot = surfaceSnapshot({
      money,
      look: widget,
      maxLook: max ? worn : null,
      t,
      format,
      language,
      writtenAt: new Date(minute * 60_000),
      ...(history ? { closedHistory: history.closed, since: history.since } : {}),
      tradition,
      hideAmounts,
    });
    const at = minute * 60_000;
    const entry =
      [...snapshot.entries].reverse().find((e) => new Date(e.from).getTime() <= at) ??
      snapshot.entries[0] ??
      null;
    const hour = entry?.card?.hour ?? new Date(at).getHours();
    const palette = paletteFor({
      look: widget.look,
      hour: Math.floor(hour),
      serious: widget.serious,
      ...(widget.config ? { config: widget.config } : {}),
    });
    return {
      entry,
      card: entry?.card ?? null,
      jars: (snapshot.jars ?? []).map((jar) => ({ ...jar, icon: nameOfGlyph(jar.icon) })),
      streak: snapshot.streak ?? null,
      month: snapshot.month ?? null,
      look: snapshot.look ?? null,
      strings: snapshot.strings,
      ink: widgetTokens(palette),
      palette,
      ownLook: max,
      serious,
      hideAmounts,
    };
  }, [
    money,
    max,
    worn,
    ownConfig,
    serious,
    t,
    format,
    language,
    history,
    tradition,
    hideAmounts,
    minute,
  ]);
}
