import { sign } from 'node:crypto';
import { readFileSync } from 'node:fs';

/**
 * Sets a TestFlight build's "What to Test" through the App Store Connect API, once Apple has the
 * build. EAS sends the note only on its Enterprise plan, so the submit leaves it to this.
 *
 *   node tools/scripts/testflight-notes.ts <version> <build number>
 *
 * Env: ASC_KEY_PATH (the .p8 file), EXPO_ASC_KEY_ID, EXPO_ASC_ISSUER_ID, ASC_APP_ID, WHAT_TO_TEST.
 * The build can take a while to appear after the upload, so it is looked for every 30 s for up to
 * 30 minutes. Every locale the build's test information has gets the note; with none, en-US does.
 */

const API = 'https://api.appstoreconnect.apple.com/v1';
const POLL_MS = 30_000;
const WAIT_MS = 30 * 60_000;
/** App Store Connect's limit for "What to Test". */
const MAX_LENGTH = 4000;

function need(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is missing`);
  return value;
}

const base64url = (data: string | Buffer) => Buffer.from(data).toString('base64url');

/** A 20-minute ES256 token for the App Store Connect API. */
function token(keyPath: string, keyId: string, issuer: string): string {
  const now = Math.floor(Date.now() / 1000);
  const head = base64url(JSON.stringify({ alg: 'ES256', kid: keyId, typ: 'JWT' }));
  const body = base64url(
    JSON.stringify({ iss: issuer, iat: now, exp: now + 1200, aud: 'appstoreconnect-v1' }),
  );
  const signature = sign('sha256', Buffer.from(`${head}.${body}`), {
    key: readFileSync(keyPath, 'utf8'),
    dsaEncoding: 'ieee-p1363',
  });
  return `${head}.${body}.${base64url(signature)}`;
}

interface Resource {
  readonly id: string;
  readonly attributes?: Record<string, unknown>;
}

async function call(
  bearer: string,
  method: string,
  path: string,
  body?: unknown,
): Promise<Resource[]> {
  const response = await fetch(`${API}${path}`, {
    method,
    headers: { Authorization: `Bearer ${bearer}`, 'Content-Type': 'application/json' },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
  if (!response.ok) {
    throw new Error(`${method} ${path}: ${response.status} ${await response.text()}`);
  }
  const json = (await response.json()) as { data?: Resource | Resource[] };
  if (json.data === undefined) return [];
  return Array.isArray(json.data) ? json.data : [json.data];
}

async function findBuild(
  bearer: () => string,
  app: string,
  version: string,
  build: string,
): Promise<string> {
  const query = new URLSearchParams({
    'filter[app]': app,
    'filter[version]': build,
    'filter[preReleaseVersion.version]': version,
    limit: '1',
  });
  const until = Date.now() + WAIT_MS;
  for (;;) {
    const [found] = await call(bearer(), 'GET', `/builds?${query.toString()}`);
    if (found) return found.id;
    if (Date.now() > until) throw new Error(`build ${version} (${build}) never appeared`);
    await new Promise((resolve) => setTimeout(resolve, POLL_MS));
  }
}

async function main(): Promise<void> {
  const [version, build] = process.argv.slice(2);
  if (!version || !build) throw new Error('usage: testflight-notes.ts <version> <build number>');
  const whatsNew = need('WHAT_TO_TEST').trim().slice(0, MAX_LENGTH);
  const keyPath = need('ASC_KEY_PATH');
  const keyId = need('EXPO_ASC_KEY_ID');
  const issuer = need('EXPO_ASC_ISSUER_ID');
  const app = need('ASC_APP_ID');
  // A fresh token for each call: the wait can outlast one.
  const bearer = () => token(keyPath, keyId, issuer);

  const id = await findBuild(bearer, app, version, build);
  const locales = await call(bearer(), 'GET', `/builds/${id}/betaBuildLocalizations`);
  if (locales.length === 0) {
    await call(bearer(), 'POST', '/betaBuildLocalizations', {
      data: {
        type: 'betaBuildLocalizations',
        attributes: { locale: 'en-US', whatsNew },
        relationships: { build: { data: { type: 'builds', id } } },
      },
    });
  }
  for (const locale of locales) {
    await call(bearer(), 'PATCH', `/betaBuildLocalizations/${locale.id}`, {
      data: { type: 'betaBuildLocalizations', id: locale.id, attributes: { whatsNew } },
    });
  }
  const where = locales
    .map((l) => {
      const locale = l.attributes?.['locale'];
      return typeof locale === 'string' ? locale : l.id;
    })
    .join(', ');
  console.log(`"What to Test" set on ${version} (${build}) for ${where || 'en-US'}.`);
}

await main();
