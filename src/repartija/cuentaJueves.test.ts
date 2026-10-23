import {
  conMonto,
  conMontoEditado,
  conPago,
  conPersona,
  conRedondeo,
  conTotal,
  cuentaVacia,
  cuotaVigenteCentavos,
  cuotaVisibleCentavos,
  esRutaRepartijaJueves,
  faltaCentavos,
  formatearPesos,
  leerCuentaJueves,
  montoTrasPago,
  morosos,
  parsearPesos,
  pasanLaCuota,
  sinPersona,
  textoMontoCentavos,
  totalAJuntarCentavos,
  type CuentaJueves,
  type PersonaJueves,
} from './cuentaJueves';

function persona(id: string, nombre: string, montoCentavos: number): PersonaJueves {
  return { id, nombre, montoCentavos };
}

function cuenta(totalCentavos: number, personas: PersonaJueves[], redondeo = false): CuentaJueves {
  return { totalCentavos, redondeo, personas };
}

describe('cuotaVisibleCentavos', () => {
  it('debería mostrar 14.285,71 cuando el total es 100.000 entre 7', () => {
    expect(cuotaVisibleCentavos(10_000_000, 7)).toBe(1_428_571);
  });

  it('debería no tener cuota cuando no hay personas', () => {
    expect(cuotaVisibleCentavos(10_000_000, 0)).toBeNull();
  });
});

describe('cuotaVigenteCentavos', () => {
  it('debería dejar la cuota con centavos cuando redondeo está apagado', () => {
    expect(cuotaVigenteCentavos(10_000_000, 7, false)).toBe(1_428_571);
  });

  it('debería subir a la centena siguiente cuando redondeo está prendido', () => {
    expect(cuotaVigenteCentavos(10_000_000, 7, true)).toBe(1_430_000);
  });

  it('debería redondear 14.201,12 a 14.300 cuando se pide redondeo', () => {
    expect(cuotaVigenteCentavos(1_420_112, 1, true)).toBe(1_430_000);
  });

  it('debería dejar la cuota igual cuando ya es múltiplo de 100', () => {
    expect(cuotaVigenteCentavos(10_000_000, 8, true)).toBe(1_250_000);
  });
});

describe('totalAJuntarCentavos', () => {
  const siete = Array.from({ length: 7 }, (_, i) => persona(String(i), `P${i}`, 0));

  it('debería conservar el total escrito cuando redondeo está apagado', () => {
    expect(totalAJuntarCentavos(cuenta(10_000_000, siete))).toBe(10_000_000);
  });

  it('debería usar la cuota redondeada por la cantidad cuando redondeo está prendido', () => {
    expect(totalAJuntarCentavos(cuenta(10_000_000, siete, true))).toBe(10_010_000);
  });

  it('debería conservar el total escrito cuando no hay personas y redondeo está prendido', () => {
    expect(totalAJuntarCentavos(cuenta(10_000_000, [], true))).toBe(10_000_000);
  });
});

describe('faltaCentavos', () => {
  it('debería dejar 3 centavos de falta cuando los 7 pagan la cuota con centavos', () => {
    const personas = Array.from({ length: 7 }, (_, i) => persona(String(i), `P${i}`, 1_428_571));
    expect(faltaCentavos(cuenta(10_000_000, personas))).toBe(3);
  });

  it('debería dar negativo cuando lo anotado supera el total a juntar', () => {
    expect(faltaCentavos(cuenta(10_000, [persona('1', 'Ferra', 15_000)]))).toBe(-5_000);
  });
});

describe('morosos', () => {
  it('debería listar a quien está debajo de la cuota cuando hay un pago parcial', () => {
    const actual = cuenta(1_000_000, [persona('1', 'Ferra', 0), persona('2', 'Manita', 500_000)]);
    expect(morosos(actual)).toEqual([{ id: '1', nombre: 'Ferra', diferenciaCentavos: 500_000 }]);
  });

  it('no debería listar como moroso cuando el monto es la cuota', () => {
    const actual = cuenta(1_000_000, [persona('1', 'Ferra', 1_000_000)]);
    expect(morosos(actual)).toEqual([]);
  });

  it('debería no listar morosos cuando no hay personas', () => {
    expect(morosos(cuentaVacia())).toEqual([]);
  });
});

describe('pasanLaCuota', () => {
  it('debería listar a quien supera la cuota cuando el monto quedó alto', () => {
    const actual = cuenta(10_000, [persona('1', 'Ferra', 15_000)]);
    expect(pasanLaCuota(actual)).toEqual([{ id: '1', nombre: 'Ferra', diferenciaCentavos: 5_000 }]);
  });
});

describe('conPago', () => {
  const base = cuenta(10_000_000, [persona('1', 'Ferra', 0), persona('2', 'Manita', 1_000)]);

  it('debería completar la cuota cuando Pagó y el monto está por debajo', () => {
    const actual = conPago(base, '1');
    expect(actual.personas[0].montoCentavos).toBe(5_000_000);
    expect(actual.personas[1].montoCentavos).toBe(1_000);
  });

  it('debería volver a cero cuando Pagó y ya está en la cuota', () => {
    const alDia = conPago(base, '1');
    expect(conPago(alDia, '1').personas[0].montoCentavos).toBe(0);
  });

  it('debería bajar a la cuota cuando Pagó y el monto la supera', () => {
    const pasado = conMonto(base, '1', 9_000_000);
    expect(conPago(pasado, '1').personas[0].montoCentavos).toBe(5_000_000);
  });

  it('debería no cambiar montos cuando no hay cuota', () => {
    const vacia = cuenta(10_000, []);
    expect(conPago(vacia, '1')).toEqual(vacia);
  });
});

describe('montos al cambiar la cuenta', () => {
  const base = cuenta(10_000_000, [persona('1', 'Ferra', 1_000), persona('2', 'Manita', 2_000)]);

  it('debería conservar los montos cuando cambia el total', () => {
    expect(conTotal(base, 8_000_000).personas.map((p) => p.montoCentavos)).toEqual([1_000, 2_000]);
  });

  it('debería conservar los montos cuando se prende el redondeo', () => {
    expect(conRedondeo(base, true).personas.map((p) => p.montoCentavos)).toEqual([1_000, 2_000]);
  });

  it('debería conservar los otros montos cuando se quita una persona', () => {
    expect(sinPersona(base, '1').personas).toEqual([persona('2', 'Manita', 2_000)]);
  });

  it('debería anotar en cero cuando se agrega una persona', () => {
    const actual = conPersona(base, persona('3', 'Cami', 9_999));
    expect(actual.personas[2]).toEqual(persona('3', 'Cami', 0));
    expect(actual.personas[0].montoCentavos).toBe(1_000);
  });
});

describe('conMontoEditado', () => {
  it('debería topear el monto cuando lo editado supera la cuota', () => {
    const base = cuenta(10_000_000, [persona('1', 'Ferra', 0), persona('2', 'Manita', 0)]);
    expect(conMontoEditado(base, '1', 9_000_000).personas[0].montoCentavos).toBe(5_000_000);
  });

  it('debería conservar un monto ya guardado por encima de la cuota cuando no se edita', () => {
    const base = cuenta(10_000, [persona('1', 'Ferra', 15_000)]);
    expect(conTotal(base, 8_000).personas[0].montoCentavos).toBe(15_000);
  });
});

describe('montoTrasPago', () => {
  it('debería volver a cero cuando el monto ya es la cuota', () => {
    expect(montoTrasPago(5_000, 5_000)).toBe(0);
  });
});

describe('parsearPesos y formatearPesos', () => {
  it('debería leer centavos cuando el texto usa coma', () => {
    expect(parsearPesos('14285,71')).toBe(1_428_571);
    expect(parsearPesos('10,5')).toBe(1_050);
    expect(parsearPesos('')).toBe(0);
  });

  it('debería rechazar el texto cuando no es un monto', () => {
    expect(parsearPesos('10.50')).toBeNull();
    expect(parsearPesos('12a')).toBeNull();
    expect(parsearPesos('-1')).toBeNull();
  });

  it('debería formatear con separador de miles cuando el monto es entero', () => {
    expect(formatearPesos(10_010_000)).toBe('100.100');
    expect(formatearPesos(1_428_571)).toBe('14.285,71');
    expect(textoMontoCentavos(0)).toBe('');
    expect(textoMontoCentavos(1_428_571)).toBe('14285,71');
  });
});

describe('leerCuentaJueves', () => {
  it('debería arrancar vacía cuando lo guardado está roto', () => {
    expect(leerCuentaJueves(null)).toEqual(cuentaVacia());
    expect(leerCuentaJueves('{')).toEqual(cuentaVacia());
    expect(leerCuentaJueves('{"totalCentavos":-1,"redondeo":false,"personas":[]}')).toEqual(
      cuentaVacia(),
    );
  });

  it('debería recuperar la cuenta cuando el json es válido', () => {
    const guardada = cuenta(10_000, [persona('1', 'Ferra', 500)], true);
    expect(leerCuentaJueves(JSON.stringify(guardada))).toEqual(guardada);
  });
});

describe('esRutaRepartijaJueves', () => {
  it('debería reconocer la ruta cuando es /repartijajueves', () => {
    expect(esRutaRepartijaJueves('/repartijajueves')).toBe(true);
    expect(esRutaRepartijaJueves('/repartijajueves/')).toBe(true);
  });

  it('no debería reconocer la ruta cuando es el mago', () => {
    expect(esRutaRepartijaJueves('/')).toBe(false);
    expect(esRutaRepartijaJueves('/repartijajueves/otra')).toBe(false);
  });
});
