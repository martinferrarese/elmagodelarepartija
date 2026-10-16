import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

test('muestra la marca del mago', () => {
  render(<App />);
  expect(screen.getByText(/El mago de la repartija/i)).toBeInTheDocument();
  expect(screen.getByText(/cuentas claras, no magia/i)).toBeInTheDocument();
  expect(screen.getByAltText(/Sombrero del mago/i)).toBeInTheDocument();
});

test('debería usar color secondary en Seguir y primary en Agregar cuando se muestra el paso de integrantes', () => {
  render(<App />);
  const botonAgregar = screen.getByRole('button', { name: 'Agregar' });
  const botonSeguir = screen.getByRole('button', { name: 'Seguir' });
  expect(botonAgregar).toHaveClass('MuiButton-containedPrimary');
  expect(botonSeguir).toHaveClass('MuiButton-containedSecondary');
});
