import React from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-background/80 backdrop-blur-sm">
      <div className="bg-surface rounded-t-2xl sm:rounded-2xl shadow-2xl w-full sm:max-w-sm overflow-hidden transform transition-all scale-100 border border-border">
        <div className="p-5 sm:p-6">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-red-900/20 flex items-center justify-center mb-3 sm:mb-4 mx-auto border border-red-900/30">
            <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6 text-red-500" />
          </div>
          <h3 className="text-base sm:text-lg font-bold text-white text-center font-display mb-1.5 sm:mb-2">
            {title}
          </h3>
          <p className="text-xs sm:text-sm text-text-secondary text-center leading-relaxed">
            {message}
          </p>
        </div>
        <div className="bg-surface-highlight px-4 sm:px-6 py-3 sm:py-4 flex gap-2 sm:gap-3 justify-center border-t border-border">
          <Button
            onClick={onClose}
            variant="secondary"
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            variant="danger"
            className="flex-1 bg-red-600 hover:bg-red-700 text-white shadow-md shadow-red-900/30"
          >
            Delete
          </Button>
        </div>
      </div>
    </div>
  );
};
