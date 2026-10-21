import type { APIRoute } from 'astro';

import { feed } from '../../../data/feeds';

export const GET: APIRoute = () => feed('vi');
