import { juntadaEsValida, puedeAgregarAlRoster } from './calcular';
import { Juntada, MiembroSubgrupo, SubgrupoJuntada } from './types';

export type OrigenCompartido = 'lista' | 'cuentas';

export type EstadoCompartido = {
  origen: OrigenCompartido;
  juntada: Juntada;
  aliases: Record<string, string>;
};

export const PARAMETRO_JUNTADA = 'juntada';

function bytesABase64Url(bytes: Uint8Array): string {
  let binario = '';
  bytes.forEach((byte) => {
    binario += String.fromCharCode(byte);
  });
  return btoa(binario).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function base64UrlABytes(base64Url: string): Uint8Array | null {
  if (!base64Url || !/^[A-Za-z0-9\-_]+$/.test(base64Url)) {
    return null;
  }
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  const resto = base64.length % 4;
  if (resto === 1) return null;
  const conPadding = resto === 0 ? base64 : `${base64}${'='.repeat(4 - resto)}`;
  try {
    const binario = atob(conPadding);
    const bytes = new Uint8Array(binario.length);
    for (let i = 0; i < binario.length; i += 1) {
      bytes[i] = binario.charCodeAt(i);
    }
    return bytes;
  } catch {
    return null;
  }
}

function codificarTextoUtf8(texto: string): Uint8Array {
  if (typeof TextEncoder !== 'undefined') {
    return new TextEncoder().encode(texto);
  }
  const escapado = unescape(encodeURIComponent(texto));
  const bytes = new Uint8Array(escapado.length);
  for (let i = 0; i < escapado.length; i += 1) {
    bytes[i] = escapado.charCodeAt(i);
  }
  return bytes;
}

function decodificarTextoUtf8(bytes: Uint8Array): string | null {
  try {
    if (typeof TextDecoder !== 'undefined') {
      return new TextDecoder('utf-8', { fatal: true }).decode(bytes);
    }
    let binario = '';
    bytes.forEach((byte) => {
      binario += String.fromCharCode(byte);
    });
    return decodeURIComponent(escape(binario));
  } catch {
    return null;
  }
}

function limpiarAliases(
  roster: string[],
  aliases: Record<string, string>,
): Record<string, string> {
  const resultado: Record<string, string> = {};
  roster.forEach((nombre) => {
    const valor = (aliases[nombre] ?? '').trim();
    if (valor.length > 0) {
      resultado[nombre] = valor;
    }
  });
  return resultado;
}

export function codificarJuntadaCompartida(estado: EstadoCompartido): string {
  const payload = {
    origen: estado.origen,
    juntada: estado.juntada,
    aliases: limpiarAliases(estado.juntada.roster, estado.aliases),
  };
  const json = JSON.stringify(payload);
  return bytesABase64Url(codificarTextoUtf8(json));
}

function parsearRoster(valor: unknown): string[] | null {
  if (!Array.isArray(valor)) return null;
  const roster: string[] = [];
  for (const item of valor) {
    if (typeof item !== 'string') return null;
    const limpio = item.trim();
    if (!puedeAgregarAlRoster(roster, limpio)) return null;
    roster.push(limpio);
  }
  return roster.length >= 2 ? roster : null;
}

function parsearSubgrupos(valor: unknown, roster: string[]): SubgrupoJuntada[] | null {
  if (!Array.isArray(valor) || valor.length < 1) return null;
  const subgrupos: SubgrupoJuntada[] = [];

  for (const item of valor) {
    if (!item || typeof item !== 'object') return null;
    const candidato = item as Record<string, unknown>;
    if (
      typeof candidato.id !== 'number' ||
      !Number.isInteger(candidato.id) ||
      candidato.id < 1 ||
      typeof candidato.nombre !== 'string' ||
      candidato.nombre.trim().length === 0 ||
      !Array.isArray(candidato.miembros)
    ) {
      return null;
    }

    const vistos = new Set<string>();
    const miembros: MiembroSubgrupo[] = [];
    for (const m of candidato.miembros) {
      if (!m || typeof m !== 'object') return null;
      const miembro = m as Record<string, unknown>;
      if (
        typeof miembro.nombre !== 'string' ||
        !roster.includes(miembro.nombre) ||
        vistos.has(miembro.nombre) ||
        typeof miembro.monto !== 'number' ||
        !Number.isInteger(miembro.monto) ||
        miembro.monto < 0
      ) {
        return null;
      }
      vistos.add(miembro.nombre);
      miembros.push({ nombre: miembro.nombre, monto: miembro.monto });
    }

    subgrupos.push({
      id: candidato.id,
      nombre: candidato.nombre.trim(),
      miembros,
    });
  }

  return subgrupos;
}

export function decodificarJuntadaCompartida(
  codificado: string | null | undefined,
): EstadoCompartido | null {
  if (!codificado || typeof codificado !== 'string') return null;
  const bytes = base64UrlABytes(codificado.trim());
  if (!bytes) return null;
  const json = decodificarTextoUtf8(bytes);
  if (!json) return null;

  let crudo: unknown;
  try {
    crudo = JSON.parse(json);
  } catch {
    return null;
  }

  if (!crudo || typeof crudo !== 'object') return null;
  const objeto = crudo as Record<string, unknown>;
  if (objeto.origen !== 'lista' && objeto.origen !== 'cuentas') return null;
  if (!objeto.juntada || typeof objeto.juntada !== 'object') return null;

  const juntadaCruda = objeto.juntada as Record<string, unknown>;
  const roster = parsearRoster(juntadaCruda.roster);
  if (!roster) return null;

  const subgrupos = parsearSubgrupos(juntadaCruda.subgrupos, roster);
  if (!subgrupos) return null;

  const juntada: Juntada = { roster, subgrupos };
  if (!juntadaEsValida(juntada)) return null;

  if (objeto.origen === 'lista' && subgrupos.length !== 1) {
    return null;
  }

  const aliases: Record<string, string> = {};
  if (objeto.aliases && typeof objeto.aliases === 'object') {
    const mapa = objeto.aliases as Record<string, unknown>;
    roster.forEach((nombre) => {
      const valor = mapa[nombre];
      if (typeof valor === 'string' && valor.trim().length > 0) {
        aliases[nombre] = valor.trim();
      }
    });
  }

  return {
    origen: objeto.origen,
    juntada,
    aliases,
  };
}

export function armarUrlCompartida(urlActual: string, estado: EstadoCompartido): string {
  const url = new URL(urlActual);
  url.searchParams.set(PARAMETRO_JUNTADA, codificarJuntadaCompartida(estado));
  return url.toString();
}

export function leerJuntadaDeSearch(search: string): EstadoCompartido | null {
  const params = new URLSearchParams(search);
  return decodificarJuntadaCompartida(params.get(PARAMETRO_JUNTADA));
}
