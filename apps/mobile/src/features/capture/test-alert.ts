/**
 * The test alert a person sends to themselves, as the screen that sent it sees it. 6pm posts a
 * notification marked as a test; it comes in on the road a bank alert takes (Android's listener,
 * or on the iPhone the Shortcuts automation, which has 6pm among its apps) and the app's import
 * tells of its arrival here. Nothing in this file is money: a test alert is never a spend, and a
 * real catch is waited for exactly as before.
 */

/** With nothing arrived this long after sending, the screen says what to check. */
export const TEST_ALERT_WAIT_MS = 10_000;
/** How often the inbox is brought in while a test alert is on its way. */
export const TEST_ALERT_LOOK_MS = 600;

export type TestAlertState =
  /** Not sent yet. */
  | { readonly kind: 'idle' }
  /** Posted, and on its way through the listener. */
  | { readonly kind: 'sent'; readonly token: string }
  /** It came all the way in: the road works. `at` is when the phone read it. */
  | { readonly kind: 'arrived'; readonly at: string }
  /**
   * Posted, and nothing came in time: Android's Notification access is the thing to check, or on
   * the iPhone the automation (it may be off, or 6pm may not be among its apps).
   */
  | { readonly kind: 'missing'; readonly token: string }
  /**
   * 6pm may not post notifications, so no test went out. `canAsk` while the phone will still
   * show its own question; after that only the phone's settings can change it.
   */
  | { readonly kind: 'blocked'; readonly canAsk: boolean };

export type TestAlertEvent =
  | { readonly type: 'sent'; readonly token: string }
  | { readonly type: 'blocked'; readonly canAsk: boolean }
  /** 6pm may post notifications again: nothing stands in the way of sending one. */
  | { readonly type: 'allowed' }
  | { readonly type: 'arrived'; readonly token: string; readonly at: string }
  | { readonly type: 'timedOut'; readonly token: string };

export const TEST_ALERT_IDLE: TestAlertState = { kind: 'idle' };

/**
 * Where a test alert stands after something happened. Only the alert the screen is waiting for
 * counts: one sent earlier that turns up now, or runs out of time now, changes nothing. One that
 * arrives after the screen gave up on it is still shown as arrived, since it did.
 */
export function testAlertStep(state: TestAlertState, event: TestAlertEvent): TestAlertState {
  switch (event.type) {
    case 'sent':
      return { kind: 'sent', token: event.token };
    case 'blocked':
      return state.kind === 'sent' ? state : { kind: 'blocked', canAsk: event.canAsk };
    case 'allowed':
      return state.kind === 'blocked' ? TEST_ALERT_IDLE : state;
    case 'arrived':
      return (state.kind === 'sent' || state.kind === 'missing') && state.token === event.token
        ? { kind: 'arrived', at: event.at }
        : state;
    case 'timedOut':
      return state.kind === 'sent' && state.token === event.token
        ? { kind: 'missing', token: state.token }
        : state;
  }
}

/** The test alerts the import has seen arrive since the app opened, by token. */
const arrivals = new Map<string, string>();
const watchers = new Set<() => void>();
/** Tokens remembered at most: a screen only ever waits for its newest. */
const KEPT = 16;

/** The import saw a test alert come in: whoever sent it is told. */
export function noteTestAlertArrived(token: string, at: string): void {
  arrivals.set(token, at);
  for (const old of [...arrivals.keys()].slice(0, Math.max(0, arrivals.size - KEPT))) {
    arrivals.delete(old);
  }
  for (const tell of [...watchers]) tell();
}

/** When the test alert with this token arrived, or null while it has not. */
export function testAlertArrivedAt(token: string): string | null {
  return arrivals.get(token) ?? null;
}

/** Calls back each time a test alert arrives; returns the unsubscribe. */
export function watchTestAlerts(onArrive: () => void): () => void {
  watchers.add(onArrive);
  return () => {
    watchers.delete(onArrive);
  };
}
