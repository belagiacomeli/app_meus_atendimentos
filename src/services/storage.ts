import { DEFAULT_PROCS, emptyData, type AppData, type Entry } from "@/domain/types";

/**
 * Contrato de persistência. Há duas implementações: localStorage (neste arquivo)
 * e Supabase (supabaseRepository.ts). As telas não sabem qual está em uso.
 */
export interface DataRepository {
  load(): Promise<AppData>;
  addEntry(entry: Entry): Promise<void>;
  updateEntry(entry: Entry): Promise<void>;
  deleteEntry(id: string): Promise<void>;
  saveSettings(settings: Pick<AppData, "name" | "procs">): Promise<void>;
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

export const LOCAL_KEY = "atendimentos_v1"; // mesma chave da versão antiga: dados existentes continuam valendo

/** Aceita qualquer coisa vinda do disco ou do banco e devolve dados válidos. */
export function normalize(raw: unknown): AppData {
  const out = emptyData();
  if (!raw || typeof raw !== "object") return out;
  const d = raw as Partial<AppData>;
  if (typeof d.name === "string") out.name = d.name;
  if (Array.isArray(d.entries)) out.entries = d.entries;
  if (Array.isArray(d.procs) && d.procs.length && !isLegacy(d.procs)) out.procs = d.procs as string[];
  else out.procs = [...DEFAULT_PROCS];
  return out;
}

function readLocal(): AppData {
  try {
    const raw = localStorage.getItem(LOCAL_KEY);
    return raw ? normalize(JSON.parse(raw)) : emptyData();
  } catch {
    return emptyData();
  }
}

function writeLocal(data: AppData): void {
  try {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(data));
  } catch {
    /* armazenamento cheio ou bloqueado: ignora */
  }
}

/** Dados salvos neste aparelho (usado também para migrar para a conta). */
export const readLocalData = readLocal;

/** Depois de enviar para a conta, guarda uma cópia e libera a chave principal. */
export function archiveLocalData(): void {
  try {
    const raw = localStorage.getItem(LOCAL_KEY);
    if (raw) localStorage.setItem(LOCAL_KEY + "_backup", raw);
    localStorage.removeItem(LOCAL_KEY);
  } catch {
    /* ignora */
  }
}

export const localRepository: DataRepository = {
  async load() {
    return readLocal();
  },
  async addEntry(entry) {
    const d = readLocal();
    writeLocal({ ...d, entries: [...d.entries, entry] });
  },
  async updateEntry(entry) {
    const d = readLocal();
    writeLocal({ ...d, entries: d.entries.map((e) => (e.id === entry.id ? entry : e)) });
  },
  async deleteEntry(id) {
    const d = readLocal();
    writeLocal({ ...d, entries: d.entries.filter((e) => e.id !== id) });
  },
  async saveSettings(settings) {
    writeLocal({ ...readLocal(), ...settings });
  },
};
