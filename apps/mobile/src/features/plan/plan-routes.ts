import type { Href } from 'expo-router';

/** The Plan tab's sheets. Cast because the generated route types only list a route once built. */
export const planRoutes = {
  month: '/month' as Href,
  /** "How money reaches you", on the plan's own answers. */
  reach: '/reach?from=plan' as Href,
  sincePayday: '/since-payday' as Href,
  lastUntil: '/last-until' as Href,
  newGoal: '/new-pot?kind=goal' as Href,
  newBill: '/bill/new' as Href,
  bill: (id: string) => `/bill/${id}` as Href,
  pot: (id: string) => `/pot/${id}` as Href,
};
