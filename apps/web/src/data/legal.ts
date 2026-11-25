import { legalCopyDe } from './legal-copy-de';
import { legalCopyEn } from './legal-copy-en';
import { legalCopyEs } from './legal-copy-es';
import { legalCopyFr } from './legal-copy-fr';
import { legalCopyId } from './legal-copy-id';
import { legalCopyJa } from './legal-copy-ja';
import { legalCopyKo } from './legal-copy-ko';
import { legalCopyTh } from './legal-copy-th';
import { legalCopyVi } from './legal-copy-vi';
import { legalCopyZhHans } from './legal-copy-zh-hans';
import { langPath, siteLangs, type SiteLang } from './site/langs';

/**
 * The facts the legal pages share: they fill the `{{OWNER}}`, `{{CONTACT_PHONE}}` and
 * `{{CONTACT_TEL}}` tokens in the documents under `src/legal`.
 */
export const OWNER = 'Khanh Bui';
/** As people read it, and as a `tel:` link dials it. */
export const CONTACT_PHONE = '+84 949 840 370';
export const CONTACT_TEL = '+84949840370';

/** The legal pages speak every language the site does. */
export type LegalLang = SiteLang;
export type LegalSlug = 'privacy' | 'terms';

export const legalLangs: readonly LegalLang[] = siteLangs;
export const legalSlugs: readonly LegalSlug[] = ['privacy', 'terms'];

/** English lives at the site root, every other language under its prefix: `/privacy`, `/ja/privacy`. */
export function legalPath(lang: LegalLang, slug: LegalSlug): string {
  return langPath(lang, slug);
}

/** What the legal pages say around the documents, in one language: `legal-copy-<lang>.ts`. */
export interface LegalStrings {
  readonly brandLabel: string;
  readonly updated: string;
  readonly contents: string;
  readonly privacy: string;
  readonly terms: string;
  /** Labels the language menu. */
  readonly language: string;
  readonly rights: string;
  /** The date as the page prints it. */
  readonly formatDate: (iso: string) => string;
}

export const legalStrings: Readonly<Record<LegalLang, LegalStrings>> = {
  en: legalCopyEn,
  vi: legalCopyVi,
  'zh-Hans': legalCopyZhHans,
  ja: legalCopyJa,
  ko: legalCopyKo,
  th: legalCopyTh,
  id: legalCopyId,
  es: legalCopyEs,
  fr: legalCopyFr,
  de: legalCopyDe,
};
