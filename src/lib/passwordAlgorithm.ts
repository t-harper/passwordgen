export interface PasswordOptions {
  length: number;
  includeNumbers: boolean;
  includeLowercase: boolean;
  includeUppercase: boolean;
  beginWithLetter: boolean;
  excludeSimilar: boolean;
  noDuplicates: boolean;
  removeSequential: boolean;
  customSymbols: string;
}

const similarChars = '0O1lI|`';
const sequentialChars = ['abc', 'bcd', 'cde', 'def', 'efg', 'fgh', 'ghi', 'hij', 'ijk', 'jkl', 'klm', 'lmn', 'mno', 'nop', 'opq', 'pqr', 'qrs', 'rst', 'stu', 'tuv', 'uvw', 'vwx', 'wxy', 'xyz', '123', '234', '345', '456', '567', '678', '789'];

export function generatePassword(options: PasswordOptions): string {
  // Ensure length is within valid range
  const validLength = Math.max(10, Math.min(100, options.length));

  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const numbers = '0123456789';
  const symbols = options.customSymbols;

  let charset = '';

  if (symbols) charset += symbols;
  if (options.includeLowercase) charset += lowercase;
  if (options.includeUppercase) charset += uppercase;
  if (options.includeNumbers) charset += numbers;

  if (options.excludeSimilar) {
    charset = charset.split('').filter(char => !similarChars.includes(char)).join('');
  }

  // Remove duplicates from charset to get unique characters
  const uniqueChars = Array.from(new Set(charset.split('')));
  const uniqueCharset = uniqueChars.join('');

  // If noDuplicates is enabled and password length exceeds available unique characters,
  // cap the password length to the number of unique characters available
  const maxPossibleLength = options.noDuplicates ? uniqueChars.length : validLength;
  const effectiveLength = Math.min(validLength, maxPossibleLength);

  let password = '';
  const usedChars = new Set<string>();

  if (options.beginWithLetter && (options.includeLowercase || options.includeUppercase)) {
    let letterCharset = '';
    if (options.includeLowercase) letterCharset += lowercase;
    if (options.includeUppercase) letterCharset += uppercase;

    if (options.excludeSimilar) {
      letterCharset = letterCharset.split('').filter(char => !similarChars.includes(char)).join('');
    }

    if (letterCharset) {
      const randomArray = new Uint32Array(1);
      crypto.getRandomValues(randomArray);
      const randomIndex = randomArray[0] % letterCharset.length;
      const firstChar = letterCharset[randomIndex];
      password += firstChar;
      if (options.noDuplicates) usedChars.add(firstChar);
    }
  }

  // Add safety counter to prevent infinite loops
  let attempts = 0;
  const maxAttempts = effectiveLength * 50; // Allow reasonable number of attempts for sequential checking

  while (password.length < effectiveLength && attempts < maxAttempts) {
    attempts++;

    let availableChars = uniqueCharset;

    if (options.noDuplicates) {
      availableChars = uniqueCharset.split('').filter(char => !usedChars.has(char)).join('');
      if (!availableChars) break; // No more unique characters available
    }

    const randomArray = new Uint32Array(1);
    crypto.getRandomValues(randomArray);
    const randomIndex = randomArray[0] % availableChars.length;
    const randomChar = availableChars[randomIndex];

    if (options.removeSequential && password.length >= 2) {
      const lastThree = password.slice(-2) + randomChar;
      const isSequential = sequentialChars.some(seq =>
        lastThree.toLowerCase() === seq ||
        lastThree.toLowerCase() === seq.split('').reverse().join('')
      );

      if (isSequential) continue;
    }

    password += randomChar;
    if (options.noDuplicates) usedChars.add(randomChar);
  }

  return password;
}
