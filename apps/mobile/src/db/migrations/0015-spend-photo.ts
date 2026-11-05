/**
 * A spend keeps one photo: the receipt it was read from, or a picture of what was bought. The
 * column holds the file's name in the app's photo folder; the photo itself stays a file.
 */
export const sql = `
  ALTER TABLE spends ADD COLUMN photo TEXT;
`;
