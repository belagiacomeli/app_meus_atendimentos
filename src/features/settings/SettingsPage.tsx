import { useState } from "react";
import { useToast } from "@/components/Toast";
import { useAppData } from "@/state/AppDataContext";

export function SettingsPage() {
  const { data, dispatch } = useAppData();
  const toast = useToast();
  const [name, setName] = useState(data.name);
  const [newProc, setNewProc] = useState("");

  function addProc() {
    const p = newProc.trim();
    if (!p) return toast("Escreva o nome");
    dispatch({ type: "proc/add", name: p });
    setNewProc("");
    toast("Adicionado ✓");
  }

  return (
    <>
      <div className="card">
        <b>Seu nome</b>
        <div className="sub">Aparece no topo do PDF.</div>
        <input type="text" placeholder="Seu nome" value={name} onChange={(e) => setName(e.target.value)} />
        <button
          className="btn sec"
          onClick={() => {
            dispatch({ type: "name/set", name: name.trim() });
            toast("Nome salvo ✓");
          }}
        >
          Salvar nome
        </button>
      </div>

      <div className="card">
        <b>Procedimentos</b>
        <div className="sub">
          Aparecem na lista ao anotar um atendimento. Apagar da lista não mexe nos atendimentos já anotados.
        </div>
        {data.procs.map((p, i) => (
          <div className="chip" key={p}>
            <span>{p}</span>
            <button className="link red" onClick={() => dispatch({ type: "proc/remove", index: i })}>
              Remover
            </button>
          </div>
        ))}
        <label htmlFor="p-new">Adicionar procedimento</label>
        <input
          id="p-new"
          type="text"
          placeholder="Ex.: Hidratação"
          value={newProc}
          onChange={(e) => setNewProc(e.target.value)}
        />
        <button className="btn" onClick={addProc}>
          Adicionar à lista
        </button>
      </div>
    </>
  );
}
