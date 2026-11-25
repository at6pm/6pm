import type { SiteLang } from './langs';
import { liveLinesDe } from './live-lines-de';
import { liveLinesEn } from './live-lines-en';
import { liveLinesEs } from './live-lines-es';
import { liveLinesFr } from './live-lines-fr';
import { liveLinesId } from './live-lines-id';
import { liveLinesJa } from './live-lines-ja';
import { liveLinesKo } from './live-lines-ko';
import { liveLinesTh } from './live-lines-th';
import { liveLinesVi } from './live-lines-vi';
import { liveLinesZhHans } from './live-lines-zh-hans';

/** The lines the page writes in the browser, where they depend on the visitor's clock or the list. */
export interface LiveLines {
  readonly clock: (time: string, left: string) => string;
  readonly closeNow: string;
  readonly duration: (hours: number, minutes: number) => string;
  readonly countdown: (days: number, hours: string, minutes: string) => string;
  readonly out: string;
  readonly sent: string;
  readonly notAnEmail: string;
  readonly busy: string;
  readonly unreachable: string;
}

export const liveLines: Readonly<Record<SiteLang, LiveLines>> = {
  en: liveLinesEn,
  vi: liveLinesVi,
  'zh-Hans': liveLinesZhHans,
  ja: liveLinesJa,
  ko: liveLinesKo,
  th: liveLinesTh,
  id: liveLinesId,
  es: liveLinesEs,
  fr: liveLinesFr,
  de: liveLinesDe,
};
