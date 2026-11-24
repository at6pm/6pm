import { maxCodeFromRoute } from '@6pm/domain';

import { requestHomeTab } from '../features/home/home-tab-request';
import { isHomeTab } from '../features/home/home-tabs';
import { stripAppPrefix } from '../features/links/strip-app-prefix';

/**
 * Maps a link that opened the app onto one of its routes, before the router sees it. A file
 * opened in 6pm from another app (a CSV or Excel export) goes to "Bring your history". A link to
 * a Home tab (a widget's `/app?tab=diary`) also asks Home, if it is already open, to turn to it:
 * the same link twice would otherwise change nothing the router sees. A Max code link
 * (`/app/r/<channel>?code=<code>`, which the site hands an Android phone with 6pm) opens the Max
 * sheet with its channel and code.
 */
export function redirectSystemPath({ path }: { path: string; initial: boolean }): string {
  if (/^file:\/\//i.test(path)) return `/import?uri=${encodeURIComponent(path)}`;
  const route = stripAppPrefix(path);
  const code = maxCodeFromRoute(route);
  if (code) {
    return code.code === null
      ? `/max?via=${code.channel}`
      : `/max?via=${code.channel}&code=${code.code}`;
  }
  const tab = /[?&]tab=([a-z]+)/.exec(route)?.[1];
  if (isHomeTab(tab)) requestHomeTab(tab);
  return route;
}
