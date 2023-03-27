import { IntegranteDelGrupo, Deudor, Subgrupo } from './Interfaces';
import {
  calcular,
  identificarSubgrupos,
  siElSubgrupoExisteActualizarPlataQuePusoYDevolverloSinoCrearlo,
  unificarDeudores,
} from './Logica';

const integrantes: IntegranteDelGrupo[] = [
  { nombre: 'Ferra', plataQuePuso: 1200, divideEntre: ['Ferra', 'Manita', 'Cami'] },
  { nombre: 'Manita', plataQuePuso: 500, divideEntre: ['Manita', 'Cami'] },
  { nombre: 'Cami', plataQuePuso: 0, divideEntre: ['Ferra', 'Manita', 'Cami'] },
];

describe('Unificar deudores', () => {
  it('aaa', () => {
    const deudores = [
      {
        nombre: 'Cami',
        cuantoDebeEnTotal: 0,
        aQuienesLeDebe: [{ nombre: 'Manita', cuantoTieneQueCobrar: 250 }],
      },
      {
        nombre: 'Manita',
        cuantoDebeEnTotal: 0,
        aQuienesLeDebe: [{ nombre: 'Ferra', cuantoTieneQueCobrar: 400 }],
      },
      {
        nombre: 'Cami',
        cuantoDebeEnTotal: 0,
        aQuienesLeDebe: [{ nombre: 'Ferra', cuantoTieneQueCobrar: 400 }],
      },
    ];

    const deudoresEsperados = [
      {
        nombre: 'Manita',
        cuantoDebeEnTotal: 0,
        aQuienesLeDebe: [{ nombre: 'Ferra', cuantoTieneQueCobrar: 400 }],
      },
      {
        nombre: 'Cami',
        cuantoDebeEnTotal: 0,
        aQuienesLeDebe: [
          { nombre: 'Manita', cuantoTieneQueCobrar: 250 },
          { nombre: 'Ferra', cuantoTieneQueCobrar: 400 },
        ],
      },
    ];

    const deudoresUnificados = unificarDeudores(deudores);
    expect(deudoresUnificados).toEqual(deudoresEsperados);
  });
});

describe('Si el subgrupo existe devolver su id, sino crearlo', () => {
  const subgruposExistentes: Subgrupo[] = [
    {
      id: 1,
      integrantes: [
        {
          nombre: 'Manita',
          plataQuePuso: 500,
        },
        {
          nombre: 'Cami',
          plataQuePuso: 0,
        },
      ],
    },
  ];

  it('El subgrupo no existe, entonces devuelve uno nuevo', () => {
    const subgrupoEsperado = {
      id: 2,
      integrantes: [
        {
          nombre: 'Manita',
          plataQuePuso: 10,
        },
        {
          nombre: 'Ferra',
          plataQuePuso: 0,
        },
      ],
    };
    const subgrupos = siElSubgrupoExisteActualizarPlataQuePusoYDevolverloSinoCrearlo(
      subgruposExistentes,
      { nombre: 'Manita', plataQuePuso: 10, divideEntre: ['Manita', 'Ferra'] },
    );
    expect(subgrupos).toEqual(subgrupoEsperado);
  });

  it('El subgrupo existe (en el mismo orden), entonces actualiza plata que puso y lo devuelve', () => {
    const subgrupoEsperado = {
      id: 1,
      integrantes: [
        {
          nombre: 'Manita',
          plataQuePuso: 500,
        },
        {
          nombre: 'Cami',
          plataQuePuso: 300,
        },
      ],
    };

    const subgrupos = siElSubgrupoExisteActualizarPlataQuePusoYDevolverloSinoCrearlo(
      subgruposExistentes,
      { nombre: 'Cami', plataQuePuso: 300, divideEntre: ['Manita', 'Cami'] },
    );
    expect(subgrupos).toEqual(subgrupoEsperado);
  });

  it('El subgrupo existe (en otro orden), entonces actualiza plata que puso y lo devuelve', () => {
    const subgrupoEsperado = {
      id: 1,
      integrantes: [
        {
          nombre: 'Manita',
          plataQuePuso: 500,
        },
        {
          nombre: 'Cami',
          plataQuePuso: 300,
        },
      ],
    };

    const subgrupos = siElSubgrupoExisteActualizarPlataQuePusoYDevolverloSinoCrearlo(
      subgruposExistentes,
      { nombre: 'Cami', plataQuePuso: 300, divideEntre: ['Cami', 'Manita'] },
    );
    expect(subgrupos).toEqual(subgrupoEsperado);
  });
});

describe('Varios subgrupos', () => {
  it('Identificar subgrupos', () => {
    const subgruposEsperados: Subgrupo[] = [
      {
        id: 2,
        integrantes: [
          {
            nombre: 'Manita',
            plataQuePuso: 500,
          },
          {
            nombre: 'Cami',
            plataQuePuso: 0,
          },
        ],
      },
      {
        id: 1,
        integrantes: [
          {
            nombre: 'Ferra',
            plataQuePuso: 1200,
          },
          {
            nombre: 'Manita',
            plataQuePuso: 0,
          },

          {
            nombre: 'Cami',
            plataQuePuso: 0,
          },
        ],
      },
    ];

    const subgrupos = identificarSubgrupos({ integrantes });
    expect(subgrupos).toEqual(subgruposEsperados);
  });
  it('2 subgrupos', () => {
    const deudoresEsperados: Deudor[] = [
      {
        nombre: 'Manita',
        cuantoDebeEnTotal: 0,
        aQuienesLeDebe: [{ nombre: 'Ferra', cuantoTieneQueCobrar: 400 }],
      },
      {
        nombre: 'Cami',
        cuantoDebeEnTotal: 0,
        aQuienesLeDebe: [
          { nombre: 'Manita', cuantoTieneQueCobrar: 250 },
          { nombre: 'Ferra', cuantoTieneQueCobrar: 400 },
        ],
      },
    ];

    const deudores = calcular(integrantes);
    expect(deudores).toEqual(deudoresEsperados);
  });
});
