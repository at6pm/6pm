import { maxPrices } from './config';
import { siteLangInfo, type SiteLang } from './langs';

/**
 * A Max price as the page prints it, in its market's money: `$2.49`, `49.000₫`, `¥400`. Whole
 * amounts drop the zero cents. Vietnamese pages write the đồng sign tight, as the rest of the page
 * writes money. Yen take the plain `¥` the rest of the page and the app write, not the full-width
 * sign Japanese formatting gives them.
 */
export function maxPriceLabel(lang: SiteLang, period: 'month' | 'year'): string {
  const amount = maxPrices[lang][period];
  const { locale, currency } = siteLangInfo[lang].market;
  const whole = Number.isInteger(amount)
    ? { minimumFractionDigits: 0, maximumFractionDigits: 0 }
    : {};
  const parts = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    ...whole,
  }).formatToParts(amount);
  return parts
    .filter((part) => !(lang === 'vi' && part.type === 'literal' && part.value.trim() === ''))
    .map((part) => (part.type === 'currency' ? part.value.replace('\uffe5', '¥') : part.value))
    .join('');
}

/** What paying yearly saves on twelve months, as the toggle prints it: `−33%`. */
export function yearlySavingLabel(lang: SiteLang): string {
  const { month, year } = maxPrices[lang];
  return `−${Math.round((1 - year / (month * 12)) * 100)}%`;
}
