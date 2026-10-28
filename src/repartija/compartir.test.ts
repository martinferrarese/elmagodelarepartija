import {
  armarUrlCompartida,
  codificarJuntadaCompartida,
  decodificarJuntadaCompartida,
  EstadoCompartido,
  leerJuntadaDeSearch,
} from './compartir';

describe('compartir juntada por link', () => {
  const estadoLista: EstadoCompartido = {
    origen: 'lista',
    juntada: {
      roster: ['Ferra', 'Manita', 'Cami'],
      subgrupos: [
        {
          id: 1,
          nombre: 'Cuenta',
          miembros: [
            { nombre: 'Ferra', monto: 1300 },
            { nombre: 'Manita', monto: 500 },
            { nombre: 'Cami', monto: 0 },
          ],
        },
      ],
    },
    aliases: {
      Ferra: 'ferra.mp',
      Manita: '   ',
    },
  };

  test('codifica y decodifica una juntada de cuenta única conservando alias limpios', () => {
    const codificado = codificarJuntadaCompartida(estadoLista);
    const decodificado = decodificarJuntadaCompartida(codificado);

    expect(decodificado).toEqual({
      ...estadoLista,
      aliases: { Ferra: 'ferra.mp' },
    });
  });

  test('codifica y decodifica múltiples cuentas con tildes y eñes', () => {
    const estadoCuentas: EstadoCompartido = {
      origen: 'cuentas',
      juntada: {
        roster: ['Julián', 'Ñoño', 'Cami'],
        subgrupos: [
          {
            id: 1,
            nombre: 'Comida',
            miembros: [
              { nombre: 'Julián', monto: 0 },
              { nombre: 'Ñoño', monto: 27500 },
              { nombre: 'Cami', monto: 10000 },
            ],
          },
          {
            id: 2,
            nombre: 'Bebidas y hielo',
            miembros: [
              { nombre: 'Julián', monto: 16500 },
              { nombre: 'Ñoño', monto: 8000 },
            ],
          },
        ],
      },
      aliases: {
        Ñoño: 'nono.banco',
      },
    };

    const url = armarUrlCompartida('https://repartija.example/', estadoCuentas);
    const parsedUrl = new URL(url);
    const recuperado = leerJuntadaDeSearch(parsedUrl.search);

    expect(recuperado).toEqual(estadoCuentas);
  });

  test('devuelve null cuando el parámetro está vacío, roto o tiene datos inválidos', () => {
    expect(decodificarJuntadaCompartida(null)).toBeNull();
    expect(decodificarJuntadaCompartida('')).toBeNull();
    expect(decodificarJuntadaCompartida('no-es-base64-valido!!!')).toBeNull();

    const menosDeDosPersonas = btoa(
      JSON.stringify({
        origen: 'lista',
        juntada: {
          roster: ['Ferra'],
          subgrupos: [{ id: 1, nombre: 'Cuenta', miembros: [{ nombre: 'Ferra', monto: 100 }] }],
        },
      }),
    );
    expect(decodificarJuntadaCompartida(menosDeDosPersonas)).toBeNull();

    const montoNegativo = btoa(
      JSON.stringify({
        origen: 'lista',
        juntada: {
          roster: ['Ferra', 'Manita'],
          subgrupos: [
            {
              id: 1,
              nombre: 'Cuenta',
              miembros: [
                { nombre: 'Ferra', monto: -10 },
                { nombre: 'Manita', monto: 100 },
              ],
            },
          ],
        },
      }),
    );
    expect(decodificarJuntadaCompartida(montoNegativo)).toBeNull();
  });
});
