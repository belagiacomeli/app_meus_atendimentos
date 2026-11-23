import { createContext, useContext, useEffect, useReducer, type Dispatch, type ReactNode } from "react";
import type { AppData } from "@/domain/types";
import { localRepository, type DataRepository } from "@/services/storage";
import { reducer, type Action } from "./reducer";

interface Ctx {
  data: AppData;
  dispatch: Dispatch<Action>;
}

const AppDataContext = createContext<Ctx | null>(null);

export function AppDataProvider({
  children,
  repository = localRepository,
}: {
  children: ReactNode;
  repository?: DataRepository;
}) {
  const [data, dispatch] = useReducer(reducer, repository, (r) => r.load());

  useEffect(() => {
    repository.save(data);
  }, [data, repository]);

  return <AppDataContext.Provider value={{ data, dispatch }}>{children}</AppDataContext.Provider>;
}

export function useAppData(): Ctx {
  const ctx = useContext(AppDataContext);
  if (!ctx) throw new Error("useAppData precisa estar dentro de <AppDataProvider>");
  return ctx;
}
