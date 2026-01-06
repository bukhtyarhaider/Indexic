import React from 'react';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ isOpen, onClose, onConfirm, title, message }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
      <div className="bg-surface rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden transform transition-all scale-100 border border-border">
        <div className="p-6">
          <div className="w-12 h-12 rounded-full bg-red-900/20 flex items-center justify-center mb-4 mx-auto border border-red-900/30">
            <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-white text-center font-display mb-2">{title}</h3>
          <p className="text-sm text-text-secondary text-center leading-relaxed">{message}</p>
        </div>
        <div className="bg-surface-highlight px-6 py-4 flex gap-3 justify-center border-t border-border">
          <button 
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-surface border border-border rounded-lg text-text-main text-sm font-semibold hover:bg-surface-highlight transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={onConfirm}
            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700 shadow-md shadow-red-900/30 transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};