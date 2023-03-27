export interface IntegranteDelGrupo {
  nombre: string;
  plataQuePuso: number;
  divideEntre: string[]; // array vacío divide entre todos
}

export interface IntegranteDelSubgrupo {
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
