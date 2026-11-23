import { useState } from "react";
import { Tabs, type TabId } from "@/components/Tabs";
import { today, weekStartOf } from "@/domain/date";
import type { ISODate } from "@/domain/types";
import { HistoryPage } from "@/features/history/HistoryPage";
import { SettingsPage } from "@/features/settings/SettingsPage";
import { WeekPage } from "@/features/week/WeekPage";

export default function App() {
  const [tab, setTab] = useState<TabId>("semana");
  const [weekStart, setWeekStart] = useState<ISODate>(() => weekStartOf(today()));

  return (
    <div className="wrap">
      <h1>Meus Atendimentos</h1>
      <div className="sub">Anote o dia, some a semana e mande para a chefe.</div>
      <Tabs active={tab} onChange={setTab} />

      {tab === "semana" && <WeekPage weekStart={weekStart} onWeekChange={setWeekStart} />}
      {tab === "historico" && (
        <HistoryPage
          onOpenWeek={(ws) => {
            setWeekStart(ws);
            setTab("semana");
            window.scrollTo(0, 0);
          }}
        />
      )}
      {tab === "ajustes" && <SettingsPage />}

      <div className="status">Dados salvos só neste aparelho</div>
    </div>
  );
}
