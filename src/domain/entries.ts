import { addDays, dayLabel, formatDM, weekStartOf } from "./date";
import { formatMoney } from "./money";
import type { Entry, ISODate } from "./types";

export const sum = (list: Entry[]): number => list.reduce((t, e) => t + e.cents, 0);

/** Atendimentos de uma semana (começa em `ws`), ordenados por data. */
export function weekEntries(entries: Entry[], ws: ISODate): Entry[] {
  const we = addDays(ws, 6);
  return entries
    .filter((e) => e.date >= ws && e.date <= we)
    .sort((a, b) => (a.date === b.date ? a.id.localeCompare(b.id) : a.date.localeCompare(b.date)));
}

/** "03/11 a 07/11" (terça a sábado). */
export const weekLabel = (ws: ISODate): string => `${formatDM(ws)} a ${formatDM(addDays(ws, 4))}`;

/** Agrupa por dia mantendo a ordem. */
export function groupByDay(list: Entry[]): { date: ISODate; items: Entry[] }[] {
  const groups: { date: ISODate; items: Entry[] }[] = [];
  for (const e of list) {
    const last = groups[groups.length - 1];
    if (last && last.date === e.date) last.items.push(e);
    else groups.push({ date: e.date, items: [e] });
  }
  return groups;
}

/** Semanas com atendimentos, da mais recente para a mais antiga. */
export function groupByWeek(entries: Entry[]): { weekStart: ISODate; items: Entry[] }[] {
  const map = new Map<ISODate, Entry[]>();
  for (const e of entries) {
    const w = weekStartOf(e.date);
    map.set(w, [...(map.get(w) ?? []), e]);
  }
  return [...map.entries()]
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([weekStart, items]) => ({ weekStart, items }));
}

/** Texto para copiar e mandar para a chefe. */
export function summaryText(entries: Entry[], ws: ISODate): string {
  const list = weekEntries(entries, ws);
  const lines = [`Semana ${weekLabel(ws)}`, ""];
  for (const day of groupByDay(list)) {
    lines.push(dayLabel(day.date));
    for (const e of day.items) lines.push(`- ${e.client} | ${e.proc} | ${formatMoney(e.cents)}`);
  }
  lines.push("", `TOTAL DA SEMANA: ${formatMoney(sum(list))}`);
  return lines.join("\n");
}
