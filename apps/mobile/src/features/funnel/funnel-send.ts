import {
  FUNNEL_LANGUAGES,
  FUNNEL_PLATFORMS,
  type FunnelEvent,
  type FunnelReport,
} from '@6pm/domain';

import type { FunnelSendResult } from './funnel-counts';

const TIMEOUT_MS = 10_000;

export interface FunnelSendOptions {
  /** `https://<host>/api`; null when the build has no server, so nothing is sent. */
  readonly baseUrl: string | null;
  readonly fetch: typeof fetch;
  readonly platform: string;
  /** The store version, "2.2.2". */
  readonly version: string | null;
  readonly language: () => string;
}

function oneOf<T extends string>(list: readonly T[], value: string | null): T | null {
  return list.find((item) => item === value) ?? null;
}

/**
 * Sends one report to `POST /v1/funnel`: the steps, the platform, the version and the language,
 * and nothing else. No device token or other header that could name the phone goes with it,
 * not even the clock's offset the device routes carry. A refusal (the server does not take this
 * shape) is never retried; no answer, a limit or a server fault is tried again later.
 */
export function createFunnelSend(options: FunnelSendOptions) {
  return async (events: readonly FunnelEvent[]): Promise<FunnelSendResult> => {
    const platform = oneOf(FUNNEL_PLATFORMS, options.platform);
    const language = oneOf(FUNNEL_LANGUAGES, options.language());
    if (options.baseUrl === null || platform === null || language === null) return 'refused';
    if (options.version === null) return 'refused';
    const report: FunnelReport = {
      platform,
      version: options.version,
      language,
      events: [...events],
    };
    const abort = new AbortController();
    const timer = setTimeout(() => abort.abort(), TIMEOUT_MS);
    try {
      const response = await options.fetch(`${options.baseUrl}/v1/funnel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(report),
        signal: abort.signal,
      });
      if (response.ok) return 'counted';
      return response.status === 400 ? 'refused' : 'later';
    } catch {
      return 'later';
    } finally {
      clearTimeout(timer);
    }
  };
}
