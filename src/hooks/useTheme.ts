import { useState, useEffect } from 'react';

export type Theme = 'light' | 'dark';

export interface ThemeColors {
  background: string;
  cardBackground: string;
  text: string;
  textSecondary: string;
  textMuted: string;
  border: string;
  primary: string;
  primaryHover: string;
  danger: string;
  dangerHover: string;
  success: string;
  successHover: string;
  inputBg: string;
  inputBorder: string;
  shadowColor: string;
}

export const colors: Record<Theme, ThemeColors> = {
  light: {
    background: '#f9fafb',
    cardBackground: '#ffffff',
    text: '#1f2937',
    textSecondary: '#374151',
    textMuted: '#6b7280',
    border: '#e5e7eb',
    primary: '#3b82f6',
    primaryHover: '#2563eb',
    danger: '#ef4444',
    dangerHover: '#dc2626',
    success: '#10b981',
    successHover: '#059669',
    inputBg: '#ffffff',
    inputBorder: '#e1e5e9',
    shadowColor: 'rgba(0, 0, 0, 0.1)',
  },
  dark: {
    background: '#0f172a',
    cardBackground: '#1e293b',
    text: '#f1f5f9',
    textSecondary: '#e2e8f0',
    textMuted: '#94a3b8',
    border: '#334155',
    primary: '#60a5fa',
    primaryHover: '#3b82f6',
    danger: '#f87171',
    dangerHover: '#ef4444',
    success: '#34d399',
    successHover: '#10b981',
    inputBg: '#334155',
    inputBorder: '#475569',
    shadowColor: 'rgba(0, 0, 0, 0.3)',
  },
};

const useTheme = () => {
  const [theme, setTheme] = useState<Theme>(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light' || savedTheme === 'dark') {
      return savedTheme;
    }
    // Check if matchMedia is available (for tests and older browsers)
    try {
      if (typeof window !== 'undefined' && window.matchMedia) {
        const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');
        return darkModeQuery.matches ? 'dark' : 'light';
      }
    } catch (e) {
      // Fallback for environments where matchMedia might not work properly
    }
    return 'light';
  });

  useEffect(() => {
    localStorage.setItem('theme', theme);
    // Update body background color
    document.body.style.backgroundColor = theme === 'light' ? '#f9fafb' : '#0f172a';
    document.body.style.transition = 'background-color 0.3s ease';
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

  const currentColors = colors[theme];

  return { theme, toggleTheme, currentColors };
};

export default useTheme;
