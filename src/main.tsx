import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { ToastProvider } from "./components/Toast";
import { AuthGate } from "./features/auth/AuthGate";
import { migrateLocalToAccount, supabaseRepository } from "./services/supabaseRepository";
import { AppDataProvider } from "./state/AppDataContext";
import "./styles/global.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ToastProvider>
      <AuthGate>
        <AppDataProvider repository={supabaseRepository} prepare={migrateLocalToAccount}>
          <App />
        </AppDataProvider>
      </AuthGate>
    </ToastProvider>
  </StrictMode>,
);
