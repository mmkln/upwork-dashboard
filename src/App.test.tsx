import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders the sign in screen for unauthenticated users', async () => {
  render(<App />);

  expect(
    await screen.findByRole('heading', { name: /sign in to upboard/i }),
  ).toBeInTheDocument();
});
