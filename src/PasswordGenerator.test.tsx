import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PasswordGenerator from './PasswordGenerator';

// Mock clipboard API
Object.assign(navigator, {
  clipboard: {
    writeText: jest.fn(() => Promise.resolve()),
  },
});

describe('PasswordGenerator', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  test('renders password generator with default settings', () => {
    render(<PasswordGenerator />);
    
    expect(screen.getByText('Secure Password Generator')).toBeInTheDocument();
    expect(screen.getByDisplayValue('25')).toBeInTheDocument(); // Default length
    expect(screen.getByDisplayValue('!@#$%^&*()_+-=[]{}|;:,.<>?')).toBeInTheDocument(); // Default symbols
  });

  test('generates 5 passwords when button is clicked', async () => {
    render(<PasswordGenerator />);
    
    const generateButton = screen.getByText('Generate 5 Passwords');
    fireEvent.click(generateButton);

    await waitFor(() => {
      const copyButtons = screen.getAllByText('Copy');
      expect(copyButtons).toHaveLength(5);
    });
  });

  test('password length setting works correctly', async () => {
    render(<PasswordGenerator />);
    
    const lengthInput = screen.getByDisplayValue('25');
    fireEvent.change(lengthInput, { target: { value: '15' } });

    const generateButton = screen.getByText('Generate 5 Passwords');
    fireEvent.click(generateButton);

    await waitFor(() => {
      const passwordElements = screen.getAllByRole('generic').filter(el => 
        el.tagName === 'CODE' && el.textContent && el.textContent.length >= 10
      );
      passwordElements.forEach(el => {
        expect(el.textContent).toHaveLength(15);
      });
    });
  });

  test('include numbers option works', async () => {
    render(<PasswordGenerator />);
    
    // Uncheck include numbers
    const numbersCheckbox = screen.getByLabelText(/Include Numbers/);
    fireEvent.click(numbersCheckbox);

    const generateButton = screen.getByText('Generate 5 Passwords');
    fireEvent.click(generateButton);

    await waitFor(() => {
      const passwordElements = screen.getAllByRole('generic').filter(el => 
        el.tagName === 'CODE' && el.textContent && el.textContent.length >= 10
      );
      passwordElements.forEach(el => {
        expect(el.textContent).not.toMatch(/[0-9]/);
      });
    });
  });

  test('include lowercase option works', async () => {
    render(<PasswordGenerator />);
    
    // Uncheck include lowercase
    const lowercaseCheckbox = screen.getByLabelText(/Include Lowercase/);
    fireEvent.click(lowercaseCheckbox);

    const generateButton = screen.getByText('Generate 5 Passwords');
    fireEvent.click(generateButton);

    await waitFor(() => {
      const passwordElements = screen.getAllByRole('generic').filter(el => 
        el.tagName === 'CODE' && el.textContent && el.textContent.length >= 10
      );
      passwordElements.forEach(el => {
        expect(el.textContent).not.toMatch(/[a-z]/);
      });
    });
  });

  test('include uppercase option works', async () => {
    render(<PasswordGenerator />);
    
    // Uncheck include uppercase
    const uppercaseCheckbox = screen.getByLabelText(/Include Uppercase/);
    fireEvent.click(uppercaseCheckbox);

    const generateButton = screen.getByText('Generate 5 Passwords');
    fireEvent.click(generateButton);

    await waitFor(() => {
      const passwordElements = screen.getAllByRole('generic').filter(el => 
        el.tagName === 'CODE' && el.textContent && el.textContent.length >= 10
      );
      passwordElements.forEach(el => {
        expect(el.textContent).not.toMatch(/[A-Z]/);
      });
    });
  });

  test('begin with letter option works', async () => {
    render(<PasswordGenerator />);
    
    const generateButton = screen.getByText('Generate 5 Passwords');
    fireEvent.click(generateButton);

    await waitFor(() => {
      const passwordElements = screen.getAllByRole('generic').filter(el => 
        el.tagName === 'CODE' && el.textContent && el.textContent.length >= 10
      );
      passwordElements.forEach(el => {
        const firstChar = el.textContent![0];
        expect(firstChar).toMatch(/[a-zA-Z]/);
      });
    });
  });

  test('exclude similar characters option works', async () => {
    render(<PasswordGenerator />);
    
    // Check exclude similar
    const excludeSimilarCheckbox = screen.getByLabelText(/Exclude Similar/);
    fireEvent.click(excludeSimilarCheckbox);

    const generateButton = screen.getByText('Generate 5 Passwords');
    fireEvent.click(generateButton);

    await waitFor(() => {
      const passwordElements = screen.getAllByRole('generic').filter(el => 
        el.tagName === 'CODE' && el.textContent && el.textContent.length >= 10
      );
      passwordElements.forEach(el => {
        expect(el.textContent).not.toMatch(/[0O1lI|`]/);
      });
    });
  });

  test('no duplicate characters option works', async () => {
    render(<PasswordGenerator />);
    
    // Check no duplicates and set short length for easier testing
    const noDuplicatesCheckbox = screen.getByLabelText(/No Duplicate Characters/);
    fireEvent.click(noDuplicatesCheckbox);

    const lengthInput = screen.getByDisplayValue('25');
    await userEvent.clear(lengthInput);
    await userEvent.type(lengthInput, '10');

    const generateButton = screen.getByText('Generate 5 Passwords');
    fireEvent.click(generateButton);

    await waitFor(() => {
      const passwordElements = screen.getAllByRole('generic').filter(el => 
        el.tagName === 'CODE' && el.textContent && el.textContent.length >= 10
      );
      passwordElements.forEach(el => {
        const password = el.textContent!;
        const uniqueChars = new Set(password.split(''));
        expect(uniqueChars.size).toBe(password.length);
      });
    });
  });

  test('custom symbols option works', async () => {
    render(<PasswordGenerator />);
    
    // Set custom symbols to only use specific characters
    const symbolsInput = screen.getByDisplayValue('!@#$%^&*()_+-=[]{}|;:,.<>?');
    fireEvent.change(symbolsInput, { target: { value: '!@#' } });

    // Uncheck other character types to test only symbols
    const numbersCheckbox = screen.getByLabelText(/Include Numbers/);
    const lowercaseCheckbox = screen.getByLabelText(/Include Lowercase/);
    const uppercaseCheckbox = screen.getByLabelText(/Include Uppercase/);
    const beginWithLetterCheckbox = screen.getByLabelText(/Begin with Letter/);
    
    fireEvent.click(numbersCheckbox);
    fireEvent.click(lowercaseCheckbox);
    fireEvent.click(uppercaseCheckbox);
    fireEvent.click(beginWithLetterCheckbox);

    const generateButton = screen.getByText('Generate 5 Passwords');
    fireEvent.click(generateButton);

    await waitFor(() => {
      const passwordElements = screen.getAllByRole('generic').filter(el => 
        el.tagName === 'CODE' && el.textContent && el.textContent.length >= 10
      );
      passwordElements.forEach(el => {
        expect(el.textContent).toMatch(/^[!@#]+$/);
      });
    });
  });

  test('save settings option works', async () => {
    render(<PasswordGenerator />);
    
    // Enable save settings
    const saveSettingsCheckbox = screen.getByLabelText(/Save Settings/);
    fireEvent.click(saveSettingsCheckbox);

    // Change a setting by directly setting the value
    const lengthInput = screen.getByDisplayValue('25');
    fireEvent.change(lengthInput, { target: { value: '30' } });

    // Verify settings are saved to localStorage
    await waitFor(() => {
      const savedSettings = localStorage.getItem('passwordGeneratorSettings');
      expect(savedSettings).toBeTruthy();
      const parsed = JSON.parse(savedSettings!);
      expect(parsed.length).toBe(30);
      expect(parsed.saveSettings).toBe(true);
    });
  });

  test('copy to clipboard functionality works', async () => {
    render(<PasswordGenerator />);
    
    const generateButton = screen.getByText('Generate 5 Passwords');
    fireEvent.click(generateButton);

    await waitFor(() => {
      const copyButton = screen.getAllByText('Copy')[0];
      fireEvent.click(copyButton);
      expect(navigator.clipboard.writeText).toHaveBeenCalled();
    });
  });

  test('privacy notice is displayed', () => {
    render(<PasswordGenerator />);
    
    expect(screen.getByText(/Privacy Notice/)).toBeInTheDocument();
    expect(screen.getByText(/client-side/)).toBeInTheDocument();
  });

  test('loads saved settings on component mount', () => {
    // Pre-populate localStorage with settings
    const testSettings = {
      length: 40,
      includeNumbers: false,
      includeLowercase: true,
      includeUppercase: true,
      beginWithLetter: false,
      excludeSimilar: true,
      noDuplicates: true,
      removeSequential: false,
      customSymbols: '!@#$',
      saveSettings: true,
    };
    localStorage.setItem('passwordGeneratorSettings', JSON.stringify(testSettings));

    render(<PasswordGenerator />);
    
    expect(screen.getByDisplayValue('40')).toBeInTheDocument();
    expect(screen.getByDisplayValue('!@#$')).toBeInTheDocument();
    expect((screen.getByLabelText(/Save Settings/) as HTMLInputElement).checked).toBe(true);
    expect((screen.getByLabelText(/Include Numbers/) as HTMLInputElement).checked).toBe(false);
  });

  test('dark mode toggle works correctly', () => {
    render(<PasswordGenerator />);
    
    const themeButton = screen.getByLabelText(/Switch to dark mode/);
    
    // Click to switch to dark mode
    fireEvent.click(themeButton);
    
    // Check localStorage was updated
    expect(localStorage.getItem('theme')).toBe('dark');
    
    // Check button label changed
    expect(screen.getByLabelText(/Switch to light mode/)).toBeInTheDocument();
    
    // Check body background color was set
    expect(document.body.style.backgroundColor).toBe('rgb(15, 23, 42)');
    
    // Click again to switch back to light mode
    fireEvent.click(screen.getByLabelText(/Switch to light mode/));
    expect(localStorage.getItem('theme')).toBe('light');
    expect(document.body.style.backgroundColor).toBe('rgb(249, 250, 251)');
  });

  test('template save functionality works', async () => {
    render(<PasswordGenerator />);
    
    // Change some settings
    const lengthInput = screen.getByDisplayValue('25');
    fireEvent.change(lengthInput, { target: { value: '30' } });
    
    const noDuplicatesCheckbox = screen.getByLabelText(/No Duplicate Characters/);
    fireEvent.click(noDuplicatesCheckbox); // Toggle from true to false
    
    // Click save template without selecting one
    const saveTemplateButton = screen.getByText('Save Template');
    fireEvent.click(saveTemplateButton);
    
    // Modal should appear
    expect(screen.getByText('Name Your Template')).toBeInTheDocument();
    
    // Enter template name
    const templateNameInput = screen.getByPlaceholderText(/Strong Security/);
    fireEvent.change(templateNameInput, { target: { value: 'My Test Template' } });
    
    // Save the template
    const modalSaveButton = screen.getByRole('button', { name: 'Save' });
    fireEvent.click(modalSaveButton);
    
    // Check template was saved to localStorage
    const savedTemplates = JSON.parse(localStorage.getItem('passwordTemplates') || '[]');
    expect(savedTemplates).toHaveLength(1);
    expect(savedTemplates[0].name).toBe('My Test Template');
    expect(savedTemplates[0].options.length).toBe(30);
    expect(savedTemplates[0].options.excludeSimilar).toBe(true); // default value unchanged
    expect(savedTemplates[0].options.noDuplicates).toBe(false); // changed value
    expect(savedTemplates[0].options.includeNumbers).toBe(true); // default value
    
    // Check template is selected in dropdown
    const templateDropdown = screen.getByLabelText('Select template') as HTMLSelectElement;
    expect(templateDropdown.value).toBe('My Test Template');
  });

  test('template load functionality works', async () => {
    // Pre-populate localStorage with a template
    const testTemplate = [{
      name: 'Strong Password',
      options: {
        length: 50,
        includeNumbers: true,
        includeLowercase: true,
        includeUppercase: true,
        beginWithLetter: false,
        excludeSimilar: true,
        noDuplicates: true,
        removeSequential: true,
        customSymbols: '!@#$%',
      }
    }];
    localStorage.setItem('passwordTemplates', JSON.stringify(testTemplate));
    
    render(<PasswordGenerator />);
    
    // Select the template
    const templateDropdown = screen.getByLabelText('Select template');
    fireEvent.change(templateDropdown, { target: { value: 'Strong Password' } });
    
    // Check all settings were loaded
    expect(screen.getByDisplayValue('50')).toBeInTheDocument();
    expect(screen.getByDisplayValue('!@#$%')).toBeInTheDocument();
    expect((screen.getByLabelText(/Exclude Similar/) as HTMLInputElement).checked).toBe(true);
    expect((screen.getByLabelText(/No Duplicate Characters/) as HTMLInputElement).checked).toBe(true);
    expect((screen.getByLabelText(/Remove Sequential Characters/) as HTMLInputElement).checked).toBe(true);
    expect((screen.getByLabelText(/Begin with Letter/) as HTMLInputElement).checked).toBe(false);
  });

  test('template modal can be cancelled', () => {
    render(<PasswordGenerator />);
    
    // Click save template
    const saveTemplateButton = screen.getByText('Save Template');
    fireEvent.click(saveTemplateButton);
    
    // Modal should appear
    expect(screen.getByText('Name Your Template')).toBeInTheDocument();
    
    // Click cancel
    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);
    
    // Modal should be gone
    expect(screen.queryByText('Name Your Template')).not.toBeInTheDocument();
  });

  test('empty custom symbols generates passwords without symbols', async () => {
    render(<PasswordGenerator />);
    
    // Clear custom symbols
    const symbolsInput = screen.getByDisplayValue('!@#$%^&*()_+-=[]{}|;:,.<>?');
    fireEvent.change(symbolsInput, { target: { value: '' } });
    
    // Keep only letters and numbers for clear testing
    const beginWithLetterCheckbox = screen.getByLabelText(/Begin with Letter/);
    fireEvent.click(beginWithLetterCheckbox); // Uncheck
    
    const generateButton = screen.getByText('Generate 5 Passwords');
    fireEvent.click(generateButton);
    
    await waitFor(() => {
      const passwordElements = screen.getAllByRole('generic').filter(el => 
        el.tagName === 'CODE' && el.textContent && el.textContent.length >= 10
      );
      passwordElements.forEach(el => {
        // Should only contain letters and numbers
        expect(el.textContent).toMatch(/^[a-zA-Z0-9]+$/);
      });
    });
  });

  test('remove sequential characters option works', async () => {
    render(<PasswordGenerator />);
    
    // Enable remove sequential
    const removeSequentialCheckbox = screen.getByLabelText(/Remove Sequential Characters/);
    fireEvent.click(removeSequentialCheckbox);
    
    // Set a shorter length to increase chance of sequences
    const lengthInput = screen.getByDisplayValue('25');
    fireEvent.change(lengthInput, { target: { value: '10' } });
    
    const generateButton = screen.getByText('Generate 5 Passwords');
    fireEvent.click(generateButton);
    
    await waitFor(() => {
      const passwordElements = screen.getAllByRole('generic').filter(el => 
        el.tagName === 'CODE' && el.textContent && el.textContent.length >= 10
      );
      passwordElements.forEach(el => {
        const password = el.textContent!;
        // Check for common sequences
        expect(password).not.toMatch(/abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz/i);
        expect(password).not.toMatch(/123|234|345|456|567|678|789/);
      });
    });
  });

  test('clipboard error handling works', async () => {
    // Mock clipboard to fail
    const originalWriteText = navigator.clipboard.writeText;
    navigator.clipboard.writeText = jest.fn(() => Promise.reject(new Error('Clipboard error')));
    
    // Spy on console.error
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    
    render(<PasswordGenerator />);
    
    const generateButton = screen.getByText('Generate 5 Passwords');
    fireEvent.click(generateButton);
    
    await waitFor(() => {
      const copyButton = screen.getAllByText('Copy')[0];
      fireEvent.click(copyButton);
    });
    
    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to copy password:', expect.any(Error));
    });
    
    // Restore
    navigator.clipboard.writeText = originalWriteText;
    consoleErrorSpy.mockRestore();
  });

  test('keyboard navigation and accessibility features work', async () => {
    render(<PasswordGenerator />);
    
    // Test skip link
    const skipLink = screen.getByText('Skip to main content');
    skipLink.focus();
    expect(document.activeElement).toBe(skipLink);
    
    // Test that form controls have proper ARIA labels
    expect(screen.getByLabelText('Password length')).toBeInTheDocument();
    expect(screen.getByLabelText('Custom symbols')).toBeInTheDocument();
    expect(screen.getByLabelText('Select template')).toBeInTheDocument();
    
    // Test that help text is linked via aria-describedby
    const lengthInput = screen.getByLabelText('Password length');
    expect(lengthInput.getAttribute('aria-describedby')).toBe('length-help');
    expect(screen.getByText('Number of characters in the generated password (10-100)')).toHaveAttribute('id', 'length-help');
    
    // Generate passwords and test focus management
    const generateButton = screen.getByText('Generate 5 Passwords');
    fireEvent.click(generateButton);
    
    await waitFor(() => {
      // Password section should be announced to screen readers
      const passwordSection = screen.getByLabelText('Generated Passwords');
      expect(passwordSection).toHaveAttribute('aria-live', 'polite');
      expect(passwordSection).toHaveAttribute('aria-atomic', 'true');
    });
  });

  test('focus styles are applied on keyboard navigation', () => {
    render(<PasswordGenerator />);
    
    const lengthInput = screen.getByLabelText('Password length');
    
    // Simulate keyboard focus
    fireEvent.focus(lengthInput);
    
    // Check that focus styles are applied
    expect(lengthInput.style.outline).toContain('2px solid');
    expect(lengthInput.style.outlineOffset).toBe('2px');
    
    // Simulate blur
    fireEvent.blur(lengthInput);
    
    // Check that focus styles are removed
    expect(lengthInput.style.outline).toBe('none');
  });

  test('password length is clamped between 10 and 100', async () => {
    render(<PasswordGenerator />);
    
    const lengthInput = screen.getByLabelText('Password length') as HTMLInputElement;
    
    // User can type any value during input
    fireEvent.change(lengthInput, { target: { value: '5' } });
    expect(lengthInput.value).toBe('5');
    
    // But on blur, it gets clamped to minimum
    fireEvent.blur(lengthInput);
    expect(lengthInput.value).toBe('10');
    
    // Try to set length above maximum
    fireEvent.change(lengthInput, { target: { value: '150' } });
    expect(lengthInput.value).toBe('150');
    
    // On blur, it gets clamped to maximum
    fireEvent.blur(lengthInput);
    expect(lengthInput.value).toBe('100');
    
    // Valid values remain unchanged
    fireEvent.change(lengthInput, { target: { value: '50' } });
    fireEvent.blur(lengthInput);
    expect(lengthInput.value).toBe('50');
    
    // Test that password generation respects the clamping
    fireEvent.change(lengthInput, { target: { value: '5' } });
    const generateButton = screen.getByText('Generate 5 Passwords');
    fireEvent.click(generateButton);
    
    await waitFor(() => {
      const passwordElements = screen.getAllByRole('generic').filter(el => 
        el.tagName === 'CODE' && el.textContent && el.textContent.length >= 10
      );
      passwordElements.forEach(el => {
        // Even though input shows 5, passwords should be at least 10 characters
        expect(el.textContent!.length).toBeGreaterThanOrEqual(10);
      });
    });
  });
});