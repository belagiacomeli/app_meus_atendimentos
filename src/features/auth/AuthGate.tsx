import { Fragment, useEffect, useState, type ReactNode } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/services/supabase";
import { AuthContext } from "@/state/AuthContext";
import { AuthScreen } from "./AuthScreen";

/** Só mostra o app para quem está logado. */
export function AuthGate({ children }: { children: ReactNode }) {
  // undefined = ainda descobrindo se há sessão salva
  const [session, setSession] = useState<Session | null | undefined>(undefined);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data } = supabase.auth.onAuthStateChange((_event, s) => setSession(s));
    return () => data.subscription.unsubscribe();
  }, []);

  if (session === undefined) {
    return (
      <div className="wrap">
        <div className="empty">Carregando…</div>
      </div>
    );
  }
  if (!session) return <AuthScreen />;

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user: session.user, signOut }}>
      {/* key: ao trocar de conta, tudo recomeça do zero */}
      <Fragment key={session.user.id}>{children}</Fragment>
    </AuthContext.Provider>
  );
}
