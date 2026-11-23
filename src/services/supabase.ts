import { createClient } from "@supabase/supabase-js";

// A chave "publishable" foi feita para ficar no app. Quem protege os dados são as
// regras de segurança (RLS) do banco, veja supabase/schema.sql.
// Para usar outro projeto, defina VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY.
const URL = import.meta.env.VITE_SUPABASE_URL ?? "https://quszaelwymaqhvkwkkwv.supabase.co";
const KEY = import.meta.env.VITE_SUPABASE_ANON_KEY ?? "sb_publishable_DLjAV9h6wno_uBmOSeZglg_oWSlhg_q";

export const supabase = createClient(URL, KEY);
