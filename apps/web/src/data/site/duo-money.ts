import { duoMoneyDe } from './duo-amounts-de';
import { duoMoneyEn } from './duo-amounts-en';
import { duoMoneyEs } from './duo-amounts-es';
import { duoMoneyFr } from './duo-amounts-fr';
import { duoMoneyId } from './duo-amounts-id';
import { duoMoneyJa } from './duo-amounts-ja';
import { duoMoneyKo } from './duo-amounts-ko';
import { duoMoneyTh } from './duo-amounts-th';
import { duoMoneyVi } from './duo-amounts-vi';
import { duoMoneyZhHans } from './duo-amounts-zh-hans';
import type { SiteLang } from './langs';

/** How one market writes the iPhone Duo screens' amounts; the page's script uses it too. */
export interface DuoMoney {
  /** An amount, in whole steps of the market's money, as the screens print it. */
  readonly format: (amount: number) => string;
  /**
   * The propped-up keypad: what it shows around the typed digits, how many steps one typed unit is
   * (the English keypad types dollars, ten steps each), and how many digits it takes, enough for a
   * big spend in the market's money (four for dollars, seven for won).
   */
  readonly keypad: {
    readonly before: string;
    readonly after: string;
    readonly per: number;
    readonly digits: number;
  };
}

export const duoMoneys: Readonly<Record<SiteLang, DuoMoney>> = {
  en: duoMoneyEn,
  vi: duoMoneyVi,
  'zh-Hans': duoMoneyZhHans,
  ja: duoMoneyJa,
  ko: duoMoneyKo,
  th: duoMoneyTh,
  id: duoMoneyId,
  es: duoMoneyEs,
  fr: duoMoneyFr,
  de: duoMoneyDe,
};

/** A screen amount in the page's market money: `$4.80`, `183k`. */
export const duoMoney = (lang: SiteLang, amount: number): string => duoMoneys[lang].format(amount);
