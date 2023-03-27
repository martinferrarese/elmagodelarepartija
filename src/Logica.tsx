import {
  IntegranteDelSubgrupo,
  Acreedor,
  Deudor,
  IntegranteDelGrupo,
  Grupo,
  Subgrupo,
} from './Interfaces';

export function calcularTotalGastado(integrantes: IntegranteDelSubgrupo[]): number {
  return integrantes.reduce((n, { plataQuePuso }) => n + plataQuePuso, 0);
}

export function calcularCuantoTieneQuePonerCadaUno(
  totalGastado: number,
  cantidadDeIntegrantes: number,
): number {
  return totalGastado / cantidadDeIntegrantes;
}

export function calcularAQuienesHayQueDarlePlata(
  integrantes: IntegranteDelSubgrupo[],
  cuantoPoneCadaUno: number,
): Acreedor[] {
  const resultado = integrantes.filter((integrante) => integrante.plataQuePuso > cuantoPoneCadaUno);

  return resultado.map((integrante) => ({
    nombre: integrante.nombre,
    cuantoTieneQueCobrar: integrante.plataQuePuso - cuantoPoneCadaUno,
  }));
}

export function calcularQuienesFaltaPonerPlata(
  integrantes: IntegranteDelSubgrupo[],
  cuantoPoneCadaUno: number,
): Deudor[] {
  const resultado = integrantes.filter((integrante) => integrante.plataQuePuso < cuantoPoneCadaUno);

  return resultado.map((integrante) => ({
    nombre: integrante.nombre,
    cuantoDebeEnTotal: cuantoPoneCadaUno - integrante.plataQuePuso,
    aQuienesLeDebe: [],
  }));
}

export function calcularDeudoresDelSubgrupo(integrantes: IntegranteDelSubgrupo[]): Deudor[] {
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

function listasDeIntegrantesSonIguales(array1: string[], array2: string[]) {
  array1.sort();
  array2.sort();
  for (let i = 0; i < array1.length; i++) {
    if (array1[i] !== array2[i]) return false;
  }
  return true;
}

export function siguienteId(subgruposExistentes: Subgrupo[]) {
  const ids = subgruposExistentes.map((subgrupo) => subgrupo.id);
  const maximo = Math.max(...ids);
  return maximo + 1;
}

export function siElSubgrupoExisteActualizarPlataQuePusoYDevolverloSinoCrearlo(
  subgruposExistentes: Subgrupo[],
  integrante: IntegranteDelGrupo,
): Subgrupo {
  let resultado = null;

  subgruposExistentes.some((subgrupo) => {
    if (
      listasDeIntegrantesSonIguales(
        subgrupo.integrantes.map((i) => i.nombre),
        integrante.divideEntre,
      )
    ) {
      const integrantesDelResultado = subgrupo.integrantes.map((x) =>
        x.nombre === integrante.nombre
          ? { nombre: x.nombre, plataQuePuso: integrante.plataQuePuso }
          : x,
      );
      resultado = { id: subgrupo.id, integrantes: integrantesDelResultado };
      return true;
    }
  });

  if (resultado !== null) {
    return resultado;
  } else {
    integrante.divideEntre = integrante.divideEntre.filter((item) => item !== integrante.nombre);

    const integrantesDelResultado = integrante.divideEntre.map((x) => ({
      nombre: x,
      plataQuePuso: 0,
    }));

    return {
      id: siguienteId(subgruposExistentes),
      integrantes: [
        { nombre: integrante.nombre, plataQuePuso: integrante.plataQuePuso },
        ...integrantesDelResultado,
      ],
    };
  }
}

export function identificarSubgrupos(grupo: Grupo): Subgrupo[] {
  const subgrupos: Subgrupo[] = [];

  // grupo.integrantes.forEach((integrante) => {
  //   if (subgrupos)
  // })

  return [];
}

export function calcular(integrantes: IntegranteDelGrupo[]): Deudor[] {
  const subgrupos = identificarSubgrupos({ integrantes });

  return calcularDeudoresDelSubgrupo(integrantes);
}
