/**
 * Everything saved is a jar. A jar with no date keeps what it puts in each payday (`monthly`), and
 * a spend taken from a jar keeps the jar (`from_pot`) and the part the jar covered
 * (`from_pot_amount`); the rest counted today. Future you's jar is made at start-up, once.
 */
export const sql = `
  ALTER TABLE pots ADD COLUMN monthly INTEGER CHECK (monthly IS NULL OR monthly >= 0);
  ALTER TABLE spends ADD COLUMN from_pot TEXT;
  ALTER TABLE spends ADD COLUMN from_pot_amount INTEGER
    CHECK (from_pot_amount IS NULL OR from_pot_amount >= 0);
`;
