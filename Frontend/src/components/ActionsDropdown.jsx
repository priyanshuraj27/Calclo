import React, { useRef } from "react";
import { Icon } from "./Icon";

/** Outside dismiss is handled by the parent row (EventTypeCard) to avoid clipping / double listeners. */
export function ActionsDropdown({ isOpen, onClose, onAction }) {
  const dropdownRef = useRef(null);

  if (!isOpen) return null;

  const actions = [
    { id: 'edit', label: 'Edit', icon: 'edit-2' },
    { id: 'duplicate', label: 'Duplicate', icon: 'copy' },
    { id: 'copy-link', label: 'Copy Link', icon: 'link' },
    { id: 'preview', label: 'Preview', icon: 'external-link' },
    { id: 'embed', label: 'Embed', icon: 'code' },
    { id: 'delete', label: 'Delete', icon: 'trash', variant: 'danger' },
  ];

  return (
    <div 
      ref={dropdownRef}
      className="absolute right-0 top-full mt-1 z-50 w-48 bg-default border border-subtle rounded-md shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-100 origin-top-right"
      style={{ backgroundColor: 'var(--cal-bg)' }}
    >
      <div className="py-1">
        {actions.map((action) => (
          <button
            key={action.id}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onAction(action.id);
              onClose();
            }}
            className={`w-full flex items-center gap-2 px-3 py-2 text-sm transition-colors ${
              action.variant === 'danger' 
                ? 'text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30' 
                : 'text-emphasis hover:bg-subtle'
            }`}
          >
            <Icon name={action.icon} className={`h-4 w-4 ${action.variant === 'danger' ? 'text-red-500' : 'text-subtle'}`} />
            {action.label}
          </button>
        ))}
      </div>
    </div>
  );
}
