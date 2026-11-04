import type { Href } from 'expo-router';

/** The jar screens. Cast because the generated route types only list a route once built. */
export const potRoute = (id: string) => `/pot/${id}` as Href;
export const potsRoute = '/pots' as Href;
export const newJarRoute = '/new-pot' as Href;
export const editJarRoute = (id: string) => `/new-pot?edit=${id}` as Href;
