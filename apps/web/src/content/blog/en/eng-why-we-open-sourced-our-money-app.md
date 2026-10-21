---
title: "Why we open-sourced our money app"
description: "6pm is Apache 2.0. What the code shows: SQLCipher on the phone, hashed device tokens, sealed receipt email, ciphertext-only backup, and what does leave."
slug: eng-why-we-open-sourced-our-money-app
lang: en
pubDate: 2026-10-21
tags: [engineering, open source, privacy, sqlcipher, cloudflare workers]
related: [eng-reading-vietqr-on-device, eng-one-camera-qr-and-receipts, eng-widgets-controls-live-activities-expo]
cta: "Read the code on GitHub, then try the public beta."
---

# Why we open-sourced our money app

A privacy policy is a claim; code is evidence. 6pm, an iPhone expense tracker, is open source under Apache 2.0 so anyone can check what it keeps on the phone (an SQLCipher database whose key never leaves the Keychain), what reaches our server (hashes, sealed receipts, ciphertext), and what goes to third parties.

This post is a guided tour of the parts of [github.com/at6pm/6pm](https://github.com/at6pm/6pm) that back the privacy policy, including the parts that are not private. If you only read one section, read "What does leave the phone".

## The argument for opening it

Money apps ask for a lot of trust. Most ask you to trust a policy page. Ours makes specific promises: no bank login, no account for the core app, records encrypted on the phone, a server that cannot read your backup. Those are statements about code. Opening the code turns them into things you can check.

The website says it plainly: "The app, the money maths and the privacy promises are all open source." The repository holds the iPhone app (`apps/mobile`), the API (`apps/api`, Hono on Cloudflare Workers with D1 and R2), the website (`apps/web`), the money rules (`packages/domain`), the looks (`packages/theme`) and the English and Vietnamese copy (`packages/i18n`). The licence file is the Apache License, Version 2.0.

Open source also helps with a duller problem: correctness. The daily number, the pay cycle, the close, the VietQR and receipt parsers all live in `packages/domain`, a pure TypeScript package with unit tests. If our maths is wrong, you can show us the line.

## What stays on the phone

### An encrypted database with a key that never leaves

The app's store is expo-sqlite with SQLCipher turned on in `app.config.ts` (`['expo-sqlite', { useSQLCipher: true }]`). The key is made on first launch:

```ts
// apps/mobile/src/db/database-key.ts
const OPTIONS: SecureStore.SecureStoreOptions = {
  keychainAccessible: SecureStore.AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY,
};

export async function ensureDatabaseKey(databaseName: string): Promise<void> {
  if (await SecureStore.getItemAsync(KEY_NAME, OPTIONS)) return;
  await clearUnreadableDatabase(databaseName);
  const key = Array.from(getRandomBytes(32), (b) => b.toString(16).padStart(2, '0')).join('');
  await SecureStore.setItemAsync(KEY_NAME, key, OPTIONS);
}
```

and applied as the first statement on the connection:

```ts
// apps/mobile/src/db/database.ts
await db.execAsync(`PRAGMA key = "x'${key}'"`);
await db.execAsync('PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;');
```

`THIS_DEVICE_ONLY` has a consequence the code is honest about. An iCloud or Quick Start restore brings the database file to a new phone without its key, so it can never be opened there. When a key has to be made and a database file already exists, the file is moved aside to a dated name rather than deleted, and the user's days come back through 6pm's own encrypted backup. A Keychain read that fails, as opposed to finding nothing, throws, so a locked Keychain never costs anyone their data.

### Extensions never open the database

iOS kills a suspended extension that holds a file lock in a shared container, and SQLite in WAL mode holds one. So the share extension, widgets and App Intents never open the store. Each capture is written as one JSON file into the App Group's `inbox/` folder, which the app imports and deletes. Widgets read files the app writes to `surfaces/`. This is in `docs/tech-decisions.md` under "Extensions and the store".

### The maths runs locally

Ask 6pm ("Can I afford $350 on Saturday?") is the clearest example. The phone computes every number from its own records; a model on the server only turns the question into an intent and an amount, and words the answer. Your balances are never sent.

## What our server sees

### A hashed device token, not an account

The core app has no account. On first contact the phone gets a random token:

```ts
// apps/api/src/device-auth.ts
export async function hashDeviceToken(token: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(token));
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, '0')).join('');
}
/** The database only ever sees this. */
```

D1 stores the hash, the app language and first and last seen times. `last_seen_at` is rewritten at most once an hour, because it exists for rough daily counts. Rate limiting keys on the IP address through Cloudflare's rate-limit binding; the comment, and the policy, say the address is a counter key and is never stored.

### Receipt email: read in memory, sealed until fetched

Each phone gets an address like `k7m2qx@at6pm.app`. Cloudflare Email Routing's catch-all hands mail to the Worker. `apps/api/src/receipt-email/receive.ts` describes the contract:

- Mail to an unknown handle, or over 1 MB, is refused.
- An email that prints no amount is dropped unread and never sent to a model.
- Otherwise it is read in memory, by an Anthropic model when one answers and by rules when it does not. Only what was read (amount, currency, merchant, category, time, sender, memo) is kept. The email itself is never stored or logged.
- Anything that is not a receipt is dropped without a bounce, so a forwarding filter is not disabled by one promo.

What is kept is sealed:

```ts
// apps/api/src/receipt-email/seal.ts (doc comment)
// Receipts wait in D1 sealed with AES-256-GCM. The key is derived with HKDF-SHA-256 from the
// EMAIL_SEAL_KEY Worker secret, with the device's token hash as the context, so a copy of the
// database alone opens nothing and one device's key opens no other device's receipts. The
// capture's id is the associated data: a sealed row cannot be passed off under another id.
```

When the phone has saved its receipts it acknowledges them and the rows are deleted (`DELETE FROM email_captures WHERE device_hash = ? AND id IN (…)`). Anything unfetched for 30 days is deleted unread.

To be precise about the threat model: the Worker holds the secret and reads the email in memory, so this protects against a leaked database, not against the server operator. We say so because it is true.

### Voice: a token, not the audio

```ts
// apps/api/src/routes/voice-token.ts (doc comment)
// Mints a short-lived key to the realtime transcriber for one spend said aloud. The phone then
// streams its microphone to the vendor directly: no audio and no words pass through this server.
```

The server records that a transcription happened, against the device hash, for cost. It never sees the sound or the words.

### Backup: ciphertext under a name only the key can produce

Backup (a 6pm Max feature, off by default) seals a snapshot on the phone with AES-256-GCM using a 32-byte key kept in iCloud Keychain. The server files it under a token derived from that key:

```ts
// apps/mobile/src/features/backup/backup-seal.ts
export async function backupTokenOf(crypto: BackupCrypto, key: Uint8Array): Promise<string> {
  const label = utf8Encode('6pm.backup.token.v1');
  const input = new Uint8Array(label.length + key.length);
  input.set(label);
  input.set(key, label.length);
  return toBase64Url(await crypto.sha256(input));
}
```

The API then stores only the hash of that token as the R2 object key (`backups/<hash>`), and the backup route "checks the envelope's shape and size and nothing else: it cannot open it." No device id is involved, so the server cannot link a backup to a phone. If someone loses both the key and the phone, nobody can open the backup, including us.

One honest caveat from the code itself: the comment on the Keychain store says whether a key written on one iPhone arrives on another "can only be seen on two real devices signed in to one Apple ID". It is the kind of thing open code lets you see, and test.

### Merchant names without numbers

When a shared bank receipt has a payee the phone cannot name, the phone sends the receipt's lines to `/v1/name-merchant` with every number removed. The route turns away a body holding a digit before any model is called, so amounts, account numbers and reference codes cannot reach it even by mistake.

## What does leave the phone

This is the section most privacy pages skip. In plain terms, from `apps/web/src/legal/privacy.en.md`:

- **Anthropic** reads Ask questions (with your category and pot names), the few facts a companion line is about, number-free receipt lines, a receipt photo the phone could not read with confidence, forwarded receipt emails, and category names for icon suggestions. The policy states Anthropic does not train on them and deletes them within 30 days, with stated exceptions. We keep token counts in a cost ledger, not the content.
- **Deepgram or ElevenLabs** hears your voice while you hold the microphone. Free users get 10 cloud transcriptions a day; after that, offline, or in on-device mode, Apple's on-device speech is used and nothing is sent.
- **RevenueCat** knows what you bought, under an anonymous app user ID, plus the device details purchase SDKs usually receive, including IP address.
- **Sentry** gets crash reports with `sendDefaultPii: false` and no money, names or notes attached. In on-device mode the reporter is closed, including the native one, so a crash is not sent at the next launch.
- **Cloudflare** runs the site and API and may keep ordinary request logs.
- **Expo** answers update checks, which carry the app version, platform and IP address.
- **Apple** handles payments, iCloud Keychain and Sign in with Apple, which is used only for Budget together (shared pots for two).

### On-device mode

Settings → AI can keep 6pm's AI on the iPhone: questions are read, companion lines written and receipts read with a model downloaded once from Hugging Face. In that mode receipt email is off (it needs the server), crash reports are off, and voice uses Apple's on-device recogniser.

## What open source does not prove

It proves what the code in the repository does. It does not, by itself, prove that the binary in the App Store was built from that commit, or what a vendor does once data reaches it. We would rather say that than overstate it. What it does give you is the ability to read every route the app calls, every field the server stores, and every place a model is involved, and to hold us to the policy line by line.

## FAQ

### What licence is 6pm under?

Apache License 2.0, as in the `LICENSE` file at the root of the repository.

### Can 6pm read my spending?

The records live in an SQLCipher database on your iPhone, with a key made on the phone and kept in its Keychain. We never receive the key or the database. We never store your transactions; they live on your iPhone, encrypted. No bank login.

### Does open source mean I can self-host the API?

The API is in the repo (Hono on Cloudflare Workers, D1, R2) and server secrets are listed by name in `.env.example`. The shipping app talks to at6pm.app.

### Can I contribute?

Read `CLAUDE.md` first; it is the working contract for anyone, human or agent, changing the code. Questions and bug reports go to hello@at6pm.app.

## Try it

Read the code at [github.com/at6pm/6pm](https://github.com/at6pm/6pm). The iPhone app is in public beta on TestFlight: [testflight.apple.com/join/a8UrvT5P](https://testflight.apple.com/join/a8UrvT5P), and arrives on the App Store on Friday 6 November 2026 at 18:00 ICT (6:00 a.m. Eastern). More at [at6pm.app](https://at6pm.app).
