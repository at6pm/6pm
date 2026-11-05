/**
 * The Lunar New Year season: a jar can be the season's (`season`, 'newYear' for the Tết jar),
 * which never counts against the free jars, and a lì xì keeps how many envelopes it held.
 */
export const sql = `
  ALTER TABLE pots ADD COLUMN season TEXT CHECK (season IS NULL OR season = 'newYear');
  ALTER TABLE spends ADD COLUMN envelopes INTEGER CHECK (envelopes IS NULL OR envelopes > 0);
`;
