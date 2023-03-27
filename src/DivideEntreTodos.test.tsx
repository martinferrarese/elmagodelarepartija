import { IntegranteDelGrupo, Deudor, Acreedor } from './Interfaces';
import {
  calcular,
  calcularTotalGastado,
  calcularAQuienesHayQueDarlePlata,
  calcularQuienesFaltaPonerPlata,
} from './Logica';

const integrantes: IntegranteDelGrupo[] = [
  { nombre: 'Ferra', plataQuePuso: 1300, divideEntre: ['Ferra', 'Manita', 'Cami'] },
  { nombre: 'Manita', plataQuePuso: 500, divideEntre: ['Ferra', 'Manita', 'Cami'] },
  { nombre: 'Cami', plataQuePuso: 0, divideEntre: ['Ferra', 'Manita', 'Cami'] },
];

const integrantes2: IntegranteDelGrupo[] = [
  { nombre: 'A', plataQuePuso: 2000, divideEntre: ['A', 'B', 'C', 'D'] },
  { nombre: 'B', plataQuePuso: 800, divideEntre: ['A', 'B', 'C', 'D'] },
  { nombre: 'C', plataQuePuso: 0, divideEntre: ['A', 'B', 'C', 'D'] },
  { nombre: 'D', plataQuePuso: 0, divideEntre: ['A', 'B', 'C', 'D'] },
];

describe('Divide todo entre todos', () => {
  it('3 integrantes, 1 acreedor, 2 deudores', () => {
    const deudoresEsperados: Deudor[] = [
      {
        nombre: 'Manita',
        cuantoDebeEnTotal: 0,
        aQuienesLeDebe: [{ nombre: 'Ferra', cuantoTieneQueCobrar: 100 }],
      },
      {
        nombre: 'Cami',
        cuantoDebeEnTotal: 0,
        aQuienesLeDebe: [{ nombre: 'Ferra', cuantoTieneQueCobrar: 600 }],
      },
    ];

    const deudores = calcular(integrantes);
    expect(deudores).toEqual(deudoresEsperados);
  });

  it('4 integrantes, 1 acreedor, 2 deudores, uno hecho', () => {
    const cuatroIntegrantes: IntegranteDelGrupo[] = [
      { nombre: 'A', plataQuePuso: 2000, divideEntre: ['A', 'B', 'C', 'D'] },
      { nombre: 'B', plataQuePuso: 700, divideEntre: ['A', 'B', 'C', 'D'] },
      { nombre: 'C', plataQuePuso: 100, divideEntre: ['A', 'B', 'C', 'D'] },
      { nombre: 'D', plataQuePuso: 0, divideEntre: ['A', 'B', 'C', 'D'] },
    ];

    const deudoresEsperados: Deudor[] = [
      {
        nombre: 'C',
        cuantoDebeEnTotal: 0,
        aQuienesLeDebe: [{ nombre: 'A', cuantoTieneQueCobrar: 600 }],
      },
      {
        nombre: 'D',
        cuantoDebeEnTotal: 0,
        aQuienesLeDebe: [{ nombre: 'A', cuantoTieneQueCobrar: 700 }],
      },
    ];

    const deudores = calcular(cuatroIntegrantes);
    expect(deudores).toEqual(deudoresEsperados);
  });

  it('4 integrantes, 2 acreedores, 2 deudores', () => {
    const deudoresEsperados: Deudor[] = [
      {
        nombre: 'C',
        cuantoDebeEnTotal: 0,
        aQuienesLeDebe: [{ nombre: 'A', cuantoTieneQueCobrar: 700 }],
      },
      {
        nombre: 'D',
        cuantoDebeEnTotal: 0,
        aQuienesLeDebe: [
          { nombre: 'A', cuantoTieneQueCobrar: 600 },
          { nombre: 'B', cuantoTieneQueCobrar: 100 },
        ],
      },
    ];

    const deudores = calcular(integrantes2);
    expect(deudores).toEqual(deudoresEsperados);
  });

  it('Suma correctamente el total gastado', () => {
    const totalGastadoEsperado = 1800;

    const totalGastado = calcularTotalGastado(integrantes);
    expect(totalGastado).toBe(totalGastadoEsperado);
  });

  it('Quienes pusieron mas de 600 deben recibir plata', () => {
    const acreedoresEsperados: Acreedor[] = [{ nombre: 'Ferra', cuantoTieneQueCobrar: 700 }];

    const acreedores = calcularAQuienesHayQueDarlePlata(integrantes, 600);
    expect(acreedores).toEqual(acreedoresEsperados);
  });

  it('Quienes pusieron menos de 600 deben poner plata', () => {
    const deudoresEsperados: Deudor[] = [
      { nombre: 'Manita', cuantoDebeEnTotal: 100, aQuienesLeDebe: [] },
      { nombre: 'Cami', cuantoDebeEnTotal: 600, aQuienesLeDebe: [] },
    ];

    const deudores = calcularQuienesFaltaPonerPlata(integrantes, 600);
    expect(deudores).toEqual(deudoresEsperados);
  });

  it('Integrantes2: Quienes pusieron menos de 700 deben poner plata', () => {
    const deudoresEsperados: Deudor[] = [
      {
        nombre: 'C',
        cuantoDebeEnTotal: 700,
        aQuienesLeDebe: [],
      },
      {
        nombre: 'D',
        cuantoDebeEnTotal: 700,
        aQuienesLeDebe: [],
      },
    ];

    const deudores = calcularQuienesFaltaPonerPlata(integrantes2, 700);
    expect(deudores).toEqual(deudoresEsperados);
  });

  it.skip('7 integrantes, 2 acreedores, 5 deudores', () => {
    const cuatroIntegrantes: IntegranteDelGrupo[] = [
      { nombre: 'Maxi', plataQuePuso: 0, divideEntre: [] },
      { nombre: 'Bufi', plataQuePuso: 0, divideEntre: [] },
      { nombre: 'Ferra', plataQuePuso: 700, divideEntre: [] },
      { nombre: 'Gian', plataQuePuso: 20, divideEntre: [] },
      { nombre: 'Cami', plataQuePuso: 0, divideEntre: [] },
      { nombre: 'Mati', plataQuePuso: 0, divideEntre: [] },
      { nombre: 'Marquitos', plataQuePuso: 3400, divideEntre: [] },
    ];

    const deudoresEsperados: Deudor[] = [
      {
        nombre: 'C',
        cuantoDebeEnTotal: 0,
        aQuienesLeDebe: [{ nombre: 'A', cuantoTieneQueCobrar: 600 }],
      },
      {
        nombre: 'D',
        cuantoDebeEnTotal: 0,
        aQuienesLeDebe: [{ nombre: 'A', cuantoTieneQueCobrar: 700 }],
      },
    ];

    const deudores = calcular(cuatroIntegrantes);
    // console.log(JSON.stringify(deudores));
    expect(deudores).toEqual(deudoresEsperados);
  });
});
