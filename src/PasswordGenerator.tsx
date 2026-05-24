import React, { useState, useEffect, useRef } from 'react';
import { PasswordOptions, generatePassword } from './lib/passwordAlgorithm';
import FAQFooter from './components/FAQFooter';
import useTheme from './hooks/useTheme';

interface ExtendedOptions extends PasswordOptions {
  saveSettings: boolean;
}

interface PasswordTemplate {
  name: string;
  options: PasswordOptions;
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
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const { theme, toggleTheme, currentColors } = useTheme();
  const mainContentRef = useRef<HTMLDivElement>(null);
  const generateButtonRef = useRef<HTMLButtonElement>(null);
  
  // Template state
  const [templates, setTemplates] = useState<PasswordTemplate[]>(() => {
    const saved = localStorage.getItem('passwordTemplates');
    return saved ? JSON.parse(saved) : [];
  });
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [templateName, setTemplateName] = useState('');
  const [bulkCount, setBulkCount] = useState<number>(100);
  const [bulkStatus, setBulkStatus] = useState<string>('');

  useEffect(() => {
    if (options.saveSettings) {
      localStorage.setItem('passwordGeneratorSettings', JSON.stringify(options));
    } else {
      localStorage.removeItem('passwordGeneratorSettings');
    }
  }, [options]);

  useEffect(() => {
    localStorage.setItem('passwordTemplates', JSON.stringify(templates));
  }, [templates]);

  const saveTemplate = () => {
    if (!selectedTemplate && !templateName.trim()) {
      setShowTemplateModal(true);
      return;
    }

    const name = selectedTemplate || templateName.trim();
    const templateOptions: PasswordOptions = {
      length: options.length,
      includeNumbers: options.includeNumbers,
      includeLowercase: options.includeLowercase,
      includeUppercase: options.includeUppercase,
      beginWithLetter: options.beginWithLetter,
      excludeSimilar: options.excludeSimilar,
      noDuplicates: options.noDuplicates,
      removeSequential: options.removeSequential,
      customSymbols: options.customSymbols,
    };

    setTemplates(prev => {
      const existing = prev.findIndex(t => t.name === name);
      if (existing >= 0) {
        const updated = [...prev];
        updated[existing] = { name, options: templateOptions };
        return updated;
      }
      return [...prev, { name, options: templateOptions }];
    });

    // Select the saved template in the dropdown
    setSelectedTemplate(name);
    setTemplateName('');
    setShowTemplateModal(false);
  };

  const loadTemplate = (templateName: string) => {
    const template = templates.find(t => t.name === templateName);
    if (template) {
      setOptions(prev => ({
        ...prev,
        ...template.options,
      }));
    }
  };

  const generateMultiplePasswords = () => {
    const newPasswords = Array.from({ length: 5 }, () => generatePassword(options));
    setPasswords(newPasswords);

    // Focus management for screen readers
    setTimeout(() => {
      const passwordsSection = document.getElementById('passwords-heading');
      if (passwordsSection) {
        passwordsSection.focus();
      }
    }, 100);
  };

  const BULK_MIN = 1;
  const BULK_MAX = 10000;

  const downloadBulkCsv = () => {
    const count = Math.max(BULK_MIN, Math.min(BULK_MAX, Math.floor(bulkCount) || 0));
    const rows = ['password'];
    for (let i = 0; i < count; i++) {
      const pw = generatePassword(options);
      // RFC 4180: wrap in quotes, escape internal quotes by doubling.
      rows.push(`"${pw.replace(/"/g, '""')}"`);
    }
    const csv = rows.join('\r\n') + '\r\n';
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const ts = new Date().toISOString().replace(/[:.]/g, '-');
    const a = document.createElement('a');
    a.href = url;
    a.download = `passwords-${count}-${ts}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setBulkStatus(`Downloaded ${count} passwords`);
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
    border: `2px solid ${currentColors.inputBorder}`,
    borderRadius: '6px',
    fontSize: '14px',
    transition: 'border-color 0.2s ease',
    backgroundColor: currentColors.inputBg,
    color: currentColors.text,
  };

  const focusStyle = {
    outline: `2px solid ${currentColors.primaryHover}`,
    outlineOffset: '2px',
  };

  const labelStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '14px',
    color: currentColors.textSecondary,
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
    backgroundColor: currentColors.cardBackground,
    border: `1px solid ${currentColors.border}`,
    borderRadius: '8px',
    padding: '16px',
    marginBottom: '16px',
    boxShadow: `0 1px 3px ${currentColors.shadowColor}`,
  };

  const helpTextStyle = {
    fontSize: '12px',
    color: currentColors.textMuted,
    marginTop: '4px',
    lineHeight: '1.4',
  };

  return (
    <div style={{ backgroundColor: currentColors.background, minHeight: '100vh', transition: 'background-color 0.3s ease' }}>
      <div style={{ maxWidth: '700px', margin: '0 auto', padding: '16px' }}>
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
          e.currentTarget.style.backgroundColor = currentColors.text;
          e.currentTarget.style.color = currentColors.cardBackground;
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
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '8px' }}>
          <button
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            style={{
              padding: '8px 12px',
              backgroundColor: currentColors.cardBackground,
              color: currentColors.text,
              border: `1px solid ${currentColors.border}`,
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = currentColors.primary;
              e.currentTarget.style.color = '#ffffff';
              e.currentTarget.style.borderColor = currentColors.primary;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = currentColors.cardBackground;
              e.currentTarget.style.color = currentColors.text;
              e.currentTarget.style.borderColor = currentColors.border;
            }}
            onFocus={(e) => {
              Object.assign(e.currentTarget.style, focusStyle);
            }}
            onBlur={(e) => {
              e.currentTarget.style.outline = 'none';
            }}
          >
            <span style={{ fontSize: '16px' }}>{theme === 'light' ? '🌙' : '☀️'}</span>
          </button>
        </div>
        <h1 style={{ 
          textAlign: 'center', 
          color: currentColors.text, 
          marginBottom: '8px', 
          fontSize: '1.75rem',
          lineHeight: '1.2',
          paddingTop: '0'
        }}>Secure Password Generator</h1>
        <p style={{ textAlign: 'center', fontSize: '1rem', color: currentColors.textMuted, marginBottom: '24px' }}>
          Generate strong, secure passwords instantly. All processing happens in your browser - 
          your passwords never leave your device.
        </p>
      </header>

      <main id="main-content" ref={mainContentRef} tabIndex={-1}>
      <section id="configuration" style={sectionStyle} aria-labelledby="config-heading">
        <h2 id="config-heading" style={{ margin: '0 0 12px 0', color: currentColors.textSecondary, fontSize: '16px' }}>Configuration</h2>
        
        <div style={{ display: 'grid', gap: '16px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ ...labelStyle, flexDirection: 'column', alignItems: 'flex-start' }}>
                <span style={{ marginBottom: '6px', fontWeight: '500' }}>Password Length</span>
                <input
                  type="number"
                  min="10"
                  max="100"
                  value={options.length}
                  onChange={(e) => {
                    const value = parseInt(e.target.value) || 0;
                    setOptions(prev => ({ ...prev, length: value }));
                  }}
                  aria-label="Password length"
                  aria-describedby="length-help"
                  style={{ ...inputStyle, width: '80px' }}
                  onFocus={(e) => Object.assign(e.currentTarget.style, focusStyle)}
                  onBlur={(e) => {
                    e.currentTarget.style.outline = 'none';
                    // Validate and clamp on blur
                    const value = parseInt(e.currentTarget.value) || 25;
                    const clampedValue = Math.max(10, Math.min(100, value));
                    if (value !== clampedValue) {
                      setOptions(prev => ({ ...prev, length: clampedValue }));
                    }
                  }}
                />
                <div id="length-help" style={helpTextStyle}>Number of characters in the generated password (10-100)</div>
              </label>
            </div>
            <div>
              <label style={{ ...labelStyle, flexDirection: 'column', alignItems: 'flex-start' }}>
                <span style={{ marginBottom: '6px', fontWeight: '500' }}>Templates</span>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                  <select
                    value={selectedTemplate}
                    onChange={(e) => {
                      setSelectedTemplate(e.target.value);
                      if (e.target.value) {
                        loadTemplate(e.target.value);
                      }
                    }}
                    aria-label="Select template"
                    style={{ ...inputStyle, flex: '1', minWidth: '150px' }}
                    onFocus={(e) => Object.assign(e.currentTarget.style, focusStyle)}
                    onBlur={(e) => e.currentTarget.style.outline = 'none'}
                  >
                    <option value="">-- Select Template --</option>
                    {templates.map(template => (
                      <option key={template.name} value={template.name}>{template.name}</option>
                    ))}
                  </select>
                  <button
                    onClick={saveTemplate}
                    style={{
                      padding: '8px 12px',
                    backgroundColor: currentColors.primary,
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = currentColors.primaryHover;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = currentColors.primary;
                  }}
                  onFocus={(e) => {
                    Object.assign(e.currentTarget.style, focusStyle);
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.outline = 'none';
                  }}
                  aria-label="Save current settings as template"
                >
                  Save Template
                </button>
              </div>
              <div style={helpTextStyle}>Save and load password generation templates</div>
            </label>
          </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ ...labelStyle, flexDirection: 'column', alignItems: 'flex-start' }}>
                <span style={{ marginBottom: '6px', fontWeight: '500' }}>Custom Symbols</span>
                <input
                  type="text"
                  value={options.customSymbols}
                  onChange={(e) => setOptions(prev => ({ ...prev, customSymbols: e.target.value }))}
                  aria-label="Custom symbols"
                  aria-describedby="symbols-help"
                  style={{ ...inputStyle, width: '100%', maxWidth: '250px', fontFamily: 'Monaco, Consolas, monospace' }}
                  placeholder="!@#$%^&*()_+-=[]{}|;:,.<>?"
                  onFocus={(e) => Object.assign(e.currentTarget.style, focusStyle)}
                  onBlur={(e) => e.currentTarget.style.outline = 'none'}
                />
                <div id="symbols-help" style={helpTextStyle}>Specify which special characters to include in passwords</div>
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
        </div>
      </section>

      <section id="options" style={sectionStyle} aria-labelledby="options-heading">
        <h2 id="options-heading" style={{ margin: '0 0 12px 0', color: currentColors.textSecondary, fontSize: '16px' }}>Character Options</h2>
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
            backgroundColor: currentColors.primary,
            color: '#ffffff',
            border: 'none',
            padding: '12px 24px',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: '500',
            boxShadow: `0 4px 6px ${currentColors.shadowColor}`,
            transition: 'all 0.2s ease',
          }}
          onMouseOver={(e) => e.currentTarget.style.backgroundColor = currentColors.primaryHover}
          onMouseOut={(e) => e.currentTarget.style.backgroundColor = currentColors.primary}
          onFocus={(e) => {
            e.currentTarget.style.backgroundColor = currentColors.primaryHover;
            e.currentTarget.style.outline = `2px solid ${currentColors.primaryHover}`;
            e.currentTarget.style.outlineOffset = '2px';
          }}
          onBlur={(e) => {
            e.currentTarget.style.backgroundColor = currentColors.primary;
            e.currentTarget.style.outline = 'none';
          }}
        >
          Generate 5 Passwords
        </button>
        <div id="generate-help" className="sr-only" style={{ position: 'absolute', left: '-9999px' }}>Click to generate 5 unique passwords based on your selected options</div>
      </div>

      <section style={sectionStyle} aria-labelledby="bulk-heading">
        <h2 id="bulk-heading" style={{ margin: '0 0 12px 0', color: currentColors.textSecondary, fontSize: '16px' }}>Bulk Generation</h2>
        <p id="bulk-help" style={{ ...helpTextStyle, marginTop: 0 }}>
          Generate many passwords at once using your current settings and download them as a CSV file. Passwords are generated entirely in your browser — nothing is sent to a server.
        </p>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <label htmlFor="bulk-count" style={labelStyle}>How many passwords?</label>
            <input
              id="bulk-count"
              type="number"
              min={BULK_MIN}
              max={BULK_MAX}
              value={bulkCount}
              onChange={(e) => setBulkCount(parseInt(e.target.value, 10) || 0)}
              aria-describedby="bulk-help"
              style={{ ...inputStyle, width: '140px' }}
            />
          </div>
          <button
            type="button"
            onClick={downloadBulkCsv}
            aria-label={`Generate ${bulkCount} passwords and download as CSV`}
            style={{
              backgroundColor: currentColors.primary,
              color: '#ffffff',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '15px',
              fontWeight: '500',
              boxShadow: `0 4px 6px ${currentColors.shadowColor}`,
              transition: 'all 0.2s ease',
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = currentColors.primaryHover}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = currentColors.primary}
            onFocus={(e) => {
              e.currentTarget.style.backgroundColor = currentColors.primaryHover;
              e.currentTarget.style.outline = `2px solid ${currentColors.primaryHover}`;
              e.currentTarget.style.outlineOffset = '2px';
            }}
            onBlur={(e) => {
              e.currentTarget.style.backgroundColor = currentColors.primary;
              e.currentTarget.style.outline = 'none';
            }}
          >
            Download CSV
          </button>
        </div>
        <div role="status" aria-live="polite" style={{ ...helpTextStyle, marginTop: '8px', minHeight: '1.2em' }}>
          {bulkStatus}
        </div>
      </section>

      {passwords.length > 0 && (
        <section id="generated-passwords" style={sectionStyle} aria-labelledby="passwords-heading" aria-live="polite" aria-atomic="true">
          <h2 id="passwords-heading" tabIndex={-1} style={{ margin: '0 0 12px 0', color: currentColors.textSecondary, fontSize: '16px' }}>Generated Passwords</h2>
          <div style={{ display: 'grid', gap: '8px' }} role="list">
            {passwords.map((password, index) => (
              <div 
                key={index}
                role="listitem"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '8px',
                  backgroundColor: currentColors.cardBackground,
                  border: `1px solid ${currentColors.border}`,
                  borderRadius: '6px',
                  gap: '8px',
                }}
              >
                <code 
                  style={{ 
                    flexGrow: 1, 
                    fontFamily: 'Monaco, Consolas, monospace', 
                    fontSize: '14px',
                    color: currentColors.text,
                    backgroundColor: 'transparent',
                    wordBreak: 'break-all',
                  }}
                  aria-label={`Password ${index + 1}: ${password}`}
                  lang="en"
                >
                  {password}
                </code>
                <button
                  onClick={() => copyToClipboard(password, index)}
                  aria-label={`Copy password ${index + 1} to clipboard`}
                  aria-live="polite"
                  style={{
                    padding: '6px 12px',
                    border: `1px solid ${currentColors.primary}`,
                    backgroundColor: currentColors.cardBackground,
                    color: currentColors.primary,
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '12px',
                    fontWeight: '500',
                    transition: 'all 0.2s ease',
                    whiteSpace: 'nowrap',
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.backgroundColor = currentColors.primary;
                    e.currentTarget.style.color = '#ffffff';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.backgroundColor = currentColors.cardBackground;
                    e.currentTarget.style.color = currentColors.primary;
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.backgroundColor = currentColors.primary;
                    e.currentTarget.style.color = '#ffffff';
                    e.currentTarget.style.outline = `2px solid ${currentColors.primaryHover}`;
                    e.currentTarget.style.outlineOffset = '2px';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.backgroundColor = currentColors.cardBackground;
                    e.currentTarget.style.color = currentColors.primary;
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
        backgroundColor: theme === 'light' ? '#f0f9ff' : currentColors.cardBackground,
        borderRadius: '8px',
        border: `1px solid ${theme === 'light' ? '#bae6fd' : currentColors.border}`,
        fontSize: '12px',
        color: theme === 'light' ? '#0369a1' : currentColors.primary,
        textAlign: 'center',
        lineHeight: '1.5',
      }}>
        <strong>🔒 Privacy Notice:</strong> This application does not store any generated passwords. 
        All passwords are generated entirely on your device (client-side) and never transmitted to any server.
      </div>

      </main>
      
      <FAQFooter currentColors={currentColors} />

      {showTemplateModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2000,
        }}>
          <div style={{
            backgroundColor: currentColors.cardBackground,
            padding: '24px',
            borderRadius: '8px',
            border: `1px solid ${currentColors.border}`,
            boxShadow: `0 4px 6px ${currentColors.shadowColor}`,
            maxWidth: '400px',
            width: '90%',
          }}>
            <h3 style={{ marginTop: 0, marginBottom: '16px', color: currentColors.text }}>
              Name Your Template
            </h3>
            <input
              type="text"
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              placeholder="e.g., Strong Security, Simple Password"
              style={{
                ...inputStyle,
                width: '100%',
                marginBottom: '16px',
              }}
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter' && templateName.trim()) {
                  saveTemplate();
                }
              }}
            />
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => {
                  setShowTemplateModal(false);
                  setTemplateName('');
                }}
                style={{
                  padding: '8px 16px',
                  backgroundColor: 'transparent',
                  color: currentColors.text,
                  border: `1px solid ${currentColors.border}`,
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = currentColors.border;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                Cancel
              </button>
              <button
                onClick={saveTemplate}
                disabled={!templateName.trim()}
                style={{
                  padding: '8px 16px',
                  backgroundColor: templateName.trim() ? currentColors.primary : currentColors.border,
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: templateName.trim() ? 'pointer' : 'not-allowed',
                  fontSize: '14px',
                }}
                onMouseEnter={(e) => {
                  if (templateName.trim()) {
                    e.currentTarget.style.backgroundColor = currentColors.primaryHover;
                  }
                }}
                onMouseLeave={(e) => {
                  if (templateName.trim()) {
                    e.currentTarget.style.backgroundColor = currentColors.primary;
                  }
                }}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
      
      </div>
    </div>
  );
};

export default PasswordGenerator;