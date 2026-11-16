/**
 * Money for every kind of earner. A spend that is money in can name the income it was
 * (`income_id`), what a client held back from it (`held_back`), and whether the certificate for
 * that came (`certificate`). A merchant rule remembers, per sender and per shop, the work mark
 * (`work`), what money in from it was (`money_in`), the jar it was saved to (`saved_to`) and the
 * income it was (`income_id`).
 *
 * Columns only: a new `money_in` value would need the table built again (see 0010), so the buffer
 * is `saved` with the buffer jar as `saved_to`.
 */
export const sql = `
  ALTER TABLE spends ADD COLUMN income_id TEXT;
  ALTER TABLE spends ADD COLUMN held_back INTEGER CHECK (held_back IS NULL OR held_back >= 0);
  ALTER TABLE spends ADD COLUMN certificate INTEGER CHECK (certificate IN (0, 1));
  ALTER TABLE merchant_rules ADD COLUMN work INTEGER CHECK (work IN (0, 1));
  ALTER TABLE merchant_rules ADD COLUMN money_in TEXT;
  ALTER TABLE merchant_rules ADD COLUMN saved_to TEXT;
  ALTER TABLE merchant_rules ADD COLUMN income_id TEXT;
`;
