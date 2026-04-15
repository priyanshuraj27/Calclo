import React from "react";
import { Icon } from "./Icon";

export function UserDropdown() {
  return (
    <div className="flex w-full items-center justify-between px-1">
      <button className="flex items-center gap-2 rounded-md p-1 hover:bg-subtle transition-colors">
        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-purple-600 text-[10px] font-bold text-white relative">
          P
          <div className="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full border-2 border-cal-muted bg-green-500" />
        </div>
        <span className="text-sm font-medium text-emphasis hidden lg:inline">Priyanshu</span>
        <Icon name="chevron-down" className="h-3 w-3 text-subtle hidden lg:inline" />
      </button>
      <button className="p-1.5 hover:bg-subtle rounded-md transition-colors">
        <Icon name="search" className="h-4 w-4 text-subtle" />
      </button>
    </div>
  );
}
