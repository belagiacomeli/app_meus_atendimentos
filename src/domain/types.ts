/** Data no formato ISO "YYYY-MM-DD". */
export type ISODate = string;

export interface Entry {
  id: string;
  date: ISODate;
  client: string;
  proc: string;
  /** Valor em centavos, evita erro de ponto flutuante. */
  cents: number;
}

export interface AppData {
  entries: Entry[];
  procs: string[];
  name: string;
}

export const DEFAULT_PROCS = [
  "Escova",
  "Progressiva",
  "Hidratação",
  "Limpeza de mega hair",
  "Retirada de mega hair e passada de fita",
  "Descoloração",
  "Coloração",
];

export const emptyData = (): AppData => ({
  entries: [],
  procs: [...DEFAULT_PROCS],
  name: "",
});
