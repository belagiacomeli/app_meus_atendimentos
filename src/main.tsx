import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { ToastProvider } from "./components/Toast";
import { AppDataProvider } from "./state/AppDataContext";
import "./styles/global.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AppDataProvider>
      <ToastProvider>
        <App />
      </ToastProvider>
    </AppDataProvider>
  </StrictMode>,
);
