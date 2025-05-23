import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders password generator app', () => {
  render(<App />);
  const titleElements = screen.getAllByText(/Secure Password Generator/i);
  expect(titleElements.length).toBeGreaterThan(0);
  expect(titleElements[0]).toBeInTheDocument();
});