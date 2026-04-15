import React from "react";
import { Icon } from "./Icon";

export function NavigationItem({ item, isActive, onClick, hasChildren, isExpanded }) {
  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        onClick();
      }}
      className={`
        group flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors
        ${isActive 
          ? "bg-emphasis text-emphasis" 
          : "text-subtle hover:bg-subtle hover:text-emphasis"}
      `}
    >
      <Icon 
        name={item.icon} 
        className={`h-4 w-4 shrink-0 ${isActive ? "text-emphasis" : "text-subtle group-hover:text-emphasis"}`} 
      />
      <span className="hidden lg:inline truncate flex-1 text-left">{item.label}</span>
      
      {hasChildren && (
        <Icon 
          name="chevron-down" 
          className={`h-4 w-4 shrink-0 transition-transform duration-200 hidden lg:block ${isExpanded ? 'rotate-180' : ''}`} 
        />
      )}

      {/* Badge (Optional demo) */}
      {!hasChildren && item.label === "Bookings" && (
        <span className={`ml-auto hidden rounded-full px-1.5 py-0.5 text-[10px] lg:inline ${isActive ? 'bg-default text-emphasis' : 'bg-subtle text-subtle'}`}>
          2
        </span>
      )}
    </button>
  );
}

