export interface IntegranteDelGrupo {
  nombre: string;
  plataQuePuso: number;
}

export interface Acreedor {
  nombre: string;
  cuantoTieneQueCobrar: number;
}

export interface Deudor {
  nombre: string;
  cuantoDebeEnTotal: number;
  aQuienesLeDebe: Acreedor[];
}

export function calcularTotalGastado(integrantes: IntegranteDelGrupo[]): number {
  return integrantes.reduce((n, { plataQuePuso }) => n + plataQuePuso, 0);
}

export function calcularCuantoTieneQuePonerCadaUno(
  totalGastado: number,
  cantidadDeIntegrantes: number,
): number {
  return totalGastado / cantidadDeIntegrantes;
}

export function calcularAQuienesHayQueDarlePlata(
  integrantes: IntegranteDelGrupo[],
  cuantoPoneCadaUno: number,
): Acreedor[] {
  const resultado = integrantes.filter((integrante) => integrante.plataQuePuso > cuantoPoneCadaUno);

  return resultado.map((integrante) => ({
    nombre: integrante.nombre,
    cuantoTieneQueCobrar: integrante.plataQuePuso - cuantoPoneCadaUno,
  }));
}

export function calcularQuienesFaltaPonerPlata(
  integrantes: IntegranteDelGrupo[],
  cuantoPoneCadaUno: number,
): Deudor[] {
  const resultado = integrantes.filter((integrante) => integrante.plataQuePuso < cuantoPoneCadaUno);

  return resultado.map((integrante) => ({
    nombre: integrante.nombre,
    cuantoDebeEnTotal: cuantoPoneCadaUno - integrante.plataQuePuso,
    aQuienesLeDebe: [],
  }));
}

export function calcular(integrantes: IntegranteDelGrupo[]): Deudor[] {
  const totalGastado = calcularTotalGastado(integrantes);
  const cuantoPoneCadaUno = calcularCuantoTieneQuePonerCadaUno(totalGastado, integrantes.length);
  const tienenQueCobrarAlgo = calcularAQuienesHayQueDarlePlata(integrantes, cuantoPoneCadaUno);
  const tienenQuePagarAlgo = calcularQuienesFaltaPonerPlata(integrantes, cuantoPoneCadaUno);

  tienenQueCobrarAlgo.forEach((acreedor) => {
    let cuantoLeFaltaAlAcreedor = acreedor.cuantoTieneQueCobrar;

    // eslint-disable-next-line no-plusplus
    for (let i = 0; i < tienenQuePagarAlgo.length; i++) {
      if (tienenQuePagarAlgo[i].cuantoDebeEnTotal > 0 && cuantoLeFaltaAlAcreedor > 0) {
        const debeMenosDeLoQueTieneQueCobrarElAcreedor =
          cuantoLeFaltaAlAcreedor - tienenQuePagarAlgo[i].cuantoDebeEnTotal >= 0;

        if (debeMenosDeLoQueTieneQueCobrarElAcreedor) {
          const cuantoPagaElDeudor = tienenQuePagarAlgo[i].cuantoDebeEnTotal;
          tienenQuePagarAlgo[i].aQuienesLeDebe.push({
            nombre: acreedor.nombre,
            cuantoTieneQueCobrar: cuantoPagaElDeudor,
          });
          cuantoLeFaltaAlAcreedor -= cuantoPagaElDeudor;
          tienenQuePagarAlgo[i].cuantoDebeEnTotal -= cuantoPagaElDeudor;
        } else {
          const cuantoPagaElDeudor = cuantoLeFaltaAlAcreedor;
          tienenQuePagarAlgo[i].aQuienesLeDebe.push({
            nombre: acreedor.nombre,
            cuantoTieneQueCobrar: cuantoPagaElDeudor,
          });
          cuantoLeFaltaAlAcreedor -= cuantoPagaElDeudor;
          tienenQuePagarAlgo[i].cuantoDebeEnTotal -= cuantoPagaElDeudor;
        }
      }
    }
  });

  return tienenQuePagarAlgo;
}
