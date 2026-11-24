import { SURFACES_VERSION } from '../contracts/surfaces';
import { TEST_ALERT_TOKEN_MAX, type TestAlertResult } from '../contracts/test-alert';

/**
 * Reading a test alert 6pm sent to itself, on the same road a bank alert takes: Android's listener
 * hands it to this bundle, and what comes back is left in the inbox for the app. It becomes an
 * item of its own kind (`test`) that carries only the token the app posted it with: no amount is
 * read from its words, so there is nothing in it to save, count or read a second time. A token
 * that is empty or too long leaves nothing.
 */
export function buildTestAlert(token: string, now: Date, id: string): TestAlertResult {
  const kept = token.trim();
  if (kept === '' || kept.length > TEST_ALERT_TOKEN_MAX) return { item: null };
  return {
    item: { v: SURFACES_VERSION, id, kind: 'test', at: now.toISOString(), token: kept },
  };
}
