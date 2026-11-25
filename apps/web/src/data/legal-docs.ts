import type { MarkdownInstance } from 'astro';

import type { LegalLang, LegalSlug } from './legal';

const docs = import.meta.glob<MarkdownInstance<Record<string, unknown>>>('../legal/*.md', {
  eager: true,
});

/** A legal document in one language: `src/legal/<slug>.<lang>.md`. */
export function legalDoc(
  slug: LegalSlug,
  lang: LegalLang,
): MarkdownInstance<Record<string, unknown>> {
  const doc = docs[`../legal/${slug}.${lang}.md`];
  if (doc === undefined) throw new Error(`src/legal/${slug}.${lang}.md is missing`);
  return doc;
}
