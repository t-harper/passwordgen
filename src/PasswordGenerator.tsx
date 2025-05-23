import React, { useState, useCallback, useEffect } from 'react';

interface PasswordOptions {
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

interface ExtendedOptions extends PasswordOptions {
  saveSettings: boolean;
}

const PasswordGenerator: React.FC = () => {
  const loadSettings = (): ExtendedOptions => {
    const saved = localStorage.getItem('passwordGeneratorSettings');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // If parsing fails, return defaults
      }
    }
    return {
      length: 25,
      includeNumbers: true,
      includeLowercase: true,
      includeUppercase: true,
      beginWithLetter: true,
      excludeSimilar: true,
      noDuplicates: true,
      removeSequential: true,
      customSymbols: '!@#$%^&*()_+-=[]{}|;:,.<>?',
      saveSettings: false,
    };
  };

  const [options, setOptions] = useState<ExtendedOptions>(loadSettings());
  const [passwords, setPasswords] = useState<string[]>([]);
  const [showCookieBanner, setShowCookieBanner] = useState<boolean>(() => {
    return !localStorage.getItem('cookieConsent');
  });

  useEffect(() => {
    if (options.saveSettings) {
      localStorage.setItem('passwordGeneratorSettings', JSON.stringify(options));
    } else {
      localStorage.removeItem('passwordGeneratorSettings');
    }
  }, [options]);

  const generatePassword = useCallback(() => {
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numbers = '0123456789';
    const symbols = options.customSymbols || '!@#$%^&*()_+-=[]{}|;:,.<>?';
    
    const similarChars = '0O1lI|`';
    const sequentialChars = ['abc', 'bcd', 'cde', 'def', 'efg', 'fgh', 'ghi', 'hij', 'ijk', 'jkl', 'klm', 'lmn', 'mno', 'nop', 'opq', 'pqr', 'qrs', 'rst', 'stu', 'tuv', 'uvw', 'vwx', 'wxy', 'xyz', '123', '234', '345', '456', '567', '678', '789'];

    let charset = symbols;
    
    if (options.includeLowercase) charset += lowercase;
    if (options.includeUppercase) charset += uppercase;
    if (options.includeNumbers) charset += numbers;

    if (options.excludeSimilar) {
      charset = charset.split('').filter(char => !similarChars.includes(char)).join('');
    }

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
        const firstChar = letterCharset[Math.floor(Math.random() * letterCharset.length)];
        password += firstChar;
        if (options.noDuplicates) usedChars.add(firstChar);
      }
    }

    while (password.length < options.length) {
      let availableChars = charset;
      
      if (options.noDuplicates) {
        availableChars = charset.split('').filter(char => !usedChars.has(char)).join('');
        if (!availableChars) break;
      }

      const randomChar = availableChars[Math.floor(Math.random() * availableChars.length)];
      
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
  }, [options]);

  const generateMultiplePasswords = () => {
    const newPasswords = Array.from({ length: 5 }, () => generatePassword());
    setPasswords(newPasswords);
  };

  const copyToClipboard = (password: string) => {
    navigator.clipboard.writeText(password);
  };

  const inputStyle = {
    padding: '8px 12px',
    border: '2px solid #e1e5e9',
    borderRadius: '6px',
    fontSize: '14px',
    transition: 'border-color 0.2s ease',
  };

  const labelStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '14px',
    color: '#374151',
    cursor: 'pointer',
  };

  const checkboxStyle = {
    width: '16px',
    height: '16px',
    cursor: 'pointer',
  };

  const sectionStyle = {
    backgroundColor: '#ffffff',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    padding: '16px',
    marginBottom: '16px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
  };

  const helpTextStyle = {
    fontSize: '12px',
    color: '#6b7280',
    marginTop: '4px',
    lineHeight: '1.4',
  };

  return (
    <div style={{ maxWidth: '700px', margin: '0 auto', padding: '16px', backgroundColor: '#f9fafb', minHeight: '100vh' }}>
      <header>
        <h1 style={{ textAlign: 'center', color: '#1f2937', marginBottom: '8px', fontSize: '2rem' }}>Secure Password Generator</h1>
        <p style={{ textAlign: 'center', fontSize: '1rem', color: '#6b7280', marginBottom: '24px' }}>
          Generate strong, secure passwords instantly. All processing happens in your browser - 
          your passwords never leave your device.
        </p>
      </header>
      {showCookieBanner && (
        <div style={{
          position: 'fixed',
          bottom: '0',
          left: '0',
          right: '0',
          backgroundColor: '#1f2937',
          color: 'white',
          padding: '16px',
          boxShadow: '0 -2px 10px rgba(0, 0, 0, 0.1)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
        }}>
          <div style={{ fontSize: '14px', lineHeight: '1.4' }}>
            🍪 This website uses localStorage to save your preferences when you enable "Save Settings" 
            and Google Analytics to understand site usage. No passwords or sensitive data are ever tracked.
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => {
                localStorage.setItem('cookieConsent', 'accepted');
                setShowCookieBanner(false);
              }}
              style={{
                backgroundColor: '#3b82f6',
                color: 'white',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
              }}
            >
              Accept
            </button>
            <button
              onClick={() => {
                localStorage.setItem('cookieConsent', 'declined');
                setShowCookieBanner(false);
              }}
              style={{
                backgroundColor: 'transparent',
                color: 'white',
                border: '1px solid #6b7280',
                padding: '8px 16px',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px',
              }}
            >
              Decline
            </button>
          </div>
        </div>
      )}
      
      <main>
      <div style={sectionStyle}>
        <h3 style={{ margin: '0 0 12px 0', color: '#374151', fontSize: '16px' }}>Configuration</h3>
        
        <div style={{ display: 'grid', gap: '12px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ ...labelStyle, flexDirection: 'column', alignItems: 'flex-start' }}>
                <span style={{ marginBottom: '6px', fontWeight: '500' }}>Password Length</span>
                <input
                  type="number"
                  min="10"
                  max="100"
                  value={options.length}
                  onChange={(e) => setOptions(prev => ({ ...prev, length: parseInt(e.target.value) || 25 }))}
                  style={{ ...inputStyle, width: '80px' }}
                />
                <div style={helpTextStyle}>Number of characters in the generated password (10-100)</div>
              </label>
            </div>
            <div>
              <label style={{ ...labelStyle, flexDirection: 'column', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input
                    type="checkbox"
                    checked={options.saveSettings}
                    onChange={(e) => setOptions(prev => ({ ...prev, saveSettings: e.target.checked }))}
                    style={checkboxStyle}
                  />
                  <span>Save Settings</span>
                </div>
                <div style={helpTextStyle}>Remember your preferences using browser storage</div>
              </label>
            </div>
          </div>

          <div>
            <label style={{ ...labelStyle, flexDirection: 'column', alignItems: 'flex-start' }}>
              <span style={{ marginBottom: '6px', fontWeight: '500' }}>Custom Symbols</span>
              <input
                type="text"
                value={options.customSymbols}
                onChange={(e) => setOptions(prev => ({ ...prev, customSymbols: e.target.value }))}
                style={{ ...inputStyle, width: '100%', fontFamily: 'Monaco, Consolas, monospace' }}
                placeholder="!@#$%^&*()_+-=[]{}|;:,.<>?"
              />
              <div style={helpTextStyle}>Specify which special characters to include in passwords</div>
            </label>
          </div>
        </div>
      </div>

      <div style={sectionStyle}>
        <h3 style={{ margin: '0 0 12px 0', color: '#374151', fontSize: '16px' }}>Character Options</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '8px' }}>
          <label style={{ ...labelStyle, flexDirection: 'column', alignItems: 'flex-start' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                type="checkbox"
                checked={options.includeNumbers}
                onChange={(e) => setOptions(prev => ({ ...prev, includeNumbers: e.target.checked }))}
                style={checkboxStyle}
              />
              <span>Include Numbers (0-9)</span>
            </div>
            <div style={helpTextStyle}>Add digits 0-9 to the character pool</div>
          </label>

          <label style={{ ...labelStyle, flexDirection: 'column', alignItems: 'flex-start' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                type="checkbox"
                checked={options.includeLowercase}
                onChange={(e) => setOptions(prev => ({ ...prev, includeLowercase: e.target.checked }))}
                style={checkboxStyle}
              />
              <span>Include Lowercase (a-z)</span>
            </div>
            <div style={helpTextStyle}>Add lowercase letters a-z to the character pool</div>
          </label>

          <label style={{ ...labelStyle, flexDirection: 'column', alignItems: 'flex-start' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                type="checkbox"
                checked={options.includeUppercase}
                onChange={(e) => setOptions(prev => ({ ...prev, includeUppercase: e.target.checked }))}
                style={checkboxStyle}
              />
              <span>Include Uppercase (A-Z)</span>
            </div>
            <div style={helpTextStyle}>Add uppercase letters A-Z to the character pool</div>
          </label>

          <label style={{ ...labelStyle, flexDirection: 'column', alignItems: 'flex-start' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                type="checkbox"
                checked={options.beginWithLetter}
                onChange={(e) => setOptions(prev => ({ ...prev, beginWithLetter: e.target.checked }))}
                style={checkboxStyle}
              />
              <span>Begin with Letter</span>
            </div>
            <div style={helpTextStyle}>Ensure password starts with a letter (a-z or A-Z)</div>
          </label>

          <label style={{ ...labelStyle, flexDirection: 'column', alignItems: 'flex-start' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                type="checkbox"
                checked={options.excludeSimilar}
                onChange={(e) => setOptions(prev => ({ ...prev, excludeSimilar: e.target.checked }))}
                style={checkboxStyle}
              />
              <span>Exclude Similar (0,O,1,l,I,|)</span>
            </div>
            <div style={helpTextStyle}>Remove confusing characters that look alike</div>
          </label>

          <label style={{ ...labelStyle, flexDirection: 'column', alignItems: 'flex-start' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                type="checkbox"
                checked={options.noDuplicates}
                onChange={(e) => setOptions(prev => ({ ...prev, noDuplicates: e.target.checked }))}
                style={checkboxStyle}
              />
              <span>No Duplicate Characters</span>
            </div>
            <div style={helpTextStyle}>Each character appears only once in the password</div>
          </label>

          <label style={{ ...labelStyle, flexDirection: 'column', alignItems: 'flex-start' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                type="checkbox"
                checked={options.removeSequential}
                onChange={(e) => setOptions(prev => ({ ...prev, removeSequential: e.target.checked }))}
                style={checkboxStyle}
              />
              <span>Remove Sequential Characters</span>
            </div>
            <div style={helpTextStyle}>Avoid patterns like 'abc', '123', or 'xyz' in passwords</div>
          </label>
        </div>
      </div>

      <div style={{ textAlign: 'center', marginBottom: '16px' }}>
        <button 
          onClick={generateMultiplePasswords}
          style={{
            backgroundColor: '#3b82f6',
            color: 'white',
            border: 'none',
            padding: '12px 24px',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: '500',
            boxShadow: '0 4px 6px rgba(59, 130, 246, 0.3)',
            transition: 'all 0.2s ease',
          }}
          onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#2563eb'}
          onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#3b82f6'}
        >
          Generate 5 Passwords
        </button>
      </div>

      {passwords.length > 0 && (
        <div style={sectionStyle}>
          <h3 style={{ margin: '0 0 12px 0', color: '#374151', fontSize: '16px' }}>Generated Passwords</h3>
          <div style={{ display: 'grid', gap: '8px' }}>
            {passwords.map((password, index) => (
              <div 
                key={index}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '8px',
                  backgroundColor: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '6px',
                  gap: '8px',
                }}
              >
                <code style={{ 
                  flexGrow: 1, 
                  fontFamily: 'Monaco, Consolas, monospace', 
                  fontSize: '14px',
                  color: '#1e293b',
                  backgroundColor: 'transparent',
                  wordBreak: 'break-all',
                }}>
                  {password}
                </code>
                <button
                  onClick={() => copyToClipboard(password)}
                  style={{
                    padding: '6px 12px',
                    border: '1px solid #3b82f6',
                    backgroundColor: 'white',
                    color: '#3b82f6',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '12px',
                    fontWeight: '500',
                    transition: 'all 0.2s ease',
                    whiteSpace: 'nowrap',
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.backgroundColor = '#3b82f6';
                    e.currentTarget.style.color = 'white';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.backgroundColor = 'white';
                    e.currentTarget.style.color = '#3b82f6';
                  }}
                >
                  Copy
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{
        marginTop: '16px',
        padding: '12px',
        backgroundColor: '#f0f9ff',
        borderRadius: '8px',
        border: '1px solid #bae6fd',
        fontSize: '12px',
        color: '#0369a1',
        textAlign: 'center',
        lineHeight: '1.5',
      }}>
        <strong>🔒 Privacy Notice:</strong> This application does not store any generated passwords. 
        All passwords are generated entirely on your device (client-side) and never transmitted to any server.
      </div>

      </main>
      
      <section style={{
        marginTop: '48px',
        padding: '24px',
        backgroundColor: 'white',
        borderRadius: '8px',
        border: '1px solid #e5e7eb',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
      }}>
        <h2 style={{ fontSize: '1.25rem', marginBottom: '16px', color: '#1f2937' }}>Frequently Asked Questions</h2>
        
        <article style={{ marginBottom: '20px' }}>
          <h3 style={{ fontSize: '1rem', marginBottom: '6px', color: '#374151', fontWeight: '600' }}>How secure are the passwords generated?</h3>
          <p style={{ color: '#6b7280', lineHeight: 1.5, fontSize: '0.875rem' }}>
            Our password generator creates highly secure passwords using a combination of uppercase and lowercase letters, 
            numbers, and special characters. All generation happens locally in your browser using JavaScript's Math.random() 
            function, ensuring your passwords are never transmitted over the internet.
          </p>
        </article>
        
        <article style={{ marginBottom: '20px' }}>
          <h3 style={{ fontSize: '1rem', marginBottom: '6px', color: '#374151', fontWeight: '600' }}>What makes a strong password?</h3>
          <p style={{ color: '#6b7280', lineHeight: 1.5, fontSize: '0.875rem' }}>
            A strong password should be at least 12 characters long (we recommend 25+), include a mix of character types, 
            avoid dictionary words and sequential patterns, and be unique for each account. Our generator handles all these 
            requirements automatically.
          </p>
        </article>
        
        <article style={{ marginBottom: '20px' }}>
          <h3 style={{ fontSize: '1rem', marginBottom: '6px', color: '#374151', fontWeight: '600' }}>Can I customize the password generation?</h3>
          <p style={{ color: '#6b7280', lineHeight: 1.5, fontSize: '0.875rem' }}>
            Yes! You can adjust the length, choose which character types to include, exclude similar-looking characters, 
            prevent duplicates, remove sequential patterns, and even define your own custom symbol set.
          </p>
        </article>
        
        <article>
          <h3 style={{ fontSize: '1rem', marginBottom: '6px', color: '#374151', fontWeight: '600' }}>Is my data being tracked or stored?</h3>
          <p style={{ color: '#6b7280', lineHeight: 1.5, fontSize: '0.875rem' }}>
            No passwords or sensitive data are ever stored or transmitted. We use Google Analytics to understand site usage 
            patterns, but this only tracks general visitor statistics, not any password-related information. Your settings 
            are only saved locally in your browser if you explicitly choose to save them.
          </p>
        </article>
      </section>
      
      <footer style={{
        marginTop: '32px',
        paddingTop: '16px',
        borderTop: '1px solid #e5e7eb',
        textAlign: 'center',
        color: '#6b7280',
        fontSize: '0.75rem'
      }}>
        <p>© 2025 Secure Password Generator by Travis Harper. All rights reserved.</p>
        <div style={{ marginTop: '8px', display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <a href="https://github.com/t-harper/passwordgen" 
             style={{ color: '#3b82f6', textDecoration: 'none' }}
             target="_blank" 
             rel="noopener noreferrer">
            View on GitHub
          </a>
          <span style={{ color: '#e5e7eb' }}>•</span>
          <a href="https://buymeacoffee.com/travis.harper" 
             style={{ color: '#3b82f6', textDecoration: 'none' }}
             target="_blank" 
             rel="noopener noreferrer">
            🍺 Buy me a beer
          </a>
        </div>
      </footer>
    </div>
  );
};

export default PasswordGenerator;