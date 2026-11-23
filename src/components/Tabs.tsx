export type TabId = "semana" | "historico" | "ajustes";

const TABS: { id: TabId; label: string }[] = [
  { id: "semana", label: "Semana" },
  { id: "historico", label: "Histórico" },
  { id: "ajustes", label: "Ajustes" },
];

export function Tabs({ active, onChange }: { active: TabId; onChange: (t: TabId) => void }) {
  return (
    <div className="tabs">
      {TABS.map((t) => (
        <button key={t.id} className={"tab" + (active === t.id ? " on" : "")} onClick={() => onChange(t.id)}>
          {t.label}
        </button>
      ))}
    </div>
  );
}
