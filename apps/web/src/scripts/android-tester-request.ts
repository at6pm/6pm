import type { AndroidTesterRequest } from '@6pm/domain';

export type TesterOutcome =
  | { readonly kind: 'listed' }
  /** The list turned the email down. */
  | { readonly kind: 'invalid' }
  /** Too many tries from this address for now. */
  | { readonly kind: 'busy' }
  /** Offline, timed out, or the list is down: worth trying again. */
  | { readonly kind: 'unreachable' };

const timeoutMs = 10_000;

/** Puts a Google account on the Android test's tester list, on this site's own `/api`. Never throws. */
export async function joinAndroidTest(body: AndroidTesterRequest): Promise<TesterOutcome> {
  let response: Response;
  try {
    response = await fetch('/api/v1/android-testers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(timeoutMs),
    });
  } catch {
    return { kind: 'unreachable' };
  }
  if (response.status === 400) return { kind: 'invalid' };
  if (response.status === 429) return { kind: 'busy' };
  if (!response.ok) return { kind: 'unreachable' };
  try {
    const data: unknown = await response.json();
    if ((data as { listed?: unknown } | null)?.listed === true) return { kind: 'listed' };
  } catch {
    // Not the list's answer; treat it as unreachable.
  }
  return { kind: 'unreachable' };
}
