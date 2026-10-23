import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';
import { CUENTA_JUEVES_STORAGE_KEY } from './repartija/cuentaJueves';

beforeEach(() => {
  localStorage.clear();
  window.history.pushState({}, '', '/');
});

function abrirJueves(ruta = '/repartijajueves') {
  window.history.pushState({}, '', ruta);
  render(<App />);
}

async function anotar(total: string, nombres: string[]) {
  await userEvent.type(screen.getByLabelText('Total'), total);
  for (const nombre of nombres) {
    await userEvent.type(screen.getByLabelText('Nombre'), nombre);
    await userEvent.click(screen.getByRole('button', { name: 'Agregar' }));
  }
}

describe('ruta', () => {
  it('debería mostrar la cuenta del jueves cuando la ruta es /repartijajueves', () => {
    abrirJueves();
    expect(screen.getByRole('heading', { name: 'Cuenta del jueves' })).toBeInTheDocument();
    expect(screen.getByText('Cuentas claras, no magia…')).toBeInTheDocument();
    expect(
      screen.queryByRole('heading', { name: '¿Cuánto puso cada uno?' }),
    ).not.toBeInTheDocument();
  });

  it('debería mostrar la cuenta del jueves cuando la ruta termina en barra', () => {
    abrirJueves('/repartijajueves/');
    expect(screen.getByRole('heading', { name: 'Cuenta del jueves' })).toBeInTheDocument();
  });

  it('no debería enlazar la cuenta del jueves cuando se abre el mago', () => {
    render(<App />);
    expect(screen.getByRole('heading', { name: '¿Cuánto puso cada uno?' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Cuenta del jueves' })).not.toBeInTheDocument();
    expect(document.querySelector('a[href*="repartijajueves"]')).toBeNull();
  });
});

describe('Cuenta del jueves', () => {
  it('debería anotar en cero y listar morosos cuando se agregan los nombres', async () => {
    abrirJueves();
    await anotar('100000', ['Ferra', 'Manita']);

    expect(screen.getByText('Total a juntar $100.000')).toBeInTheDocument();
    expect(screen.getByText('Cuota $50.000')).toBeInTheDocument();
    expect(screen.getByText('Anotado $0')).toBeInTheDocument();
    expect(screen.getByText('Falta $100.000')).toBeInTheDocument();
    expect(screen.getByText('Ferra · faltan $50.000')).toBeInTheDocument();
    expect(screen.getByText('Manita · faltan $50.000')).toBeInTheDocument();
    expect(screen.getByLabelText('Monto de Ferra')).toHaveValue('');
  });

  it('debería completar la cuota y volver a cero cuando se toca Pagó', async () => {
    abrirJueves();
    await anotar('100000', ['Ferra', 'Manita']);
    await userEvent.click(screen.getByRole('button', { name: 'Pagó de Ferra' }));

    expect(screen.getByLabelText('Monto de Ferra')).toHaveValue('50000');
    expect(screen.queryByText('Ferra · faltan $50.000')).not.toBeInTheDocument();
    expect(screen.getByText('Manita · faltan $50.000')).toBeInTheDocument();
    expect(screen.getByText('Anotado $50.000')).toBeInTheDocument();
    expect(screen.getByText('Falta $50.000')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Pagó de Ferra' }));
    expect(screen.getByLabelText('Monto de Ferra')).toHaveValue('');
    expect(screen.getByText('Ferra · faltan $50.000')).toBeInTheDocument();
  });

  it('debería actualizar el total a juntar sin pisar el monto cuando se prende redondeo', async () => {
    abrirJueves();
    await anotar('100', ['Ana', 'Bea', 'Cami']);
    await userEvent.type(screen.getByLabelText('Monto de Ana'), '10');
    await userEvent.click(screen.getByRole('checkbox', { name: 'Redondeo' }));

    expect(screen.getByText('Total a juntar $300')).toBeInTheDocument();
    expect(screen.getByText('Cuota $100')).toBeInTheDocument();
    expect(screen.getByLabelText('Monto de Ana')).toHaveValue('10');
    expect(screen.getByLabelText('Total')).toHaveValue('100');
  });

  it('debería topear el monto cuando se escribe más que la cuota', async () => {
    abrirJueves();
    await anotar('100', ['Ferra']);
    await userEvent.type(screen.getByLabelText('Monto de Ferra'), '150');
    expect(screen.getByLabelText('Monto de Ferra')).toHaveValue('100');
    expect(screen.queryByRole('heading', { name: 'Pasan la cuota' })).not.toBeInTheDocument();
  });

  it('debería mostrar quien pasa la cuota cuando el monto guardado quedó alto', async () => {
    localStorage.setItem(
      CUENTA_JUEVES_STORAGE_KEY,
      JSON.stringify({
        totalCentavos: 10_000,
        redondeo: false,
        personas: [{ id: '1', nombre: 'Ferra', montoCentavos: 15_000 }],
      }),
    );
    abrirJueves();
    expect(screen.getByLabelText('Monto de Ferra')).toHaveValue('150');
    expect(screen.getByRole('heading', { name: 'Pasan la cuota' })).toBeInTheDocument();
    expect(screen.getByText('Ferra · pasan $50')).toBeInTheDocument();
    expect(screen.getByText('Sobran $50')).toBeInTheDocument();

    await userEvent.clear(screen.getByLabelText('Monto de Ferra'));
    await userEvent.type(screen.getByLabelText('Monto de Ferra'), '200');
    expect(screen.getByLabelText('Monto de Ferra')).toHaveValue('100');
  });

  it('debería conservar el monto cuando cambia el total', async () => {
    abrirJueves();
    await anotar('100', ['Ferra']);
    await userEvent.type(screen.getByLabelText('Monto de Ferra'), '10');
    await userEvent.clear(screen.getByLabelText('Total'));
    await userEvent.type(screen.getByLabelText('Total'), '80');
    expect(screen.getByLabelText('Monto de Ferra')).toHaveValue('10');
  });

  it('debería rechazar el nombre cuando está vacío o duplicado', async () => {
    abrirJueves();
    await userEvent.click(screen.getByRole('button', { name: 'Agregar' }));
    expect(screen.getByText('Nombre vacío o duplicado.')).toBeInTheDocument();
    await anotar('100', ['Ferra']);
    await userEvent.type(screen.getByLabelText('Nombre'), 'Ferra');
    await userEvent.click(screen.getByRole('button', { name: 'Agregar' }));
    expect(screen.getByText('Nombre vacío o duplicado.')).toBeInTheDocument();
    expect(screen.getAllByLabelText(/Monto de /)).toHaveLength(1);
  });

  it('debería conservar la cuenta cuando se cancela vaciar y borrarla cuando se confirma', async () => {
    abrirJueves();
    await anotar('100', ['Ferra']);
    await userEvent.click(screen.getByRole('button', { name: 'Vaciar cuenta' }));
    expect(screen.getByText('¿Vaciar la cuenta?')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Cancelar' }));
    expect(screen.getByLabelText('Nombre de Ferra')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Vaciar cuenta' }));
    await userEvent.click(screen.getByRole('button', { name: 'Sí, vaciar' }));
    expect(screen.queryByLabelText('Nombre de Ferra')).not.toBeInTheDocument();
    expect(screen.getByLabelText('Total')).toHaveValue('');
    expect(screen.getByText('Cuota —')).toBeInTheDocument();
  });

  it('debería recuperar la cuenta cuando se vuelve a abrir la pantalla', async () => {
    window.history.pushState({}, '', '/repartijajueves');
    const primera = render(<App />);
    await anotar('100', ['Ferra']);
    primera.unmount();
    render(<App />);
    expect(screen.getByLabelText('Nombre de Ferra')).toBeInTheDocument();
    expect(screen.getByLabelText('Total')).toHaveValue('100');
  });
});
