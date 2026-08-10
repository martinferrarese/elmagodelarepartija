export type MiembroSubgrupo = {
  nombre: string;
  monto: number;
};

export type SubgrupoJuntada = {
  id: number;
  nombre: string;
  miembros: MiembroSubgrupo[];
};

export type Juntada = {
  roster: string[];
  subgrupos: SubgrupoJuntada[];
};

export type Transferencia = {
  de: string;
  a: string;
  monto: number;
};

export type LineaDesglose = {
  nombre: string;
  puso: number;
  cuota: number;
  saldo: number;
};

export type DesgloseSubgrupo = {
  id: number;
  nombre: string;
  total: number;
  cantidadMiembros: number;
  cuota: number;
  lineas: LineaDesglose[];
};
