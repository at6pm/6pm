/**
 * Money that came in sits beside spending: a row's `direction` is `in` for it (null is spending, as
 * on every row from before), and `money_in` says what the user made of it at the close (spread over
 * the days, saved, their pay, a refund, a friend paying back). `gives_back` is the spend a refund or
 * payback answers, `saved_to` the pot money was saved in. Bank alerts read from notifications are a
 * capture source of their own.
 *
 * SQLite cannot change a CHECK in place, so `spends` is built again with the new source, and its
 * sightings with it: dropping `spends` while sightings point at it would cascade their rows away.
 * The new sightings point at the new table, and renaming it carries that reference along.
 */
export const sql = `
  CREATE TABLE spends_next (
    id TEXT PRIMARY KEY NOT NULL,
    day TEXT NOT NULL,
    at TEXT NOT NULL,
    amount INTEGER NOT NULL CHECK (amount >= 0),
    category_id TEXT NOT NULL REFERENCES categories (id),
    merchant TEXT NOT NULL,
    note TEXT,
    source TEXT NOT NULL
      CHECK (source IN ('manual', 'voice', 'shared', 'qr', 'email', 'applePay', 'cash', 'alert')),
    status TEXT NOT NULL CHECK (status IN ('caught', 'pending', 'kept', 'skipped', 'deleted')),
    previous_status TEXT,
    wallet TEXT,
    for_work INTEGER NOT NULL DEFAULT 0 CHECK (for_work IN (0, 1)),
    detail TEXT,
    foreign_amount TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    currency_guessed INTEGER NOT NULL DEFAULT 0 CHECK (currency_guessed IN (0, 1)),
    pays_bill TEXT,
    memo TEXT,
    direction TEXT CHECK (direction IN ('out', 'in')),
    money_in TEXT CHECK (money_in IN ('spread', 'saved', 'pay', 'refund', 'payback')),
    gives_back TEXT,
    saved_to TEXT
  );
  INSERT INTO spends_next (
    id, day, at, amount, category_id, merchant, note, source, status, previous_status, wallet,
    for_work, detail, foreign_amount, created_at, updated_at, currency_guessed, pays_bill, memo
  )
    SELECT
      id, day, at, amount, category_id, merchant, note, source, status, previous_status, wallet,
      for_work, detail, foreign_amount, created_at, updated_at, currency_guessed, pays_bill, memo
    FROM spends;

  CREATE TABLE spend_sightings_next (
    spend_id TEXT NOT NULL REFERENCES spends_next (id) ON DELETE CASCADE,
    source TEXT NOT NULL,
    seen_at TEXT NOT NULL,
    detail TEXT,
    capture_id TEXT,
    PRIMARY KEY (spend_id, source, seen_at)
  );
  INSERT INTO spend_sightings_next (spend_id, source, seen_at, detail, capture_id)
    SELECT spend_id, source, seen_at, detail, capture_id FROM spend_sightings;

  DROP TABLE spend_sightings;
  DROP TABLE spends;
  ALTER TABLE spends_next RENAME TO spends;
  ALTER TABLE spend_sightings_next RENAME TO spend_sightings;
  CREATE INDEX spends_day ON spends (day);
  CREATE INDEX spends_status ON spends (status);
  CREATE INDEX spend_sightings_capture ON spend_sightings (capture_id);
`;
