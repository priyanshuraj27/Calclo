import React from 'react';

export function Switch({ checked, onChange, disabled, className }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      data-state={checked ? 'checked' : 'unchecked'}
      disabled={disabled}
      onClick={() => !disabled && onChange(!checked)}
      className={`switch-root ${className || ""}`}
    >
      <span
        aria-hidden="true"
        className="switch-thumb"
      />
    </button>
  );
}
