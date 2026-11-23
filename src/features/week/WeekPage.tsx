import { useState } from "react";
import { useToast } from "@/components/Toast";
import { addDays, dayLabel, today, weekStartOf } from "@/domain/date";
import { groupByDay, sum, summaryText, weekEntries, weekLabel } from "@/domain/entries";
import { formatMoney } from "@/domain/money";
import type { ISODate } from "@/domain/types";
import { copyText } from "@/services/clipboard";
import { useAppData } from "@/state/AppDataContext";
import { EntryForm } from "./EntryForm";
import { EntryItem } from "./EntryItem";

interface Props {
  weekStart: ISODate;
  onWeekChange: (ws: ISODate) => void;
}

export function WeekPage({ weekStart, onWeekChange }: Props) {
  const { data, dispatch } = useAppData();
  const toast = useToast();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [lastDate, setLastDate] = useState<ISODate | null>(null);
  const [copyBox, setCopyBox] = useState<string | null>(null);

  const list = weekEntries(data.entries, weekStart);
  const isCurrent = weekStart === weekStartOf(today());
  const editing = data.entries.find((e) => e.id === editingId) ?? null;

  const changeWeek = (ws: ISODate) => {
    setCopyBox(null);
    onWeekChange(ws);
  };

  async function copySummary() {
    const text = summaryText(data.entries, weekStart);
    if (await copyText(text)) toast("Resumo copiado ✓");
    else setCopyBox(text); // plano B: mostra o texto para copiar na mão
  }

  async function downloadPdf() {
    try {
      // carrega o jsPDF só quando precisa: deixa a abertura do app mais leve
      const { buildWeekPdf, downloadBlob, pdfFilename } = await import("@/services/pdf");
      downloadBlob(buildWeekPdf(data.entries, weekStart, data.name), pdfFilename(weekStart));
      toast("PDF pronto ✓");
    } catch {
      toast("Não consegui gerar o PDF");
    }
  }

  return (
    <>
      {/* key força recriar o formulário ao trocar entre novo/editar */}
      <EntryForm
        key={editingId ?? "new"}
        editing={editing}
        lastDate={lastDate}
        onSaved={(date) => {
          setLastDate(date);
          setEditingId(null);
          setCopyBox(null);
          onWeekChange(weekStartOf(date));
        }}
        onCancel={() => setEditingId(null)}
      />

      <div className="nav">
        <button aria-label="Semana anterior" onClick={() => changeWeek(addDays(weekStart, -7))}>
          ‹
        </button>
        <div className="ttl">
          {weekLabel(weekStart)}
          <small>{isCurrent ? "Semana atual" : "Terça a sábado"}</small>
        </div>
        <button aria-label="Próxima semana" disabled={isCurrent} onClick={() => changeWeek(addDays(weekStart, 7))}>
          ›
        </button>
      </div>

      <div className="total">
        <div className="l">TOTAL DA SEMANA</div>
        <div className="v">{formatMoney(sum(list))}</div>
        <div className="c">
          {list.length} {list.length === 1 ? "atendimento" : "atendimentos"}
        </div>
      </div>

      {!list.length ? (
        <div className="empty">Nenhum atendimento nesta semana ainda.</div>
      ) : (
        <>
          {groupByDay(list).map((day) => (
            <div key={day.date}>
              <div className="day">
                <span>{dayLabel(day.date)}</span>
                <span>{formatMoney(sum(day.items))}</span>
              </div>
              {day.items.map((entry) => (
                <EntryItem
                  key={entry.id}
                  entry={entry}
                  confirming={confirmId === entry.id}
                  onEdit={() => {
                    setEditingId(entry.id);
                    window.scrollTo(0, 0);
                  }}
                  onAskDelete={() => setConfirmId(entry.id)}
                  onCancelDelete={() => setConfirmId(null)}
                  onConfirmDelete={() => {
                    dispatch({ type: "entry/delete", id: entry.id });
                    setConfirmId(null);
                    setCopyBox(null);
                    toast("Apagado");
                  }}
                />
              ))}
            </div>
          ))}
          <button className="btn" onClick={copySummary}>
            Copiar resumo para a chefe
          </button>
          <button className="btn pdf" onClick={downloadPdf}>
            Baixar PDF da semana
          </button>
          {copyBox && (
            <>
              <label htmlFor="copybox">Selecione e copie o texto abaixo:</label>
              <textarea id="copybox" rows={10} readOnly value={copyBox} onFocus={(e) => e.currentTarget.select()} />
            </>
          )}
        </>
      )}
    </>
  );
}
