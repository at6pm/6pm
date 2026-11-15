import type { KeypadKey } from '@6pm/domain';

/**
 * Quick add's keypad above its last row (mic · 0 · Keep it): 1–9, delete, "k" and "000" where
 * they always were. A decimal key (an amount with cents) or the currency key (abroad) has no cell
 * of its own there, so it takes the "000" cell, which types what "k" types; with both, the
 * currency key takes "k".
 */
export function quickKeyRows(extra: {
  readonly decimal: boolean;
  readonly currency: boolean;
}): readonly (readonly KeypadKey[])[] {
  const both = extra.decimal && extra.currency;
  const thousand: KeypadKey = both ? 'currency' : 'k';
  const last: KeypadKey = extra.decimal ? '.' : extra.currency ? 'currency' : '000';
  return [
    ['1', '2', '3', 'back'],
    ['4', '5', '6', thousand],
    ['7', '8', '9', last],
  ];
}
