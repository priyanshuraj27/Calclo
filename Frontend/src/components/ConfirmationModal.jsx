import React from "react";
import { Icon } from "./Icon";

export function ConfirmationModal({ isOpen, onClose, onConfirm, title, description, confirmText = "Delete", variant = "danger" }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-[2px] animate-in fade-in duration-200">
      <div 
        className="w-full max-w-md bg-default border border-subtle rounded-xl shadow-2xl overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-4 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-6 space-y-4">
          <div className="flex items-center gap-4">
             <div className={`p-3 rounded-full ${variant === 'danger' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
                <Icon name={variant === 'danger' ? 'trash' : 'info'} className="h-6 w-6" />
             </div>
             <div>
                <h3 className="text-lg font-bold text-emphasis leading-tight">{title}</h3>
                <p className="text-sm text-subtle mt-1 leading-relaxed">{description}</p>
             </div>
          </div>
        </div>

        <div className="px-6 py-4 bg-muted/20 border-t border-subtle flex items-center justify-end gap-3">
          <button 
            onClick={onClose}
            className="btn-secondary"
          >
            Cancel
          </button>
          <button 
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`btn-primary ${variant === 'danger' ? 'bg-red-600 hover:bg-red-700 text-white' : ''}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
