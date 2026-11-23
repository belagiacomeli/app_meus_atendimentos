import { DEFAULT_PROCS, emptyData, type AppData } from "@/domain/types";

/**
 * Contrato de persistência. Hoje usa localStorage; para trocar por uma API
 * ou Firebase basta criar outra implementação deste contrato.
 */
export interface DataRepository {
  load(): AppData;
  save(data: AppData): void;
}

/** Listas padrão de versões anteriores. Quem nunca editou a lista recebe a atual. */
const LEGACY_LISTS: string[][] = [
  ["Escova", "Progressiva", "Limpeza de mega hair"],
  [
    "Escova",
    "Progressiva",
    "Hidratação",
    "Limpeza de mega hair",
    "Retirada de mega hair e passada de fita",
    "Descoloração",
    "Coloração",
  ],
];
const isLegacy = (procs: unknown[]) =>
  LEGACY_LISTS.some((l) => l.length === procs.length && l.every((p, i) => procs[i] === p));

const KEY = "atendimentos_v1"; // mesma chave da versão antiga: dados existentes continuam valendo

/** Aceita qualquer coisa vinda do disco e devolve dados válidos. */
export function normalize(raw: unknown): AppData {
  const out = emptyData();
  if (!raw || typeof raw !== "object") return out;
  const d = raw as Partial<AppData>;
  if (typeof d.name === "string") out.name = d.name;
  if (Array.isArray(d.entries)) out.entries = d.entries;
  if (Array.isArray(d.procs) && d.procs.length && !isLegacy(d.procs)) out.procs = d.procs;
  else out.procs = [...DEFAULT_PROCS];
  return out;
}

export const localRepository: DataRepository = {
  load() {
    try {
      const raw = localStorage.getItem(KEY);
      return raw ? normalize(JSON.parse(raw)) : emptyData();
    } catch {
      return emptyData();
    }
  },
  save(data) {
    try {
      localStorage.setItem(KEY, JSON.stringify(data));
    } catch {
      /* armazenamento cheio ou bloqueado: ignora */
    }
  },
};
