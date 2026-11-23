import type { AppData, Entry } from "@/domain/types";
import { archiveLocalData, normalize, readLocalData, type DataRepository } from "./storage";
import { supabase } from "./supabase";

interface EntryRow {
  id: string;
  date: string;
  client: string;
  proc: string;
  cents: number;
}

const fail = (error: { message: string } | null) => {
  if (error) throw new Error(error.message);
};

const toRow = (e: Entry) => ({ id: e.id, date: e.date, client: e.client, proc: e.proc, cents: e.cents });

/** Dados da pessoa logada. O user_id é preenchido pelo banco (auth.uid()). */
export const supabaseRepository: DataRepository & {
  /** Verdadeiro quando a conta ainda não tem nada salvo. */
  isEmptyAccount(data: AppData): boolean;
  importAll(data: AppData): Promise<void>;
} = {
  async load() {
    const [entries, settings] = await Promise.all([
      supabase.from("entries").select("id,date,client,proc,cents").order("date").order("created_at"),
      supabase.from("user_settings").select("name,procs").maybeSingle(),
    ]);
    fail(entries.error);
    fail(settings.error);
    return normalize({
      entries: (entries.data ?? []) as EntryRow[],
      name: settings.data?.name ?? "",
      procs: settings.data?.procs ?? null,
    });
  },

  async addEntry(entry) {
    fail((await supabase.from("entries").insert(toRow(entry))).error);
  },

  async updateEntry(entry) {
    const { id, ...rest } = toRow(entry);
    fail((await supabase.from("entries").update(rest).eq("id", id)).error);
  },

  async deleteEntry(id) {
    fail((await supabase.from("entries").delete().eq("id", id)).error);
  },

  async saveSettings({ name, procs }) {
    // user_id vem do default auth.uid(); o upsert usa a chave primária user_id
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) throw new Error("Sessão expirada");
    fail((await supabase.from("user_settings").upsert({ user_id: auth.user.id, name, procs })).error);
  },

  isEmptyAccount: (data) => data.entries.length === 0 && !data.name.trim(),

  async importAll(data) {
    if (data.entries.length) {
      fail((await supabase.from("entries").upsert(data.entries.map(toRow))).error);
    }
    await supabaseRepository.saveSettings({ name: data.name, procs: data.procs });
  },
};

/**
 * Primeira entrada numa conta vazia: envia para ela o que já estava salvo neste aparelho.
 * Guarda uma cópia local de segurança e não repete se a conta já tiver dados.
 */
export async function migrateLocalToAccount(): Promise<void> {
  const local = readLocalData();
  if (!local.entries.length && !local.name.trim()) return;
  const remote = await supabaseRepository.load();
  if (!supabaseRepository.isEmptyAccount(remote)) return;
  await supabaseRepository.importAll(local);
  archiveLocalData();
}
