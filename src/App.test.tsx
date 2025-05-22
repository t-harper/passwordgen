import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders password generator app', () => {
  render(<App />);
  const titleElement = screen.getByText(/Password Generator/i);
  expect(titleElement).toBeInTheDocument();
});