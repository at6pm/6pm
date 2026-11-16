import { FX_CURRENCY_CODES, type Currency } from '@6pm/domain';

/**
 * The currencies a plan can be counted in, in the order the sheet lists them: the ones this phone
 * points at, then đồng and the dollar, then every other currency the server keeps a rate for, by
 * code. The plan's own is always among them, wherever it came from.
 */
export function currencyChoices(home: string, phone: readonly string[]): string[] {
  const rest = [...FX_CURRENCY_CODES].sort();
  const all = [...phone, 'VND', 'USD', ...rest];
  const listed = all.includes(home) ? all : [home, ...all];
  return [...new Set(listed)];
}

/** A currency named for a sentence: its code, and its symbol when it has one of its own. */
export function currencyName(currency: Currency): string {
  return currency.symbol === currency.code
    ? currency.code
    : `${currency.code} (${currency.symbol})`;
}
