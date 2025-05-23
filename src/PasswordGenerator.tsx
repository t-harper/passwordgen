import React, { useState, useCallback, useEffect, useRef } from 'react';

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
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const mainContentRef = useRef<HTMLDivElement>(null);
  const generateButtonRef = useRef<HTMLButtonElement>(null);

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
    
    // Focus management for screen readers
    setTimeout(() => {
      const passwordsSection = document.getElementById('passwords-heading');
      if (passwordsSection) {
        passwordsSection.focus();
      }
    }, 100);
  };

  const copyToClipboard = async (password: string, index: number) => {
    try {
      await navigator.clipboard.writeText(password);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (err) {
      console.error('Failed to copy password:', err);
    }
  };

  const inputStyle = {
    padding: '8px 12px',
    border: '2px solid #e1e5e9',
    borderRadius: '6px',
    fontSize: '14px',
    transition: 'border-color 0.2s ease',
  };

  const focusStyle = {
    outline: '2px solid #2563eb',
    outlineOffset: '2px',
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

  const handleCheckboxFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    Object.assign(e.currentTarget.style, focusStyle);
  };

  const handleCheckboxBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    e.currentTarget.style.outline = 'none';
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
      <a
        href="#main-content"
        style={{
          position: 'absolute',
          left: '-9999px',
          top: 'auto',
          width: '1px',
          height: '1px',
          overflow: 'hidden',
        }}
        onFocus={(e) => {
          e.currentTarget.style.position = 'fixed';
          e.currentTarget.style.top = '10px';
          e.currentTarget.style.left = '10px';
          e.currentTarget.style.width = 'auto';
          e.currentTarget.style.height = 'auto';
          e.currentTarget.style.padding = '8px 16px';
          e.currentTarget.style.backgroundColor = '#1f2937';
          e.currentTarget.style.color = 'white';
          e.currentTarget.style.textDecoration = 'none';
          e.currentTarget.style.borderRadius = '4px';
          e.currentTarget.style.zIndex = '9999';
        }}
        onBlur={(e) => {
          e.currentTarget.style.position = 'absolute';
          e.currentTarget.style.left = '-9999px';
          e.currentTarget.style.width = '1px';
          e.currentTarget.style.height = '1px';
        }}
      >
        Skip to main content
      </a>
      <header>
        <h1 style={{ textAlign: 'center', color: '#1f2937', marginBottom: '8px', fontSize: '2rem' }}>Secure Password Generator</h1>
        <p style={{ textAlign: 'center', fontSize: '1rem', color: '#6b7280', marginBottom: '24px' }}>
          Generate strong, secure passwords instantly. All processing happens in your browser - 
          your passwords never leave your device.
        </p>
      </header>
      {showCookieBanner && (
        <div 
          role="region"
          aria-label="Cookie consent banner"
          aria-live="polite"
          style={{
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
              aria-label="Accept cookies"
              onFocus={(e) => {
                e.currentTarget.style.outline = '2px solid white';
                e.currentTarget.style.outlineOffset = '2px';
              }}
              onBlur={(e) => e.currentTarget.style.outline = 'none'}
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
              aria-label="Decline cookies"
              onFocus={(e) => {
                e.currentTarget.style.outline = '2px solid white';
                e.currentTarget.style.outlineOffset = '2px';
              }}
              onBlur={(e) => e.currentTarget.style.outline = 'none'}
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
      
      <main id="main-content" ref={mainContentRef} tabIndex={-1}>
      <section style={sectionStyle} aria-labelledby="config-heading">
        <h2 id="config-heading" style={{ margin: '0 0 12px 0', color: '#374151', fontSize: '16px' }}>Configuration</h2>
        
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
                  aria-label="Password length"
                  aria-describedby="length-help"
                  style={{ ...inputStyle, width: '80px' }}
                  onFocus={(e) => Object.assign(e.currentTarget.style, focusStyle)}
                  onBlur={(e) => e.currentTarget.style.outline = 'none'}
                />
                <div id="length-help" style={helpTextStyle}>Number of characters in the generated password (10-100)</div>
              </label>
            </div>
            <div>
              <label style={{ ...labelStyle, flexDirection: 'column', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input
                    type="checkbox"
                    checked={options.saveSettings}
                    onChange={(e) => setOptions(prev => ({ ...prev, saveSettings: e.target.checked }))}
                    aria-describedby="save-help"
                    id="save-settings"
                    style={checkboxStyle}
                    onFocus={handleCheckboxFocus}
                    onBlur={handleCheckboxBlur}
                  />
                  <label htmlFor="save-settings" style={{ margin: 0, cursor: 'pointer' }}>Save Settings</label>
                </div>
                <div id="save-help" style={helpTextStyle}>Remember your preferences using browser storage</div>
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
                aria-label="Custom symbols"
                aria-describedby="symbols-help"
                style={{ ...inputStyle, width: '100%', fontFamily: 'Monaco, Consolas, monospace' }}
                placeholder="!@#$%^&*()_+-=[]{}|;:,.<>?"
                onFocus={(e) => Object.assign(e.currentTarget.style, focusStyle)}
                onBlur={(e) => e.currentTarget.style.outline = 'none'}
              />
              <div id="symbols-help" style={helpTextStyle}>Specify which special characters to include in passwords</div>
            </label>
          </div>
        </div>
      </section>

      <section style={sectionStyle} aria-labelledby="options-heading">
        <h2 id="options-heading" style={{ margin: '0 0 12px 0', color: '#374151', fontSize: '16px' }}>Character Options</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '8px' }}>
          <label style={{ ...labelStyle, flexDirection: 'column', alignItems: 'flex-start' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                type="checkbox"
                checked={options.includeNumbers}
                onChange={(e) => setOptions(prev => ({ ...prev, includeNumbers: e.target.checked }))}
                id="include-numbers"
                aria-describedby="numbers-help"
                style={checkboxStyle}
                onFocus={handleCheckboxFocus}
                onBlur={handleCheckboxBlur}
              />
              <label htmlFor="include-numbers" style={{ margin: 0, cursor: 'pointer' }}>Include Numbers (0-9)</label>
            </div>
            <div id="numbers-help" style={helpTextStyle}>Add digits 0-9 to the character pool</div>
          </label>

          <label style={{ ...labelStyle, flexDirection: 'column', alignItems: 'flex-start' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                type="checkbox"
                checked={options.includeLowercase}
                onChange={(e) => setOptions(prev => ({ ...prev, includeLowercase: e.target.checked }))}
                id="include-lowercase"
                aria-describedby="lowercase-help"
                style={checkboxStyle}
                onFocus={handleCheckboxFocus}
                onBlur={handleCheckboxBlur}
              />
              <label htmlFor="include-lowercase" style={{ margin: 0, cursor: 'pointer' }}>Include Lowercase (a-z)</label>
            </div>
            <div id="lowercase-help" style={helpTextStyle}>Add lowercase letters a-z to the character pool</div>
          </label>

          <label style={{ ...labelStyle, flexDirection: 'column', alignItems: 'flex-start' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                type="checkbox"
                checked={options.includeUppercase}
                onChange={(e) => setOptions(prev => ({ ...prev, includeUppercase: e.target.checked }))}
                id="include-uppercase"
                aria-describedby="uppercase-help"
                style={checkboxStyle}
                onFocus={handleCheckboxFocus}
                onBlur={handleCheckboxBlur}
              />
              <label htmlFor="include-uppercase" style={{ margin: 0, cursor: 'pointer' }}>Include Uppercase (A-Z)</label>
            </div>
            <div id="uppercase-help" style={helpTextStyle}>Add uppercase letters A-Z to the character pool</div>
          </label>

          <label style={{ ...labelStyle, flexDirection: 'column', alignItems: 'flex-start' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                type="checkbox"
                checked={options.beginWithLetter}
                onChange={(e) => setOptions(prev => ({ ...prev, beginWithLetter: e.target.checked }))}
                id="begin-letter"
                aria-describedby="begin-help"
                style={checkboxStyle}
                onFocus={handleCheckboxFocus}
                onBlur={handleCheckboxBlur}
              />
              <label htmlFor="begin-letter" style={{ margin: 0, cursor: 'pointer' }}>Begin with Letter</label>
            </div>
            <div id="begin-help" style={helpTextStyle}>Ensure password starts with a letter (a-z or A-Z)</div>
          </label>

          <label style={{ ...labelStyle, flexDirection: 'column', alignItems: 'flex-start' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                type="checkbox"
                checked={options.excludeSimilar}
                onChange={(e) => setOptions(prev => ({ ...prev, excludeSimilar: e.target.checked }))}
                id="exclude-similar"
                aria-describedby="similar-help"
                style={checkboxStyle}
                onFocus={handleCheckboxFocus}
                onBlur={handleCheckboxBlur}
              />
              <label htmlFor="exclude-similar" style={{ margin: 0, cursor: 'pointer' }}>Exclude Similar (0,O,1,l,I,|)</label>
            </div>
            <div id="similar-help" style={helpTextStyle}>Remove confusing characters that look alike</div>
          </label>

          <label style={{ ...labelStyle, flexDirection: 'column', alignItems: 'flex-start' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                type="checkbox"
                checked={options.noDuplicates}
                onChange={(e) => setOptions(prev => ({ ...prev, noDuplicates: e.target.checked }))}
                id="no-duplicates"
                aria-describedby="duplicates-help"
                style={checkboxStyle}
                onFocus={handleCheckboxFocus}
                onBlur={handleCheckboxBlur}
              />
              <label htmlFor="no-duplicates" style={{ margin: 0, cursor: 'pointer' }}>No Duplicate Characters</label>
            </div>
            <div id="duplicates-help" style={helpTextStyle}>Each character appears only once in the password</div>
          </label>

          <label style={{ ...labelStyle, flexDirection: 'column', alignItems: 'flex-start' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                type="checkbox"
                checked={options.removeSequential}
                onChange={(e) => setOptions(prev => ({ ...prev, removeSequential: e.target.checked }))}
                id="remove-sequential"
                aria-describedby="sequential-help"
                style={checkboxStyle}
                onFocus={handleCheckboxFocus}
                onBlur={handleCheckboxBlur}
              />
              <label htmlFor="remove-sequential" style={{ margin: 0, cursor: 'pointer' }}>Remove Sequential Characters</label>
            </div>
            <div id="sequential-help" style={helpTextStyle}>Avoid patterns like 'abc', '123', or 'xyz' in passwords</div>
          </label>
        </div>
      </section>

      <div style={{ textAlign: 'center', marginBottom: '16px' }}>
        <button 
          ref={generateButtonRef}
          onClick={generateMultiplePasswords}
          aria-label="Generate 5 new passwords"
          aria-describedby="generate-help"
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              generateMultiplePasswords();
            }
          }}
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
          onFocus={(e) => {
            e.currentTarget.style.backgroundColor = '#2563eb';
            e.currentTarget.style.outline = '2px solid #1e40af';
            e.currentTarget.style.outlineOffset = '2px';
          }}
          onBlur={(e) => {
            e.currentTarget.style.backgroundColor = '#3b82f6';
            e.currentTarget.style.outline = 'none';
          }}
        >
          Generate 5 Passwords
        </button>
        <div id="generate-help" className="sr-only" style={{ position: 'absolute', left: '-9999px' }}>Click to generate 5 unique passwords based on your selected options</div>
      </div>

      {passwords.length > 0 && (
        <section style={sectionStyle} aria-labelledby="passwords-heading" aria-live="polite" aria-atomic="true">
          <h2 id="passwords-heading" tabIndex={-1} style={{ margin: '0 0 12px 0', color: '#374151', fontSize: '16px' }}>Generated Passwords</h2>
          <div style={{ display: 'grid', gap: '8px' }} role="list">
            {passwords.map((password, index) => (
              <div 
                key={index}
                role="listitem"
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
                <code 
                  style={{ 
                    flexGrow: 1, 
                    fontFamily: 'Monaco, Consolas, monospace', 
                    fontSize: '14px',
                    color: '#1e293b',
                    backgroundColor: 'transparent',
                    wordBreak: 'break-all',
                  }}
                  aria-label={`Password ${index + 1}: ${password}`}
                >
                  {password}
                </code>
                <button
                  onClick={() => copyToClipboard(password, index)}
                  aria-label={`Copy password ${index + 1} to clipboard`}
                  aria-live="polite"
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
                  onFocus={(e) => {
                    e.currentTarget.style.backgroundColor = '#3b82f6';
                    e.currentTarget.style.color = 'white';
                    e.currentTarget.style.outline = '2px solid #1e40af';
                    e.currentTarget.style.outlineOffset = '2px';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.backgroundColor = 'white';
                    e.currentTarget.style.color = '#3b82f6';
                    e.currentTarget.style.outline = 'none';
                  }}
                >
                  {copiedIndex === index ? 'Copied!' : 'Copy'}
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      <div role="alert" aria-live="polite" style={{
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
      
      <section aria-labelledby="faq-heading" style={{
        marginTop: '48px',
        padding: '24px',
        backgroundColor: 'white',
        borderRadius: '8px',
        border: '1px solid #e5e7eb',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
      }}>
        <h2 id="faq-heading" style={{ fontSize: '1.25rem', marginBottom: '16px', color: '#1f2937' }}>Frequently Asked Questions</h2>
        
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
      
      <footer role="contentinfo" style={{
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
             rel="noopener noreferrer"
             aria-label="View source code on GitHub">
            View on GitHub
          </a>
          <span style={{ color: '#e5e7eb' }}>•</span>
          <a href="https://buymeacoffee.com/travis.harper" 
             style={{ color: '#3b82f6', textDecoration: 'none' }}
             target="_blank" 
             rel="noopener noreferrer"
             aria-label="Support the developer - Buy me a beer">
            🍺 Buy me a beer
          </a>
        </div>
      </footer>
    </div>
  );
};

export default PasswordGenerator;