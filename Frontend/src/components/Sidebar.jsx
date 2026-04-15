import React from "react";
import { Navigation } from "./Navigation";
import { UserDropdown } from "./UserDropdown";
import { NavigationItem } from "./NavigationItem";
import { ThemeToggle } from "./ThemeToggle";

export function Sidebar({ activePath, onNavigate }) {
  const bottomItems = [
    { label: "View public page", icon: "external-link", href: "/public" },
    { label: "Copy public page link", icon: "copy", href: "/copy" },
    { label: "Refer and earn", icon: "gift", href: "/refer" },
    { label: "Settings", icon: "settings", href: "/settings" },
  ];

  return (
    <aside className="bg-cal-muted border-muted fixed left-0 hidden h-full w-14 flex-col overflow-y-auto overflow-x-hidden border-r md:sticky md:flex lg:w-56 lg:px-3">
      <div className="flex h-full flex-col justify-between py-3 lg:pt-4">
        <div>
          <header className="mb-4 px-2">
            <UserDropdown />
          </header>
          <Navigation activePath={activePath} onNavigate={onNavigate} />
        </div>

        <div className="md:px-2 md:pb-4 lg:p-0">
          {bottomItems.map((item) => (
            <NavigationItem 
              key={item.label} 
              item={item} 
              isActive={activePath.startsWith(item.href)} 
              onClick={() => {
                if (item.href === "/public") {
                  window.open("https://cal.com/john-doe", "_blank");
                } else if (item.href === "/copy") {
                  navigator.clipboard.writeText("cal.com/john-doe");
                  alert("Link copied to clipboard!");
                } else {
                  onNavigate(item.href);
                }
              }} 
            />
          ))}
          <ThemeToggle />
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
