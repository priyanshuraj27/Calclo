import React, { useState, useEffect } from "react";
import { Icon } from "./Icon";

export function ThemeToggle() {
  const [isDark, setIsDark] = useState(
    () => document.documentElement.classList.contains("dark")
  );

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDark]);

  return (
    <button
      onClick={() => setIsDark(!isDark)}
      className="group flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors text-subtle hover:bg-subtle hover:text-emphasis"
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      {isDark ? (
        <Icon name="sun" className="h-4 w-4 shrink-0 text-subtle group-hover:text-emphasis" />
      ) : (
        <Icon name="moon" className="h-4 w-4 shrink-0 text-subtle group-hover:text-emphasis" />
      )}
      <span className="hidden lg:inline truncate">
        {isDark ? "Light mode" : "Dark mode"}
      </span>
    </button>
  );
}
