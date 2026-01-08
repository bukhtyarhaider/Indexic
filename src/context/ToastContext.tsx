import React, { createContext, useContext, useState, ReactNode } from "react";
import { Check, Info, X } from "lucide-react";

type ToastType = "success" | "error" | "info";

interface Toast {
  message: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (msg: string, type?: ToastType) => void;
  showError: (msg: string) => void;
  showSuccess: (msg: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};

interface ToastProviderProps {
  children: ReactNode;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  const [toast, setToast] = useState<Toast | null>(null);

  const showToast = (msg: string, type: ToastType = "success") => {
    setToast({ message: msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const showError = (msg: string) => {
    showToast(msg, "error");
  };

  const showSuccess = (msg: string) => {
    showToast(msg, "success");
  };

  const getToastStyles = (type: ToastType) => {
    switch (type) {
      case "error":
        return "bg-red-500/20 border-red-500/30";
      case "info":
        return "bg-blue-500/20 border-blue-500/30";
      case "success":
      default:
        return "bg-surface-highlight border-white/10";
    }
  };

  const getToastIcon = (type: ToastType) => {
    switch (type) {
      case "error":
        return (
          <div className="bg-red-500 rounded-full p-1">
            <X className="w-3 h-3 text-white" />
          </div>
        );
      case "info":
        return (
          <div className="bg-blue-500 rounded-full p-1">
            <Info className="w-3 h-3 text-white" />
          </div>
        );
      case "success":
      default:
        return (
          <div className="bg-primary rounded-full p-1">
            <Check className="w-3 h-3 text-white" />
          </div>
        );
    }
  };

  return (
    <ToastContext.Provider value={{ showToast, showError, showSuccess }}>
      {children}
      {toast && (
        <div
          className={`fixed top-6 right-6 z-50 animate-slide-in-right border text-white px-5 py-3 rounded-xl shadow-2xl text-sm font-medium flex items-center gap-3 ${getToastStyles(
            toast.type
          )}`}
        >
          {getToastIcon(toast.type)}
          {toast.message}
        </div>
      )}
    </ToastContext.Provider>
  );
};
