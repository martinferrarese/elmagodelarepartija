import { Juntada, SubgrupoJuntada, Transferencia } from './types';

export function calcularCuota(total: number, cantidadMiembros: number): number {
  if (cantidadMiembros <= 0) {
    throw new Error('cantidadMiembros debe ser > 0');
  }
  return Math.ceil(total / cantidadMiembros);
}

export function corregirRestoBalances(balances: Record<string, number>): Record<string, number> {
  const resultado = { ...balances };
  let suma = Object.values(resultado).reduce((acc, valor) => acc + valor, 0);

  while (suma < 0) {
    const minimo = Math.min(...Object.values(resultado));
    const candidato = Object.keys(resultado)
      .filter((nombre) => resultado[nombre] === minimo)
      .sort()[0];
    resultado[candidato] += 1;
    suma += 1;
  }

  while (suma > 0) {
    const maximo = Math.max(...Object.values(resultado));
    const candidato = Object.keys(resultado)
      .filter((nombre) => resultado[nombre] === maximo)
      .sort()[0];
    resultado[candidato] -= 1;
    suma -= 1;
  }

  return resultado;
}

export function calcularBalances(juntada: Juntada): Record<string, number> {
  const balances: Record<string, number> = {};
  juntada.roster.forEach((nombre) => {
    balances[nombre] = 0;
  });

  juntada.subgrupos.forEach((subgrupo) => {
    const total = subgrupo.miembros.reduce((acc, miembro) => acc + miembro.monto, 0);
    const cuota = calcularCuota(total, subgrupo.miembros.length);
    subgrupo.miembros.forEach((miembro) => {
      if (!(miembro.nombre in balances)) {
        balances[miembro.nombre] = 0;
      }
      balances[miembro.nombre] += miembro.monto - cuota;
    });
  });

  return corregirRestoBalances(balances);
}

export function liquidarBalances(balances: Record<string, number>): Transferencia[] {
  const deudores = Object.entries(balances)
    .filter(([, balance]) => balance < 0)
    .map(([nombre, balance]) => ({ nombre, balance }))
    .sort((a, b) => a.nombre.localeCompare(b.nombre));

  const acreedores = Object.entries(balances)
    .filter(([, balance]) => balance > 0)
    .map(([nombre, balance]) => ({ nombre, balance }))
    .sort((a, b) => a.nombre.localeCompare(b.nombre));

  const transferencias: Transferencia[] = [];
  let i = 0;
  let j = 0;

  while (i < deudores.length && j < acreedores.length) {
    const monto = Math.min(-deudores[i].balance, acreedores[j].balance);
    if (monto > 0) {
      transferencias.push({
        de: deudores[i].nombre,
        a: acreedores[j].nombre,
        monto,
      });
      deudores[i].balance += monto;
      acreedores[j].balance -= monto;
    }
    if (deudores[i].balance === 0) i += 1;
    if (acreedores[j].balance === 0) j += 1;
  }

  return transferencias;
}

export function calcularTransferencias(juntada: Juntada): Transferencia[] {
  return liquidarBalances(calcularBalances(juntada));
}

export function rosterPuedeAvanzar(roster: string[]): boolean {
  return roster.length >= 2;
}

export function puedeAgregarAlRoster(roster: string[], nombre: string): boolean {
  const limpio = nombre.trim();
  return limpio.length > 0 && !roster.includes(limpio);
}

export function subgrupoEsValido(subgrupo: SubgrupoJuntada): boolean {
  if (subgrupo.miembros.length < 2) return false;
  return subgrupo.miembros.every(
    (miembro) => Number.isInteger(miembro.monto) && miembro.monto >= 0,
  );
}

export function juntadaEsValida(juntada: Juntada): boolean {
  if (!rosterPuedeAvanzar(juntada.roster)) return false;
  if (juntada.subgrupos.length < 1) return false;
  return juntada.subgrupos.every(subgrupoEsValido);
}
