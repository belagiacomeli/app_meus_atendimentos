import type { ISODate } from "./types";

const DOW = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

const pad = (n: number) => (n < 10 ? "0" : "") + n;

export const toISO = (d: Date): ISODate =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

export const parseISO = (s: ISODate): Date => {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
};

export const today = (): ISODate => toISO(new Date());

export const addDays = (s: ISODate, n: number): ISODate => {
  const d = parseISO(s);
  d.setDate(d.getDate() + n);
  return toISO(d);
};

/** A semana de trabalho começa na terça-feira. */
export const weekStartOf = (s: ISODate): ISODate =>
  addDays(s, -((parseISO(s).getDay() + 5) % 7));

/** "05/11" */
export const formatDM = (s: ISODate): string => {
  const [, m, d] = s.split("-");
  return `${d}/${m}`;
};

/** "Ter 05/11" */
export const dayLabel = (s: ISODate): string =>
  `${DOW[parseISO(s).getDay()]} ${formatDM(s)}`;

/** Domingo e segunda são folga. */
export const isDayOff = (s: ISODate): boolean => {
  if (!s) return false;
  const g = parseISO(s).getDay();
  return g === 0 || g === 1;
};
