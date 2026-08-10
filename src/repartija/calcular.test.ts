import {
  calcularBalances,
  calcularCuota,
  calcularDesglose,
  calcularTransferencias,
  juntadaEsValida,
  puedeAgregarAlRoster,
  rosterPuedeAvanzar,
  subgrupoEsValido,
} from './calcular';
import { Juntada, SubgrupoJuntada } from './types';

function grupo(
  id: number,
  nombre: string,
  montos: Record<string, number>,
): SubgrupoJuntada {
  return {
    id,
    nombre,
    miembros: Object.entries(montos).map(([n, monto]) => ({ nombre: n, monto })),
  };
}

describe('cuota con ceil', () => {
  it('redondea hacia arriba', () => {
    expect(calcularCuota(100, 3)).toBe(34);
    expect(calcularCuota(1800, 3)).toBe(600);
  });
});

describe('C1 juntada simple', () => {
  const juntada: Juntada = {
    roster: ['Ferra', 'Manita', 'Cami'],
    subgrupos: [grupo(1, 'Grupo 1', { Ferra: 1300, Manita: 500, Cami: 0 })],
  };

  it('calcula balances', () => {
    expect(calcularBalances(juntada)).toEqual({
      Ferra: 700,
      Manita: -100,
      Cami: -600,
    });
  });

  it('transferencias deterministas por nombre', () => {
    expect(calcularTransferencias(juntada)).toEqual([
      { de: 'Cami', a: 'Ferra', monto: 600 },
      { de: 'Manita', a: 'Ferra', monto: 100 },
    ]);
  });
});

describe('C2/C3 alcohol y comida', () => {
  const juntada: Juntada = {
    roster: ['Ferra', 'Manita', 'Cami'],
    subgrupos: [
      grupo(1, 'Alcohol', { Ferra: 16500, Manita: 8000 }),
      grupo(2, 'Comida', { Ferra: 0, Manita: 27500, Cami: 10000 }),
    ],
  };

  it('balances con Ferra en $0 en comida', () => {
    expect(calcularBalances(juntada)).toEqual({
      Ferra: -8250,
      Manita: 10750,
      Cami: -2500,
    });
  });

  it('transferencias mínimas globales', () => {
    expect(calcularTransferencias(juntada)).toEqual([
      { de: 'Cami', a: 'Manita', monto: 2500 },
      { de: 'Ferra', a: 'Manita', monto: 8250 },
    ]);
  });
});

describe('C4 multi-acreedor', () => {
  const juntada: Juntada = {
    roster: ['A', 'B', 'C', 'D'],
    subgrupos: [grupo(1, 'Grupo 1', { A: 2000, B: 800, C: 0, D: 0 })],
  };

  it('empareja de forma determinista por nombre', () => {
    expect(calcularTransferencias(juntada)).toEqual([
      { de: 'C', a: 'A', monto: 700 },
      { de: 'D', a: 'A', monto: 600 },
      { de: 'D', a: 'B', monto: 100 },
    ]);
  });
});

describe('C5 equilibrado', () => {
  it('sin transferencias', () => {
    const juntada: Juntada = {
      roster: ['A', 'B'],
      subgrupos: [grupo(1, 'Grupo 1', { A: 100, B: 100 })],
    };
    expect(calcularTransferencias(juntada)).toEqual([]);
  });
});

describe('C6 tres grupos con solapes', () => {
  it('cierra balances con settlement', () => {
    const juntada: Juntada = {
      roster: ['A', 'B', 'C'],
      subgrupos: [
        grupo(1, 'Peaje', { A: 100, B: 0 }),
        grupo(2, 'Comida', { A: 0, B: 300, C: 0 }),
        grupo(3, 'Museo', { B: 0, C: 200 }),
      ],
    };
    expect(calcularBalances(juntada)).toEqual({ A: -50, B: 50, C: 0 });
    expect(calcularTransferencias(juntada)).toEqual([{ de: 'A', a: 'B', monto: 50 }]);
  });
});

describe('corrección de resto por ceil', () => {
  it('ajusta hasta suma cero de forma determinista', () => {
    const juntada: Juntada = {
      roster: ['A', 'B', 'C'],
      subgrupos: [grupo(1, 'Grupo 1', { A: 100, B: 0, C: 0 })],
    };
    // cuota ceil(100/3)=34 → bruto A:66 B:-34 C:-34 suma -2
    const balances = calcularBalances(juntada);
    expect(Object.values(balances).reduce((a, b) => a + b, 0)).toBe(0);
    expect(balances).toEqual({ A: 66, B: -33, C: -33 });
  });
});

describe('desglose F2', () => {
  it('C1: totales y saldos locales', () => {
    const juntada: Juntada = {
      roster: ['Ferra', 'Manita', 'Cami'],
      subgrupos: [grupo(1, 'Grupo 1', { Ferra: 1300, Manita: 500, Cami: 0 })],
    };
    expect(calcularDesglose(juntada)).toEqual([
      {
        id: 1,
        nombre: 'Grupo 1',
        total: 1800,
        cantidadMiembros: 3,
        cuota: 600,
        lineas: [
          { nombre: 'Ferra', puso: 1300, cuota: 600, saldo: 700 },
          { nombre: 'Manita', puso: 500, cuota: 600, saldo: -100 },
          { nombre: 'Cami', puso: 0, cuota: 600, saldo: -600 },
        ],
      },
    ]);
  });

  it('alcohol: totales y saldos locales', () => {
    const juntada: Juntada = {
      roster: ['Ferra', 'Manita', 'Cami'],
      subgrupos: [
        grupo(1, 'Alcohol', { Ferra: 16500, Manita: 8000 }),
        grupo(2, 'Comida', { Ferra: 0, Manita: 27500, Cami: 10000 }),
      ],
    };
    const desglose = calcularDesglose(juntada);
    expect(desglose[0]).toEqual({
      id: 1,
      nombre: 'Alcohol',
      total: 24500,
      cantidadMiembros: 2,
      cuota: 12250,
      lineas: [
        { nombre: 'Ferra', puso: 16500, cuota: 12250, saldo: 4250 },
        { nombre: 'Manita', puso: 8000, cuota: 12250, saldo: -4250 },
      ],
    });
  });
});

describe('validaciones C7–C10', () => {
  it('C9 roster < 2 no avanza', () => {
    expect(rosterPuedeAvanzar([])).toBe(false);
    expect(rosterPuedeAvanzar(['Solo'])).toBe(false);
    expect(rosterPuedeAvanzar(['A', 'B'])).toBe(true);
  });

  it('nombres únicos al agregar', () => {
    expect(puedeAgregarAlRoster(['A'], 'A')).toBe(false);
    expect(puedeAgregarAlRoster(['A'], 'B')).toBe(true);
  });

  it('C7 subgrupo < 2 inválido', () => {
    expect(subgrupoEsValido(grupo(1, 'X', { A: 10 }))).toBe(false);
  });

  it('C8 monto negativo inválido', () => {
    expect(subgrupoEsValido(grupo(1, 'X', { A: 10, B: -1 }))).toBe(false);
  });

  it('C10 monto 0 es válido', () => {
    expect(subgrupoEsValido(grupo(1, 'X', { A: 0, B: 0 }))).toBe(true);
  });

  it('juntada requiere roster y al menos un subgrupo válido', () => {
    expect(
      juntadaEsValida({
        roster: ['A'],
        subgrupos: [grupo(1, 'G', { A: 1, B: 1 })],
      }),
    ).toBe(false);
    expect(
      juntadaEsValida({
        roster: ['A', 'B'],
        subgrupos: [],
      }),
    ).toBe(false);
    expect(
      juntadaEsValida({
        roster: ['A', 'B'],
        subgrupos: [grupo(1, 'G', { A: 1, B: 0 })],
      }),
    ).toBe(true);
  });
});
