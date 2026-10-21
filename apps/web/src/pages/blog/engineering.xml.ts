import type { APIRoute } from 'astro';

import { feed } from '../../data/feeds';

/** The engineering series alone, for sites that import a feed and keep this site as the canonical. */
export const GET: APIRoute = () => feed('en', 'engineering');
