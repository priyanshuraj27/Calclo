import React, { useState, useEffect } from "react";
import { NavigationItem } from "./NavigationItem";

const topItems = [
  { label: "Event Types", icon: "link", href: "/event-types" },
  { label: "Bookings", icon: "calendar", href: "/bookings" },
  { label: "Availability", icon: "clock", href: "/availability" },
  { label: "Teams", icon: "users", href: "/teams" },
  { label: "Apps", icon: "grid-3x3", href: "/apps" },
  { label: "Routing", icon: "git-merge", href: "/routing" },
  { label: "Workflows", icon: "split", href: "/workflows" },
  { label: "Insights", icon: "chart-bar", href: "/insights" },
];

export function Navigation({ activePath, onNavigate }) {
  // Track manually collapsed states for items that have submenus
  const [collapsedStates, setCollapsedStates] = useState({});

  useEffect(() => {
    // When path changes, clear collapse states so items naturally expand
    setCollapsedStates({});
  }, [activePath]);

  const handleNavClick = (itemHref, itemLabel) => {
    if (activePath.startsWith(itemHref)) {
      // We are already on this path. Toggle the group collapse manually
      setCollapsedStates(prev => ({
        ...prev,
        [itemLabel]: !prev[itemLabel]
      }));
    } else {
      onNavigate(itemHref);
    }
  };

  return (
    <nav className="flex flex-col gap-1 md:px-2 lg:p-0">
      {topItems.map((item) => {
        const isActive = activePath.startsWith(item.href) && item.href !== "/";
        const isCollapsed = collapsedStates[item.label];
        const isApps = item.label === "Apps";
        const isInsights = item.label === "Insights";
        const hasChildren = isApps || isInsights;
        const showSubMenu = isActive && !isCollapsed;

        return (
        <div key={item.label}>
          <NavigationItem 
            item={item} 
            isActive={isActive} 
            onClick={() => handleNavClick(item.href, item.label)}
            hasChildren={hasChildren}
            isExpanded={showSubMenu}
          />
          
          {/* Submenu container with Cal.com CSS Grid animation */}
          <div 
            className={`grid transition-all duration-300 ease-in-out ${showSubMenu ? 'grid-rows-[1fr] opacity-100 mt-1 mb-1' : 'grid-rows-[0fr] opacity-0'}`}
          >
             <div className="overflow-hidden">
                {isApps && (
                  <div className="ml-4 flex flex-col gap-1 pr-2 border-l border-subtle pl-4">
                    <button 
                      onClick={() => onNavigate("/apps")} 
                      className={`flex w-full rounded-md px-3 py-2 text-sm font-medium transition ${activePath === "/apps" ? "bg-muted text-emphasis" : "text-subtle hover:bg-subtle hover:text-emphasis"}`}
                    >
                      App store
                    </button>
                    <button 
                      onClick={() => onNavigate("/apps/installed")} 
                      className={`flex w-full rounded-md px-3 py-2 text-sm font-medium transition ${activePath === "/apps/installed" ? "bg-muted text-emphasis" : "text-subtle hover:bg-subtle hover:text-emphasis"}`}
                    >
                      Installed apps
                    </button>
                  </div>
                )}
                {isInsights && (
                  <div className="ml-4 flex flex-col gap-1 pr-2 border-l border-subtle pl-4">
                    <button 
                      onClick={() => onNavigate("/insights")} 
                      className={`flex w-full rounded-md px-3 py-2 text-sm font-medium transition ${activePath === "/insights" ? "bg-muted text-emphasis" : "text-subtle hover:bg-subtle hover:text-emphasis"}`}
                    >
                      Bookings
                    </button>
                    <button 
                      onClick={() => onNavigate("/insights/routing")} 
                      className={`flex w-full rounded-md px-3 py-2 text-sm font-medium transition ${activePath === "/insights/routing" ? "bg-muted text-emphasis" : "text-subtle hover:bg-subtle hover:text-emphasis"}`}
                    >
                      Routing
                    </button>
                    <button 
                      onClick={() => onNavigate("/insights/router-position")} 
                      className={`flex w-full rounded-md px-3 py-2 text-sm font-medium transition ${activePath === "/insights/router-position" ? "bg-muted text-emphasis" : "text-subtle hover:bg-subtle hover:text-emphasis"}`}
                    >
                      Router position
                    </button>
                    <button 
                      onClick={() => onNavigate("/insights/call-history")} 
                      className={`flex w-full rounded-md px-3 py-2 text-sm font-medium transition ${activePath === "/insights/call-history" ? "bg-muted text-emphasis" : "text-subtle hover:bg-subtle hover:text-emphasis"}`}
                    >
                      Call history
                    </button>
                    <button 
                      onClick={() => onNavigate("/insights/wrong-routing")} 
                      className={`flex w-full rounded-md px-3 py-2 text-sm font-medium transition ${activePath === "/insights/wrong-routing" ? "bg-muted text-emphasis" : "text-subtle hover:bg-subtle hover:text-emphasis"}`}
                    >
                      Wrong routing
                    </button>
                  </div>
                )}
             </div>
          </div>
        </div>
        );
      })}
    </nav>
  );
}


