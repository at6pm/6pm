import { stripAppPrefix } from '../features/links/strip-app-prefix';

/**
 * Maps a link that opened the app onto one of its routes, before the router sees it. A file
 * opened in 6pm from another app (a CSV or Excel export) goes to "Bring your history".
 */
export function redirectSystemPath({ path }: { path: string; initial: boolean }): string {
  if (/^file:\/\//i.test(path)) return `/import?uri=${encodeURIComponent(path)}`;
  return stripAppPrefix(path);
}
