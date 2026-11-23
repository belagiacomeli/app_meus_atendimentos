import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useToast } from "@/components/Toast";
import { emptyData, type AppData } from "@/domain/types";
import type { DataRepository } from "@/services/storage";
import { reducer, type Action } from "./reducer";

interface Ctx {
  data: AppData;
  dispatch: (action: Action) => void;
}

const AppDataContext = createContext<Ctx | null>(null);

const SETTINGS_DELAY_MS = 700;

interface Props {
  children: ReactNode;
  repository: DataRepository;
  /** Roda antes de carregar (ex.: migrar dados do aparelho para a conta). */
  prepare?: () => Promise<void>;
}

/**
 * Guarda os dados em memória (resposta imediata na tela) e repassa cada
 * mudança ao repositório. Se salvar falhar, avisa a pessoa.
 */
export function AppDataProvider({ children, repository, prepare }: Props) {
  const toast = useToast();
  const [data, rawDispatch] = useReducer(reducer, undefined, emptyData);
  const stateRef = useRef<AppData>(data);
  const settingsTimer = useRef<number | undefined>(undefined);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setStatus("loading");
    (async () => {
      try {
        await prepare?.();
        const loaded = await repository.load();
        if (cancelled) return;
        stateRef.current = loaded;
        rawDispatch({ type: "data/replace", data: loaded });
        setStatus("ready");
      } catch {
        if (!cancelled) setStatus("error");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [repository, prepare, attempt]);

  const guard = useCallback(
    (p: Promise<void>) => {
      p.catch(() => toast("Não consegui salvar. Confira a internet."));
    },
    [toast],
  );

  // Nome e procedimentos são salvos juntos, com um pequeno atraso para não enviar a cada letra.
  const flushSettings = useCallback(() => {
    if (settingsTimer.current === undefined) return;
    window.clearTimeout(settingsTimer.current);
    settingsTimer.current = undefined;
    const { name, procs } = stateRef.current;
    guard(repository.saveSettings({ name, procs }));
  }, [repository, guard]);

  useEffect(() => {
    const onHide = () => {
      if (document.visibilityState === "hidden") flushSettings();
    };
    document.addEventListener("visibilitychange", onHide);
    return () => document.removeEventListener("visibilitychange", onHide);
  }, [flushSettings]);

  const dispatch = useCallback(
    (action: Action) => {
      stateRef.current = reducer(stateRef.current, action);
      rawDispatch(action);
      switch (action.type) {
        case "entry/add":
          return guard(repository.addEntry(action.entry));
        case "entry/update":
          return guard(repository.updateEntry(action.entry));
        case "entry/delete":
          return guard(repository.deleteEntry(action.id));
        case "proc/add":
        case "proc/remove":
        case "name/set":
          window.clearTimeout(settingsTimer.current);
          settingsTimer.current = window.setTimeout(flushSettings, SETTINGS_DELAY_MS);
      }
    },
    [repository, guard, flushSettings],
  );

  const value = useMemo(() => ({ data, dispatch }), [data, dispatch]);

  if (status === "loading") {
    return (
      <div className="wrap">
        <div className="empty">Carregando…</div>
      </div>
    );
  }
  if (status === "error") {
    return (
      <div className="wrap">
        <div className="empty">Não consegui carregar seus atendimentos. Confira a internet.</div>
        <button className="btn" onClick={() => setAttempt((n) => n + 1)}>
          Tentar de novo
        </button>
      </div>
    );
  }
  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}

export function useAppData(): Ctx {
  const ctx = useContext(AppDataContext);
  if (!ctx) throw new Error("useAppData precisa estar dentro de <AppDataProvider>");
  return ctx;
}
