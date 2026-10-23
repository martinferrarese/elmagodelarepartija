export const CUENTA_JUEVES_STORAGE_KEY = 'repartijajueves';

const CENTENA_EN_CENTAVOS = 10_000;

export type PersonaJueves = {
  id: string;
  nombre: string;
  montoCentavos: number;
};

export type CuentaJueves = {
  totalCentavos: number;
  redondeo: boolean;
  personas: PersonaJueves[];
};

export type DiferenciaPersona = {
  id: string;
  nombre: string;
  diferenciaCentavos: number;
};

export function cuentaVacia(): CuentaJueves {
  return { totalCentavos: 0, redondeo: false, personas: [] };
}

export function cuotaVisibleCentavos(totalCentavos: number, cantidad: number): number | null {
  if (cantidad <= 0) return null;
  return Math.round(totalCentavos / cantidad);
}

export function cuotaVigenteCentavos(
  totalCentavos: number,
  cantidad: number,
  redondeo: boolean,
): number | null {
  const visible = cuotaVisibleCentavos(totalCentavos, cantidad);
  if (visible === null || !redondeo) return visible;
  if (visible % CENTENA_EN_CENTAVOS === 0) return visible;
  return Math.ceil(visible / CENTENA_EN_CENTAVOS) * CENTENA_EN_CENTAVOS;
}

export function totalAJuntarCentavos(cuenta: CuentaJueves): number {
  const cuota = cuotaVigenteCentavos(cuenta.totalCentavos, cuenta.personas.length, cuenta.redondeo);
  if (cuota === null || !cuenta.redondeo) return cuenta.totalCentavos;
  return cuota * cuenta.personas.length;
}

export function faltaCentavos(cuenta: CuentaJueves): number {
  const anotado = cuenta.personas.reduce((suma, persona) => suma + persona.montoCentavos, 0);
  return totalAJuntarCentavos(cuenta) - anotado;
}

function cuotaDe(cuenta: CuentaJueves): number | null {
  return cuotaVigenteCentavos(cuenta.totalCentavos, cuenta.personas.length, cuenta.redondeo);
}

export function morosos(cuenta: CuentaJueves): DiferenciaPersona[] {
  const cuota = cuotaDe(cuenta);
  if (cuota === null) return [];
  return cuenta.personas
    .filter((persona) => persona.montoCentavos < cuota)
    .map((persona) => ({
      id: persona.id,
      nombre: persona.nombre,
      diferenciaCentavos: cuota - persona.montoCentavos,
    }));
}

export function pasanLaCuota(cuenta: CuentaJueves): DiferenciaPersona[] {
  const cuota = cuotaDe(cuenta);
  if (cuota === null) return [];
  return cuenta.personas
    .filter((persona) => persona.montoCentavos > cuota)
    .map((persona) => ({
      id: persona.id,
      nombre: persona.nombre,
      diferenciaCentavos: persona.montoCentavos - cuota,
    }));
}

export function montoTrasPago(montoCentavos: number, cuotaCentavos: number): number {
  return montoCentavos === cuotaCentavos ? 0 : cuotaCentavos;
}

export function montoTopeado(montoCentavos: number, cuotaCentavos: number | null): number {
  if (cuotaCentavos === null) return montoCentavos;
  return Math.min(montoCentavos, cuotaCentavos);
}

export function conTotal(cuenta: CuentaJueves, totalCentavos: number): CuentaJueves {
  return { ...cuenta, totalCentavos };
}

export function conRedondeo(cuenta: CuentaJueves, redondeo: boolean): CuentaJueves {
  return { ...cuenta, redondeo };
}

export function conPersona(cuenta: CuentaJueves, personaNueva: PersonaJueves): CuentaJueves {
  return {
    ...cuenta,
    personas: [...cuenta.personas, { ...personaNueva, montoCentavos: 0 }],
  };
}

export function sinPersona(cuenta: CuentaJueves, id: string): CuentaJueves {
  return { ...cuenta, personas: cuenta.personas.filter((persona) => persona.id !== id) };
}

export function conMonto(cuenta: CuentaJueves, id: string, montoCentavos: number): CuentaJueves {
  return {
    ...cuenta,
    personas: cuenta.personas.map((persona) =>
      persona.id === id ? { ...persona, montoCentavos } : persona,
    ),
  };
}

export function conNombre(cuenta: CuentaJueves, id: string, nombre: string): CuentaJueves {
  return {
    ...cuenta,
    personas: cuenta.personas.map((persona) =>
      persona.id === id ? { ...persona, nombre } : persona,
    ),
  };
}

export function conPago(cuenta: CuentaJueves, id: string): CuentaJueves {
  const cuota = cuotaDe(cuenta);
  if (cuota === null) return cuenta;
  return {
    ...cuenta,
    personas: cuenta.personas.map((persona) =>
      persona.id === id
        ? { ...persona, montoCentavos: montoTrasPago(persona.montoCentavos, cuota) }
        : persona,
    ),
  };
}

export function conMontoEditado(
  cuenta: CuentaJueves,
  id: string,
  montoCentavos: number,
): CuentaJueves {
  return conMonto(cuenta, id, montoTopeado(montoCentavos, cuotaDe(cuenta)));
}

export function parsearPesos(texto: string): number | null {
  const limpio = texto.trim();
  if (limpio === '') return 0;
  if (!/^\d+(,\d{1,2})?$/.test(limpio)) return null;
  const [pesos, fraccion = ''] = limpio.split(',');
  if (pesos.length > 12) return null;
  const fraccionCompleta = `${fraccion}00`.slice(0, 2);
  return Number(pesos) * 100 + Number(fraccionCompleta);
}

export function formatearPesos(centavos: number): string {
  const absoluto = Math.abs(centavos);
  const pesos = Math.floor(absoluto / 100);
  const resto = absoluto % 100;
  const grupos = String(pesos).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  const texto = resto === 0 ? grupos : `${grupos},${String(resto).padStart(2, '0')}`;
  return centavos < 0 ? `-${texto}` : texto;
}

export function textoMontoCentavos(centavos: number): string {
  if (centavos === 0) return '';
  const pesos = Math.floor(centavos / 100);
  const resto = centavos % 100;
  if (resto === 0) return String(pesos);
  return `${pesos},${String(resto).padStart(2, '0')}`;
}

export function textoMontoEnCurso(texto: string): boolean {
  return /^\d*(,\d{0,2})?$/.test(texto);
}

export function esRutaRepartijaJueves(pathname: string): boolean {
  const sinBarra = pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname;
  return sinBarra === '/repartijajueves';
}

function centavosValidos(valor: unknown): valor is number {
  return typeof valor === 'number' && Number.isInteger(valor) && valor >= 0;
}

function esCuenta(data: unknown): data is CuentaJueves {
  if (!data || typeof data !== 'object') return false;
  const cuenta = data as CuentaJueves;
  if (!centavosValidos(cuenta.totalCentavos) || typeof cuenta.redondeo !== 'boolean') return false;
  if (!Array.isArray(cuenta.personas)) return false;
  const ids = new Set<string>();
  const nombres = new Set<string>();
  return cuenta.personas.every((persona) => {
    if (!persona || typeof persona !== 'object') return false;
    if (typeof persona.id !== 'string' || persona.id.trim() === '' || ids.has(persona.id)) {
      return false;
    }
    if (
      typeof persona.nombre !== 'string' ||
      persona.nombre.trim() === '' ||
      persona.nombre !== persona.nombre.trim() ||
      nombres.has(persona.nombre)
    ) {
      return false;
    }
    if (!centavosValidos(persona.montoCentavos)) return false;
    ids.add(persona.id);
    nombres.add(persona.nombre);
    return true;
  });
}

export function leerCuentaJueves(raw: string | null): CuentaJueves {
  if (!raw) return cuentaVacia();
  try {
    const data: unknown = JSON.parse(raw);
    if (!esCuenta(data)) return cuentaVacia();
    return data;
  } catch {
    return cuentaVacia();
  }
}
