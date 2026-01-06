import React, { createContext, useContext, useState, ReactNode } from "react";

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
            <svg
              className="w-3 h-3 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={3}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>
        );
      case "info":
        return (
          <div className="bg-blue-500 rounded-full p-1">
            <svg
              className="w-3 h-3 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={3}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
        );
      case "success":
      default:
        return (
          <div className="bg-primary rounded-full p-1">
            <svg
              className="w-3 h-3 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={3}
                d="M5 13l4 4L19 7"
              />
            </svg>
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
