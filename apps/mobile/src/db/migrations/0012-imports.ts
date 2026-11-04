/**
 * History brought in from another app's export (Money Lover, MISA, MoMo, any CSV): each line is a
 * spend with source `import` and the bring-in it came with (`import_id`), and `imports` keeps one
 * row per bring-in, so undoing one removes exactly its lines.
 *
 * SQLite cannot change a CHECK in place, so `spends` is built again with the new source, and its
 * sightings with it, as when money in arrived.
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
      CHECK (source IN ('manual', 'voice', 'shared', 'qr', 'email', 'applePay', 'cash', 'alert', 'import')),
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
    saved_to TEXT,
    from_pot TEXT,
    from_pot_amount INTEGER CHECK (from_pot_amount IS NULL OR from_pot_amount >= 0),
    import_id TEXT
  );
  INSERT INTO spends_next (
    id, day, at, amount, category_id, merchant, note, source, status, previous_status, wallet,
    for_work, detail, foreign_amount, created_at, updated_at, currency_guessed, pays_bill, memo,
    direction, money_in, gives_back, saved_to, from_pot, from_pot_amount
  )
    SELECT
      id, day, at, amount, category_id, merchant, note, source, status, previous_status, wallet,
      for_work, detail, foreign_amount, created_at, updated_at, currency_guessed, pays_bill, memo,
      direction, money_in, gives_back, saved_to, from_pot, from_pot_amount
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
  CREATE INDEX spends_import ON spends (import_id);
  CREATE INDEX spend_sightings_capture ON spend_sightings (capture_id);

  CREATE TABLE imports (
    id TEXT PRIMARY KEY NOT NULL,
    app TEXT NOT NULL CHECK (app IN ('moneyLover', 'misa', 'momo', 'other')),
    at TEXT NOT NULL,
    lines INTEGER NOT NULL CHECK (lines >= 0),
    first_day TEXT,
    last_day TEXT,
    answered INTEGER NOT NULL DEFAULT 0 CHECK (answered IN (0, 1)),
    answer_before INTEGER CHECK (answer_before IS NULL OR answer_before >= 0)
  );
`;
