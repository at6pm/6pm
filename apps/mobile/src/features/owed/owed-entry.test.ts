import { describe, expect, it } from '@jest/globals';

import { owedEntryOf } from './owed-entry';

describe('the way into Who owes me', () => {
  it('stays for someone with work money while nobody owes anything', () => {
    expect(owedEntryOf(0, true)).toBe('ask');
  });

  it('shows the people whenever someone owes something', () => {
    expect(owedEntryOf(2, true)).toBe('people');
    expect(owedEntryOf(1, false)).toBe('people');
  });

  it('is not there for a monthly salary with nobody owing', () => {
    expect(owedEntryOf(0, false)).toBeNull();
  });
});
