import { formatMoney } from "@/domain/money";
import type { Entry } from "@/domain/types";

interface Props {
  entry: Entry;
  confirming: boolean;
  onEdit: () => void;
  onAskDelete: () => void;
  onConfirmDelete: () => void;
  onCancelDelete: () => void;
}

export function EntryItem({ entry, confirming, onEdit, onAskDelete, onConfirmDelete, onCancelDelete }: Props) {
  return (
    <div className="ent">
      <div className="t">
        <span>{entry.client}</span>
        <span>{formatMoney(entry.cents)}</span>
      </div>
      <div className="p">{entry.proc}</div>
      <div className="a">
        {confirming ? (
          <>
            Apagar?
            <button className="link red" onClick={onConfirmDelete}>
              Sim
            </button>
            <button className="link" onClick={onCancelDelete}>
              Não
            </button>
          </>
        ) : (
          <>
            <button className="link" onClick={onEdit}>
              Editar
            </button>
            <button className="link red" onClick={onAskDelete}>
              Apagar
            </button>
          </>
        )}
      </div>
    </div>
  );
}
