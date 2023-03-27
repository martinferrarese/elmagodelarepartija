import {
  calcular,
  calcularTotalGastado,
  calcularAQuienesHayQueDarlePlata,
  calcularQuienesFaltaPonerPlata,
  IntegranteDelGrupo,
  Deudor,
  Acreedor,
} from './Logica';

const integrantes: IntegranteDelGrupo[] = [
  { nombre: 'Ferra', plataQuePuso: 1300 },
  { nombre: 'Manita', plataQuePuso: 500 },
  { nombre: 'Cami', plataQuePuso: 0 },
];

const integrantes2: IntegranteDelGrupo[] = [
  { nombre: 'A', plataQuePuso: 2000 },
  { nombre: 'B', plataQuePuso: 800 },
  { nombre: 'C', plataQuePuso: 0 },
  { nombre: 'D', plataQuePuso: 0 },
];

test('3 integrantes, 1 acreedor, 2 deudores', () => {
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

test('4 integrantes, 1 acreedor, 2 deudores, uno hecho', () => {
  const cuatroIntegrantes: IntegranteDelGrupo[] = [
    { nombre: 'A', plataQuePuso: 2000 },
    { nombre: 'B', plataQuePuso: 700 },
    { nombre: 'C', plataQuePuso: 100 },
    { nombre: 'D', plataQuePuso: 0 },
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

test('4 integrantes, 2 acreedores, 2 deudores', () => {
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
  console.log(JSON.stringify(deudores));
  expect(deudores).toEqual(deudoresEsperados);
});

test('Suma correctamente el total gastado', () => {
  const totalGastadoEsperado = 1800;

  const totalGastado = calcularTotalGastado(integrantes);
  expect(totalGastado).toBe(totalGastadoEsperado);
});

test('Quienes pusieron mas de 600 deben recibir plata', () => {
  const acreedoresEsperados: Acreedor[] = [{ nombre: 'Ferra', cuantoTieneQueCobrar: 700 }];

  const acreedores = calcularAQuienesHayQueDarlePlata(integrantes, 600);
  expect(acreedores).toEqual(acreedoresEsperados);
});

test('Quienes pusieron menos de 600 deben poner plata', () => {
  const deudoresEsperados: Deudor[] = [
    { nombre: 'Manita', cuantoDebeEnTotal: 100, aQuienesLeDebe: [] },
    { nombre: 'Cami', cuantoDebeEnTotal: 600, aQuienesLeDebe: [] },
  ];

  const deudores = calcularQuienesFaltaPonerPlata(integrantes, 600);
  expect(deudores).toEqual(deudoresEsperados);
});

test('Integrantes2: Quienes pusieron menos de 700 deben poner plata', () => {
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

test.skip('7 integrantes, 2 acreedores, 5 deudores', () => {
  const cuatroIntegrantes: IntegranteDelGrupo[] = [
    { nombre: 'Maxi', plataQuePuso: 0 },
    { nombre: 'Bufi', plataQuePuso: 0 },
    { nombre: 'Ferra', plataQuePuso: 700 },
    { nombre: 'Gian', plataQuePuso: 20 },
    { nombre: 'Cami', plataQuePuso: 0 },
    { nombre: 'Mati', plataQuePuso: 0 },
    { nombre: 'Marquitos', plataQuePuso: 3400 },
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
  console.log(JSON.stringify(deudores));
  expect(deudores).toEqual(deudoresEsperados);
});
