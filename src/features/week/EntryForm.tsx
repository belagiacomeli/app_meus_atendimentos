import { useState } from "react";
import { useToast } from "@/components/Toast";
import { isDayOff, today } from "@/domain/date";
import { centsToInput, parseMoney } from "@/domain/money";
import type { Entry, ISODate } from "@/domain/types";
import { useAppData } from "@/state/AppDataContext";

const NEW_PROC = "__new";
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);

interface Props {
  editing: Entry | null;
  lastDate: ISODate | null;
  /** Chamado depois de salvar, com a data usada. */
  onSaved: (date: ISODate) => void;
  onCancel: () => void;
}

export function EntryForm({ editing, lastDate, onSaved, onCancel }: Props) {
  const { data, dispatch } = useAppData();
  const toast = useToast();

  const [date, setDate] = useState(editing?.date ?? lastDate ?? today());
  const [client, setClient] = useState(editing?.client ?? "");
  const [proc, setProc] = useState(editing?.proc ?? data.procs[0] ?? "");
  const [newProc, setNewProc] = useState("");
  const [value, setValue] = useState(editing ? centsToInput(editing.cents) : "");

  const procs = editing && !data.procs.includes(editing.proc) ? [...data.procs, editing.proc] : data.procs;

  function submit() {
    const procName = proc === NEW_PROC ? newProc.trim() : proc;
    const cents = parseMoney(value);
    if (!date) return toast("Escolha a data");
    if (!client.trim()) return toast("Escreva o nome da cliente");
    if (!procName) return toast("Escolha o procedimento");
    if (!cents) return toast("Digite o valor");

    const entry: Entry = { id: editing?.id ?? uid(), date, client: client.trim(), proc: procName, cents };
    dispatch({ type: editing ? "entry/update" : "entry/add", entry });

    toast("Salvo ✓");
    if (!editing) {
      setClient("");
      setValue("");
      setNewProc("");
      setProc(data.procs[0] ?? "");
    }
    onSaved(date);
  }

  return (
    <div className="card">
      <b>{editing ? "Editar atendimento" : "Novo atendimento"}</b>

      <label htmlFor="f-date">Data</label>
      <input id="f-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
      {isDayOff(date) && (
        <div className="hint">Domingo e segunda são folga. Anote só se você trabalhou nesse dia.</div>
      )}

      <label htmlFor="f-client">Cliente</label>
      <input
        id="f-client"
        type="text"
        placeholder="Nome da cliente"
        autoComplete="off"
        value={client}
        onChange={(e) => setClient(e.target.value)}
      />

      <label htmlFor="f-proc">Procedimento</label>
      <select id="f-proc" value={proc} onChange={(e) => setProc(e.target.value)}>
        {procs.map((p) => (
          <option key={p} value={p}>
            {p}
          </option>
        ))}
        <option value={NEW_PROC}>Outro (escrever)</option>
      </select>
      {proc === NEW_PROC && (
        <input
          type="text"
          placeholder="Escreva o serviço feito"
          style={{ marginTop: 8 }}
          autoFocus
          value={newProc}
          onChange={(e) => setNewProc(e.target.value)}
        />
      )}

      <label htmlFor="f-val">Valor (R$)</label>
      <input
        id="f-val"
        type="text"
        inputMode="decimal"
        placeholder="0,00"
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />

      <button className="btn" onClick={submit}>
        {editing ? "Salvar alteração" : "Adicionar"}
      </button>
      {editing && (
        <button className="btn sec" onClick={onCancel}>
          Cancelar
        </button>
      )}
    </div>
  );
}
