import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

test('test de ejemplo de react', () => {
  render(<App />);
  const linkElement = screen.getByText(/El mago de la repartija/i);
  expect(linkElement).toBeInTheDocument();
});
