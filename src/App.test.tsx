import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';

test('muestra la marca del mago', () => {
  render(<App />);
  expect(screen.getByText(/El mago de la repartija/i)).toBeInTheDocument();
  expect(screen.getByText(/cuentas claras, no magia/i)).toBeInTheDocument();
  expect(screen.getByAltText(/Sombrero del mago/i)).toBeInTheDocument();
});

test('debería mostrar el nombre y el monto en la misma fila cuando se agrega una persona', async () => {
  render(<App />);
  expect(screen.getByRole('heading', { name: '¿Cuánto puso cada uno?' })).toBeInTheDocument();
  await userEvent.type(screen.getByLabelText('Nombre'), 'Ferra');
  await userEvent.click(screen.getByRole('button', { name: 'Agregar' }));

  expect(screen.getByLabelText('Nombre de Ferra')).toBeInTheDocument();
  expect(screen.getByLabelText('Monto de Ferra')).toHaveValue('');
  expect(screen.getByRole('button', { name: 'Agregar' })).toHaveClass('MuiButton-containedPrimary');
  expect(screen.getByRole('button', { name: 'Agregar' })).not.toHaveClass('MuiButton-fullWidth');
  expect(screen.queryByRole('button', { name: 'Seguir' })).not.toBeInTheDocument();
  expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();
  expect(screen.queryByRole('button', { name: 'Agregar grupo' })).not.toBeInTheDocument();
  expect(screen.queryByRole('button', { name: 'Todos' })).not.toBeInTheDocument();
  expect(screen.queryByText('Grupo 1')).not.toBeInTheDocument();
});

test('debería rechazar el nombre cuando está vacío o duplicado y debería borrar el aviso cuando se corrige', async () => {
  render(<App />);
  await userEvent.click(screen.getByRole('button', { name: 'Agregar' }));
  expect(screen.getByText('Nombre vacío o duplicado.')).toBeInTheDocument();

  await userEvent.type(screen.getByLabelText('Nombre'), 'Ferra');
  expect(screen.queryByText('Nombre vacío o duplicado.')).not.toBeInTheDocument();
  await userEvent.click(screen.getByRole('button', { name: 'Agregar' }));

  await userEvent.type(screen.getByLabelText('Nombre'), 'Ferra');
  await userEvent.click(screen.getByRole('button', { name: 'Agregar' }));
  expect(screen.getByText('Nombre vacío o duplicado.')).toBeInTheDocument();
  expect(screen.getAllByLabelText(/Nombre de /)).toHaveLength(1);
});

test('debería conservar el monto cuando se corrige un nombre en la misma fila', async () => {
  render(<App />);
  await userEvent.type(screen.getByLabelText('Nombre'), 'Ferra');
  await userEvent.click(screen.getByRole('button', { name: 'Agregar' }));
  await userEvent.type(screen.getByLabelText('Monto de Ferra'), '1300');
  const nombre = screen.getByLabelText('Nombre de Ferra');
  await userEvent.clear(nombre);
  await userEvent.type(nombre, 'Fer');
  await userEvent.tab();
  expect(screen.getByLabelText('Nombre de Fer')).toHaveValue('Fer');
  expect(screen.getByLabelText('Monto de Fer')).toHaveValue('1300');
});

test('debería rechazar el nombre nuevo cuando está vacío o duplicado', async () => {
  render(<App />);
  await userEvent.type(screen.getByLabelText('Nombre'), 'Ferra');
  await userEvent.click(screen.getByRole('button', { name: 'Agregar' }));
  await userEvent.type(screen.getByLabelText('Nombre'), 'Manita');
  await userEvent.click(screen.getByRole('button', { name: 'Agregar' }));

  const ferra = screen.getByLabelText('Nombre de Ferra');
  await userEvent.clear(ferra);
  await userEvent.type(ferra, 'Manita');
  await userEvent.tab();
  expect(screen.getByText('Nombre vacío o duplicado.')).toBeInTheDocument();
  expect(screen.getByLabelText('Nombre de Ferra')).toHaveValue('Ferra');

  await userEvent.clear(screen.getByLabelText('Nombre de Ferra'));
  await userEvent.tab();
  expect(screen.getByLabelText('Nombre de Ferra')).toHaveValue('Ferra');
  await userEvent.type(screen.getByLabelText('Nombre de Ferra'), 'z');
  expect(screen.queryByText('Nombre vacío o duplicado.')).not.toBeInTheDocument();
});

test('no debería reemplazar el monto cuando el valor escrito no es un entero de cero para arriba', async () => {
  render(<App />);
  await userEvent.type(screen.getByLabelText('Nombre'), 'Ferra');
  await userEvent.click(screen.getByRole('button', { name: 'Agregar' }));
  const monto = screen.getByLabelText('Monto de Ferra');
  await userEvent.type(monto, '1300');
  await userEvent.type(monto, 'a');
  expect(monto).toHaveValue('1300');
  await userEvent.type(monto, '.');
  expect(monto).toHaveValue('1300');
});

test('no debería mostrar el indicador superior de pasos cuando se renderiza la app', () => {
  render(<App />);
  expect(screen.queryByRole('navigation', { name: /Pasos/i })).not.toBeInTheDocument();
  expect(screen.queryByText(/1 · Integrantes/i)).not.toBeInTheDocument();
  expect(screen.queryByText(/2 · Subgrupos/i)).not.toBeInTheDocument();
  expect(screen.queryByText(/3 · Resultado/i)).not.toBeInTheDocument();
});

test('debería mostrar las transferencias de la cuenta única cuando Cami no puso plata', async () => {
  render(<App />);
  await userEvent.type(screen.getByLabelText('Nombre'), 'Ferra');
  await userEvent.click(screen.getByRole('button', { name: 'Agregar' }));
  await userEvent.type(screen.getByLabelText('Nombre'), 'Manita');
  await userEvent.click(screen.getByRole('button', { name: 'Agregar' }));
  await userEvent.type(screen.getByLabelText('Nombre'), 'Cami');
  await userEvent.click(screen.getByRole('button', { name: 'Agregar' }));
  await userEvent.type(screen.getByLabelText('Monto de Ferra'), '1300');
  await userEvent.type(screen.getByLabelText('Monto de Manita'), '500');
  await userEvent.click(screen.getByRole('button', { name: 'Calcular transferencias' }));

  expect(screen.getByText('Cami le transfiere $600 a Ferra')).toBeInTheDocument();
  expect(screen.getByText('Manita le transfiere $100 a Ferra')).toBeInTheDocument();
  expect(screen.queryByText('Cuenta')).not.toBeInTheDocument();
});

test('debería abrir las cuentas con todos marcados y los montos ya escritos cuando se pide otra cuenta', async () => {
  render(<App />);
  await userEvent.type(screen.getByLabelText('Nombre'), 'Ferra');
  await userEvent.click(screen.getByRole('button', { name: 'Agregar' }));
  await userEvent.type(screen.getByLabelText('Nombre'), 'Manita');
  await userEvent.click(screen.getByRole('button', { name: 'Agregar' }));
  await userEvent.type(screen.getByLabelText('Monto de Ferra'), '1300');
  await userEvent.type(screen.getByLabelText('Monto de Manita'), '500');
  await userEvent.click(screen.getByRole('button', { name: '¿Hay otra cuenta, como el alcohol?' }));

  expect(screen.getByRole('heading', { name: 'Cuentas de la juntada' })).toBeInTheDocument();
  expect(screen.getByLabelText('Nombre de la cuenta')).toHaveValue('Cuenta');
  expect(screen.getByRole('checkbox', { name: 'Ferra' })).toBeChecked();
  expect(screen.getByRole('checkbox', { name: 'Manita' })).toBeChecked();
  expect(screen.getByLabelText('Monto de Ferra en Cuenta')).toHaveValue('1300');
  expect(screen.getByLabelText('Monto de Manita en Cuenta')).toHaveValue('500');
  expect(screen.queryByRole('button', { name: '¿Hay otra cuenta, como el alcohol?' })).not.toBeInTheDocument();
});

async function irACuentasConFerraYManita() {
  render(<App />);
  await userEvent.type(screen.getByLabelText('Nombre'), 'Ferra');
  await userEvent.click(screen.getByRole('button', { name: 'Agregar' }));
  await userEvent.type(screen.getByLabelText('Nombre'), 'Manita');
  await userEvent.click(screen.getByRole('button', { name: 'Agregar' }));
  await userEvent.type(screen.getByLabelText('Monto de Ferra'), '1300');
  await userEvent.click(screen.getByRole('button', { name: '¿Hay otra cuenta, como el alcohol?' }));
}

test('debería crear la cuenta nueva sin nadie marcado cuando se toca Agregar cuenta', async () => {
  await irACuentasConFerraYManita();
  await userEvent.click(screen.getByRole('button', { name: 'Agregar cuenta' }));
  const ferra = screen.getAllByRole('checkbox', { name: 'Ferra' });
  const manita = screen.getAllByRole('checkbox', { name: 'Manita' });
  expect(ferra[0]).toBeChecked();
  expect(manita[0]).toBeChecked();
  expect(ferra[1]).not.toBeChecked();
  expect(manita[1]).not.toBeChecked();
  expect(screen.getAllByLabelText('Nombre de la cuenta')[1]).toHaveValue('Cuenta 2');
});

test('debería pedir confirmación cuando se vuelve a una cuenta y hay más de una', async () => {
  await irACuentasConFerraYManita();
  await userEvent.click(screen.getByRole('button', { name: 'Agregar cuenta' }));
  await userEvent.click(screen.getByRole('button', { name: 'Volver a una cuenta' }));
  expect(
    screen.getByText('Se borran Cuenta 2. Queda una sola cuenta con los montos de la primera.'),
  ).toBeInTheDocument();
  await userEvent.click(screen.getByRole('button', { name: 'Cancelar' }));
  expect(screen.getByRole('heading', { name: 'Cuentas de la juntada' })).toBeInTheDocument();
  await userEvent.click(screen.getByRole('button', { name: 'Volver a una cuenta' }));
  await userEvent.click(screen.getByRole('button', { name: 'Borrar las otras' }));
  expect(screen.getByRole('heading', { name: '¿Cuánto puso cada uno?' })).toBeInTheDocument();
  expect(screen.getByLabelText('Monto de Ferra')).toHaveValue('1300');
  expect(screen.getByLabelText('Monto de Manita')).toHaveValue('');
});

test('debería volver a la lista sin confirmación cuando hay una sola cuenta', async () => {
  await irACuentasConFerraYManita();
  await userEvent.click(screen.getByRole('checkbox', { name: 'Manita' }));
  await userEvent.click(screen.getByRole('button', { name: 'Volver a una cuenta' }));
  expect(screen.queryByText(/Se borran/)).not.toBeInTheDocument();
  expect(screen.getByLabelText('Monto de Ferra')).toHaveValue('1300');
  expect(screen.getByLabelText('Monto de Manita')).toHaveValue('');
});

test('debería avisar cuando hay menos de dos nombres al calcular', async () => {
  render(<App />);
  await userEvent.type(screen.getByLabelText('Nombre'), 'Ferra');
  await userEvent.click(screen.getByRole('button', { name: 'Agregar' }));
  await userEvent.click(screen.getByRole('button', { name: 'Calcular transferencias' }));
  expect(screen.getByText('Hacen falta dos nombres para calcular.')).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: '¿Cuánto puso cada uno?' })).toBeInTheDocument();
  expect(screen.queryByRole('heading', { name: 'Transferencias' })).not.toBeInTheDocument();
});

test('debería marcar a la persona nueva solo en la primera cuenta cuando se agrega un nombre desde las cuentas', async () => {
  render(<App />);
  await userEvent.type(screen.getByLabelText('Nombre'), 'Ferra');
  await userEvent.click(screen.getByRole('button', { name: 'Agregar' }));
  await userEvent.type(screen.getByLabelText('Nombre'), 'Manita');
  await userEvent.click(screen.getByRole('button', { name: 'Agregar' }));
  await userEvent.click(screen.getByRole('button', { name: '¿Hay otra cuenta, como el alcohol?' }));
  await userEvent.click(screen.getByRole('button', { name: 'Agregar cuenta' }));
  await userEvent.type(screen.getByLabelText('Nombre'), 'Cami');
  await userEvent.click(screen.getByRole('button', { name: 'Agregar' }));
  const cami = screen.getAllByRole('checkbox', { name: 'Cami' });
  expect(cami[0]).toBeChecked();
  expect(cami[1]).not.toBeChecked();
  expect(screen.getByLabelText('Monto de Cami en Cuenta')).toHaveValue('');
});

test('debería nombrar la cuenta en el desglose cuando el cálculo salió de las cuentas', async () => {
  render(<App />);
  for (const nombre of ['Ferra', 'Manita', 'Cami']) {
    await userEvent.type(screen.getByLabelText('Nombre'), nombre);
    await userEvent.click(screen.getByRole('button', { name: 'Agregar' }));
  }
  await userEvent.click(screen.getByRole('button', { name: '¿Hay otra cuenta, como el alcohol?' }));
  const nombreCuenta = screen.getByLabelText('Nombre de la cuenta');
  await userEvent.clear(nombreCuenta);
  await userEvent.type(nombreCuenta, 'Comida');
  await userEvent.tab();
  await userEvent.click(screen.getByRole('button', { name: 'Agregar cuenta' }));
  const segunda = screen.getAllByLabelText('Nombre de la cuenta')[1];
  await userEvent.clear(segunda);
  await userEvent.type(segunda, 'Alcohol');
  await userEvent.tab();
  await userEvent.click(screen.getAllByRole('checkbox', { name: 'Ferra' })[1]);
  await userEvent.click(screen.getAllByRole('checkbox', { name: 'Manita' })[1]);
  await userEvent.type(screen.getByLabelText('Monto de Ferra en Alcohol'), '16500');
  await userEvent.type(screen.getByLabelText('Monto de Manita en Alcohol'), '8000');
  await userEvent.clear(screen.getByLabelText('Monto de Ferra en Comida'));
  await userEvent.type(screen.getByLabelText('Monto de Manita en Comida'), '27500');
  await userEvent.type(screen.getByLabelText('Monto de Cami en Comida'), '10000');
  await userEvent.click(screen.getByRole('button', { name: 'Calcular transferencias' }));

  expect(screen.getByText('Ferra le transfiere $8250 a Manita')).toBeInTheDocument();
  expect(screen.getByText('Cami le transfiere $2500 a Manita')).toBeInTheDocument();
  const copiar = screen.getByRole('button', { name: 'Copiar resultado' });
  const alias = screen.getByText('Alias de cobro');
  const desglose = screen.getByRole('button', { name: 'Cómo se calculó' });
  expect(alias.compareDocumentPosition(copiar) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  expect(copiar.compareDocumentPosition(desglose) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  expect(desglose).toHaveAttribute('aria-expanded', 'false');
  await userEvent.click(desglose);
  expect(screen.getByText('Comida')).toBeInTheDocument();
  expect(screen.getByText('Alcohol')).toBeInTheDocument();
  await userEvent.click(screen.getByRole('button', { name: 'Editar' }));
  expect(screen.getByRole('heading', { name: 'Cuentas de la juntada' })).toBeInTheDocument();
});

test('debería volver a la lista desde Editar cuando se calculó la cuenta única', async () => {
  render(<App />);
  await userEvent.type(screen.getByLabelText('Nombre'), 'Ferra');
  await userEvent.click(screen.getByRole('button', { name: 'Agregar' }));
  await userEvent.type(screen.getByLabelText('Nombre'), 'Manita');
  await userEvent.click(screen.getByRole('button', { name: 'Agregar' }));
  await userEvent.type(screen.getByLabelText('Monto de Ferra'), '100');
  await userEvent.click(screen.getByRole('button', { name: 'Calcular transferencias' }));
  await userEvent.click(screen.getByRole('button', { name: 'Editar' }));
  expect(screen.getByRole('heading', { name: '¿Cuánto puso cada uno?' })).toBeInTheDocument();
  expect(screen.getByLabelText('Monto de Ferra')).toHaveValue('100');
});
