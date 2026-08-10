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
