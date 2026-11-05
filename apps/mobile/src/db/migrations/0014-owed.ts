/**
 * Who owes the user what: each share of a split spend that is someone else's, with the person, the
 * amount and the spend. Only the user's share stays the spend; a line is open until money in, cash
 * or the user covering it settles it.
 */
export const sql = `
  CREATE TABLE owed (
    id TEXT PRIMARY KEY NOT NULL,
    spend_id TEXT NOT NULL,
    name TEXT,
    amount INTEGER NOT NULL CHECK (amount > 0),
    day TEXT NOT NULL,
    sort INTEGER NOT NULL DEFAULT 0 CHECK (sort >= 0),
    created_at TEXT NOT NULL,
    settled_at TEXT,
    settled_by TEXT CHECK (settled_by IN ('payback', 'cash', 'covered')),
    settled_spend_id TEXT,
    remind_at TEXT,
    updated_at TEXT NOT NULL
  );
  CREATE INDEX owed_spend ON owed (spend_id);
  CREATE INDEX owed_open ON owed (settled_at);
`;
