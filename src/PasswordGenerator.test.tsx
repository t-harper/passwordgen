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
    
    expect(screen.getByText('Password Generator')).toBeInTheDocument();
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
});