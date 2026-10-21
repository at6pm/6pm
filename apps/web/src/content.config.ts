import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

/**
 * The articles under `src/content/blog/<lang>/<slug>.md`. A title or description past what search
 * results show fails the build, so it is fixed before anyone sees it cut off.
 */
const blog = defineCollection({
  loader: glob({
    pattern: '{en,vi}/*.md',
    base: './src/content/blog',
    generateId: ({ data }) => `${String(data['lang'])}/${String(data['slug'])}`,
  }),
  schema: z.object({
    title: z.string().max(60),
    description: z.string().min(70).max(160),
    slug: z.string().regex(/^[a-z0-9-]+$/),
    lang: z.enum(['en', 'vi']),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    tags: z.array(z.string()).min(1),
    /** The translation first (when there is one), then same-language siblings, by slug. */
    related: z.array(z.string()).min(1),
    cta: z.string(),
    /** Listed first on the blog: the guides to start from. */
    featured: z.boolean().default(false),
    draft: z.boolean().default(false),
  }),
});

export const collections = { blog };
