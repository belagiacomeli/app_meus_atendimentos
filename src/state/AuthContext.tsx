import { createContext, useContext } from "react";
import type { User } from "@supabase/supabase-js";

interface AuthCtx {
  user: User;
  signOut: () => Promise<void>;
}

export const AuthContext = createContext<AuthCtx | null>(null);

export function useAuth(): AuthCtx {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth precisa estar dentro de <AuthGate>");
  return ctx;
}
