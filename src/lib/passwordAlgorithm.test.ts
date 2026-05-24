import { describe, it, expect } from 'vitest';
import { generatePassword, PasswordOptions } from './passwordAlgorithm';

const defaultOptions: PasswordOptions = {
  length: 25,
  includeNumbers: true,
  includeLowercase: true,
  includeUppercase: true,
  beginWithLetter: true,
  excludeSimilar: true,
  noDuplicates: true,
  removeSequential: true,
  customSymbols: '!@#$%^&*()_+-=[]{}|;:,.<>?',
};

const make = (overrides: Partial<PasswordOptions> = {}): PasswordOptions => ({
  ...defaultOptions,
  ...overrides,
});

describe('generatePassword', () => {
  it('generates a password of the requested length when all char classes are enabled', () => {
    const password = generatePassword(
      make({
        length: 30,
        noDuplicates: false,
        removeSequential: false,
      })
    );
    expect(password).toHaveLength(30);
  });

  it('respects noDuplicates — generated password has all unique characters', () => {
    const password = generatePassword(
      make({
        length: 20,
        noDuplicates: true,
        removeSequential: false,
      })
    );
    const unique = new Set(password.split(''));
    expect(unique.size).toBe(password.length);
  });

  it('respects noDuplicates cap — if length > unique-char-pool, output length equals pool size', () => {
    // Only lowercase, exclude similar (removes 'l') => 25 unique chars available
    const password = generatePassword(
      make({
        length: 100,
        includeNumbers: false,
        includeLowercase: true,
        includeUppercase: false,
        beginWithLetter: false,
        excludeSimilar: true,
        noDuplicates: true,
        removeSequential: false,
        customSymbols: '',
      })
    );
    // Available pool: a-z minus 'l' = 25 chars
    expect(password).toHaveLength(25);
    expect(new Set(password.split('')).size).toBe(25);
  });

  it("respects beginWithLetter — first char is in [a-zA-Z] (and not in '0O1lI|' when excludeSimilar is true)", () => {
    for (let i = 0; i < 50; i++) {
      const password = generatePassword(
        make({
          beginWithLetter: true,
          excludeSimilar: true,
        })
      );
      expect(password[0]).toMatch(/[a-zA-Z]/);
      expect('0O1lI|`').not.toContain(password[0]);
    }
  });

  it('respects removeSequential — output contains no abc/123 substrings (case-insensitive)', () => {
    const forbidden = ['abc', 'bcd', 'cde', 'def', 'efg', 'fgh', 'ghi', 'hij', 'ijk', 'jkl', 'klm', 'lmn', 'mno', 'nop', 'opq', 'pqr', 'qrs', 'rst', 'stu', 'tuv', 'uvw', 'vwx', 'wxy', 'xyz', '123', '234', '345', '456', '567', '678', '789'];
    const reversed = forbidden.map(seq => seq.split('').reverse().join(''));
    const all = [...forbidden, ...reversed];

    for (let i = 0; i < 20; i++) {
      const password = generatePassword(
        make({
          length: 50,
          noDuplicates: false,
          removeSequential: true,
        })
      );
      const lower = password.toLowerCase();
      for (const seq of all) {
        expect(lower).not.toContain(seq);
      }
    }
  });
});
