/**
 * Asking to be paid, and the work year. A strip on Who owes me can be a request made without a
 * split: it keeps its code for the transfer note (`code`), the job it is for (`job`), whether it
 * is work (`work`), whether the client is a shop or a company (`company`), when it was asked
 * (`asked_at`) and when the user last sent a reminder (`reminded_at`). A request is a share of no
 * spend, so its `spend_id` is its own id.
 *
 * Money in keeps the day a client's tax certificate came (`certificate_on`), beside the mark
 * 0016 added. A sender is remembered holding back a share of what it pays, as whole percent
 * (`held_back_share`), so its next payment arrives with that held back.
 */
export const sql = `
  ALTER TABLE owed ADD COLUMN code TEXT;
  ALTER TABLE owed ADD COLUMN job TEXT;
  ALTER TABLE owed ADD COLUMN work INTEGER CHECK (work IN (0, 1));
  ALTER TABLE owed ADD COLUMN company INTEGER CHECK (company IN (0, 1));
  ALTER TABLE owed ADD COLUMN asked_at TEXT;
  ALTER TABLE owed ADD COLUMN reminded_at TEXT;
  ALTER TABLE spends ADD COLUMN certificate_on TEXT;
  ALTER TABLE merchant_rules ADD COLUMN held_back_share INTEGER
    CHECK (held_back_share IS NULL OR (held_back_share > 0 AND held_back_share < 100));
`;
