import { useState } from "react";
import { useAppData } from "@/state/AppDataContext";

/** Aparece na tela da semana só enquanto o nome não foi informado. */
export function NamePrompt() {
  const { data, dispatch } = useAppData();
  const [name, setName] = useState("");

  if (data.name.trim()) return null;

  const commit = () => {
    if (name.trim()) dispatch({ type: "name/set", name: name.trim() });
  };

  return (
    <div className="card">
      <b>Qual é o seu nome?</b>
      <div className="sub">Ele fica salvo neste aparelho e aparece no PDF da semana.</div>
      <input
        id="first-name"
        type="text"
        placeholder="Seu nome"
        autoComplete="given-name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => e.key === "Enter" && commit()}
      />
      <button className="btn" onClick={commit}>
        Salvar nome
      </button>
    </div>
  );
}
