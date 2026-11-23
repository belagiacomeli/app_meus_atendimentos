import { DEFAULT_PROCS, type AppData, type Entry } from "@/domain/types";

export type Action =
  | { type: "entry/add"; entry: Entry }
  | { type: "entry/update"; entry: Entry }
  | { type: "entry/delete"; id: string }
  | { type: "proc/add"; name: string }
  | { type: "proc/remove"; index: number }
  | { type: "name/set"; name: string };

export function reducer(state: AppData, action: Action): AppData {
  switch (action.type) {
    case "entry/add":
      return { ...state, entries: [...state.entries, action.entry] };
    case "entry/update":
      return {
        ...state,
        entries: state.entries.map((e) => (e.id === action.entry.id ? action.entry : e)),
      };
    case "entry/delete":
      return { ...state, entries: state.entries.filter((e) => e.id !== action.id) };
    case "proc/add":
      return state.procs.includes(action.name)
        ? state
        : { ...state, procs: [...state.procs, action.name] };
    case "proc/remove": {
      const procs = state.procs.filter((_, i) => i !== action.index);
      return { ...state, procs: procs.length ? procs : [...DEFAULT_PROCS] };
    }
    case "name/set":
      return { ...state, name: action.name };
  }
}
