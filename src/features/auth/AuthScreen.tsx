import { useState, type FormEvent } from "react";
import { supabase } from "@/services/supabase";

const MESSAGES: Record<string, string> = {
  "Invalid login credentials": "E-mail ou senha incorretos.",
  "User already registered": "Esse e-mail já tem conta. Use a aba Entrar.",
  "Email not confirmed": "Confirme seu e-mail pelo link que enviamos.",
};

const friendly = (msg: string) =>
  MESSAGES[msg] ??
  (/password/i.test(msg)
    ? "A senha precisa ter pelo menos 6 caracteres."
    : "Não deu certo. Confira a internet e tente de novo.");

export function AuthScreen() {
  const [mode, setMode] = useState<"entrar" | "criar">("entrar");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  async function submit(ev: FormEvent) {
    ev.preventDefault();
    setError("");
    setInfo("");
    if (!email.trim() || !password) return setError("Preencha e-mail e senha.");
    setBusy(true);
    try {
      if (mode === "entrar") {
        const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
        if (error) setError(friendly(error.message));
      } else {
        const { data, error } = await supabase.auth.signUp({ email: email.trim(), password });
        if (error) setError(friendly(error.message));
        else if (!data.session) {
          setInfo("Enviamos um link de confirmação para o seu e-mail. Abra e volte aqui para entrar.");
        }
      }
    } catch {
      setError(friendly(""));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="wrap">
      <h1>Meus Atendimentos</h1>
      <div className="sub">Entre para guardar seu histórico com segurança.</div>

      <div className="tabs">
        <button className={"tab" + (mode === "entrar" ? " on" : "")} onClick={() => setMode("entrar")}>
          Entrar
        </button>
        <button className={"tab" + (mode === "criar" ? " on" : "")} onClick={() => setMode("criar")}>
          Criar conta
        </button>
      </div>

      <form className="card" onSubmit={submit}>
        <label htmlFor="a-email">E-mail</label>
        <input
          id="a-email"
          type="email"
          inputMode="email"
          autoComplete="email"
          autoCapitalize="none"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <label htmlFor="a-pass">Senha</label>
        <input
          id="a-pass"
          type="password"
          autoComplete={mode === "entrar" ? "current-password" : "new-password"}
          placeholder={mode === "criar" ? "Mínimo de 6 caracteres" : ""}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {error && (
          <div className="hint" role="alert" style={{ color: "var(--danger)" }}>
            {error}
          </div>
        )}
        {info && (
          <div className="hint" role="status">
            {info}
          </div>
        )}
        <button className="btn" type="submit" disabled={busy}>
          {busy ? "Aguarde…" : mode === "entrar" ? "Entrar" : "Criar conta"}
        </button>
      </form>
    </div>
  );
}
