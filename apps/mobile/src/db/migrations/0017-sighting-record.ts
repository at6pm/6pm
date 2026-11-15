/**
 * A sighting keeps what its witness said, not only its source and time: who spoke (`witness_kind`,
 * `witness_name`), the way it came (`channel`), what it says happened (`what`), the amount in the
 * currency it was given in, which way the money went, what its time is (`at_kind`; `seen_at` stays
 * the time), the bank's own code for the payment (`reference`), the account (`account_tail`,
 * `bank`), the payee and memo as printed, and a fingerprint of its words. A sighting written before
 * these were kept has them empty.
 */
export const sql = `
  ALTER TABLE spend_sightings ADD COLUMN channel TEXT;
  ALTER TABLE spend_sightings ADD COLUMN witness_kind TEXT;
  ALTER TABLE spend_sightings ADD COLUMN witness_name TEXT;
  ALTER TABLE spend_sightings ADD COLUMN what TEXT;
  ALTER TABLE spend_sightings ADD COLUMN amount INTEGER;
  ALTER TABLE spend_sightings ADD COLUMN currency TEXT;
  ALTER TABLE spend_sightings ADD COLUMN direction TEXT;
  ALTER TABLE spend_sightings ADD COLUMN at_kind TEXT;
  ALTER TABLE spend_sightings ADD COLUMN reference TEXT;
  ALTER TABLE spend_sightings ADD COLUMN account_tail TEXT;
  ALTER TABLE spend_sightings ADD COLUMN bank TEXT;
  ALTER TABLE spend_sightings ADD COLUMN payee TEXT;
  ALTER TABLE spend_sightings ADD COLUMN memo TEXT;
  ALTER TABLE spend_sightings ADD COLUMN words TEXT;
`;
