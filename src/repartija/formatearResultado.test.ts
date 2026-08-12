import { Transferencia } from './types';
import {
  acreedoresDeTransferencias,
  formatearResultadoParaCopiar,
} from './formatearResultado';

describe('acreedoresDeTransferencias', () => {
  it('devuelve acreedores únicos ordenados por nombre', () => {
    const transferencias: Transferencia[] = [
      { de: 'Cami', a: 'Manita', monto: 2500 },
      { de: 'Ferra', a: 'Manita', monto: 8250 },
      { de: 'Ana', a: 'Bruno', monto: 100 },
    ];
    expect(acreedoresDeTransferencias(transferencias)).toEqual(['Bruno', 'Manita']);
  });

  it('lista vacía sin transferencias', () => {
    expect(acreedoresDeTransferencias([])).toEqual([]);
  });
});

describe('formatearResultadoParaCopiar', () => {
  it('incluye transferencias y alias del acreedor', () => {
    const transferencias: Transferencia[] = [
      { de: 'Ferra', a: 'Manita', monto: 8250 },
      { de: 'Cami', a: 'Manita', monto: 2500 },
    ];
    const texto = formatearResultadoParaCopiar(transferencias, { Manita: 'manita.mp' });
    expect(texto).toBe(
      [
        'Transferencias',
        '• Ferra le transfiere $8250 a Manita (alias: manita.mp)',
        '• Cami le transfiere $2500 a Manita (alias: manita.mp)',
      ].join('\n'),
    );
    expect(texto.toLowerCase()).not.toContain('desglose');
  });

  it('omite alias vacío o solo espacios', () => {
    const transferencias: Transferencia[] = [
      { de: 'Ferra', a: 'Manita', monto: 8250 },
    ];
    const texto = formatearResultadoParaCopiar(transferencias, { Manita: '   ' });
    expect(texto).toBe(
      ['Transferencias', '• Ferra le transfiere $8250 a Manita'].join('\n'),
    );
    expect(texto).not.toContain('alias:');
  });

  it('mensaje claro cuando no hay transferencias', () => {
    expect(formatearResultadoParaCopiar([], {})).toBe('No hace falta transferir nada.');
  });
});
