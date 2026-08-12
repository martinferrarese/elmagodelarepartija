import { Transferencia } from './types';

export function acreedoresDeTransferencias(transferencias: Transferencia[]): string[] {
  const nombres = new Set(transferencias.map((t) => t.a));
  return Array.from(nombres).sort((a, b) => a.localeCompare(b));
}

export function formatearResultadoParaCopiar(
  transferencias: Transferencia[],
  aliases: Record<string, string>,
): string {
  if (transferencias.length === 0) {
    return 'No hace falta transferir nada.';
  }

  const lineas = transferencias.map((t) => {
    const alias = (aliases[t.a] ?? '').trim();
    const base = `• ${t.de} le transfiere $${t.monto} a ${t.a}`;
    return alias.length > 0 ? `${base} (alias: ${alias})` : base;
  });

  return ['Transferencias', ...lineas].join('\n');
}
