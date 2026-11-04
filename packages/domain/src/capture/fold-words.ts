/** Lower case, accents and đ taken off, everything but letters and digits as single spaces. */
export function foldWords(text: string): string {
  const bare = text
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .replace(/[đĐ]/g, 'd')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
  return bare === '' ? ' ' : ` ${bare} `;
}
