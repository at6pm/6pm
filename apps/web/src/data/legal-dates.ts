/** A front matter date, `YYYY-MM-DD`, as year, month and day. */
export function dateParts(iso: string): readonly [number, number, number] {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (match === null) throw new Error(`A legal page date must be YYYY-MM-DD, not "${iso}"`);
  return [Number(match[1]), Number(match[2]), Number(match[3])];
}
