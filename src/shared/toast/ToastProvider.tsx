import React, { createContext, useCallback, useContext, useState } from "react";
import { CheckCircle2, AlertCircle, Info, Loader2 } from "lucide-react";
import { cn } from "lib/utils";

export type ToastVariant = "info" | "success" | "error" | "loading";

export interface Toast {
  id: string;
  message: string;
  variant: ToastVariant;
}

interface ToastContextValue {
  show: (message: string, variant?: ToastVariant) => string;
  update: (id: string, message: string, variant?: ToastVariant) => void;
  dismiss: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const VARIANT_ICON: Record<ToastVariant, React.ComponentType<{ className?: string }>> = {
  info: Info,
  success: CheckCircle2,
  error: AlertCircle,
  loading: Loader2,
};

const VARIANT_ICON_CLASS: Record<ToastVariant, string> = {
  info: "text-text-muted",
  success: "text-success",
  error: "text-destructive",
  loading: "animate-spin text-text-muted",
};

const AUTO_DISMISS_MS: Record<ToastVariant, number | null> = {
  info: 4000,
  success: 4000,
  error: 6000,
  loading: null,
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const scheduleAutoDismiss = useCallback(
    (id: string, variant: ToastVariant) => {
      const delay = AUTO_DISMISS_MS[variant];
      if (delay == null) return;
      window.setTimeout(() => dismiss(id), delay);
    },
    [dismiss],
  );

  const show = useCallback(
    (message: string, variant: ToastVariant = "info") => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      setToasts((prev) => [...prev, { id, message, variant }]);
      scheduleAutoDismiss(id, variant);
      return id;
    },
    [scheduleAutoDismiss],
  );

  const update = useCallback(
    (id: string, message: string, variant: ToastVariant = "info") => {
      setToasts((prev) =>
        prev.map((toast) => (toast.id === id ? { ...toast, message, variant } : toast)),
      );
      scheduleAutoDismiss(id, variant);
    },
    [scheduleAutoDismiss],
  );

  return (
    <ToastContext.Provider value={{ show, update, dismiss }}>
      {children}
      <div className="pointer-events-none fixed bottom-card right-card z-50 flex flex-col gap-item">
        {toasts.map((toast) => {
          const Icon = VARIANT_ICON[toast.variant];
          return (
            <div
              key={toast.id}
              role="status"
              className="pointer-events-auto flex items-center gap-item rounded-control border border-island-border bg-material-vibrant px-component py-control text-body text-text-primary shadow-premium backdrop-blur-2xl transition-all duration-motion-fast ease-motion-standard"
            >
              <Icon className={cn("h-4 w-4 shrink-0", VARIANT_ICON_CLASS[toast.variant])} />
              <span>{toast.message}</span>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextValue => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};
