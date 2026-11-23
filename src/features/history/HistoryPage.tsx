import { groupByWeek, sum, weekLabel } from "@/domain/entries";
import { formatMoney } from "@/domain/money";
import type { ISODate } from "@/domain/types";
import { useAppData } from "@/state/AppDataContext";

export function HistoryPage({ onOpenWeek }: { onOpenWeek: (ws: ISODate) => void }) {
  const { data } = useAppData();
  const weeks = groupByWeek(data.entries);

  if (!weeks.length) {
    return <div className="empty">Seu histórico aparece aqui depois do primeiro atendimento.</div>;
  }

  return (
    <>
      {weeks.map(({ weekStart, items }) => (
        <button key={weekStart} className="hist" onClick={() => onOpenWeek(weekStart)}>
          <div>
            <b>{weekLabel(weekStart)}</b>
            <span>
              {items.length} {items.length === 1 ? "atendimento" : "atendimentos"}
            </span>
          </div>
          <div className="v">{formatMoney(sum(items))}</div>
        </button>
      ))}
      <div className="status">
        {weeks.length} {weeks.length === 1 ? "semana" : "semanas"} registradas · soma geral{" "}
        {formatMoney(sum(data.entries))}
      </div>
    </>
  );
}
