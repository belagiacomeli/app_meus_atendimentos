import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from "react";

type ShowToast = (message: string) => void;
const ToastContext = createContext<ShowToast>(() => {});

export const useToast = () => useContext(ToastContext);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [message, setMessage] = useState("");
  const [visible, setVisible] = useState(false);
  const timer = useRef<number | undefined>(undefined);

  const show = useCallback<ShowToast>((msg) => {
    setMessage(msg);
    setVisible(true);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setVisible(false), 1800);
  }, []);

  return (
    <ToastContext.Provider value={show}>
      {children}
      <div className={"toast" + (visible ? " show" : "")} role="status">
        {message}
      </div>
    </ToastContext.Provider>
  );
}
