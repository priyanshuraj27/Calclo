import React, { useState } from "react";
import { Icon } from "./Icon";

const CATEGORIES = [
  { id: "all", label: "All", count: 2 },
  { id: "calendar", label: "Calendar", count: 1 },
  { id: "conferencing", label: "Conferencing", count: 1 },
  { id: "payment", label: "Payment", count: 0 },
  { id: "crm", label: "CRM", count: 0 },
  { id: "other", label: "Other", count: 0 },
];

const MOCK_INSTALLED_APPS = [
  {
    category: "calendar",
    name: "Google Calendar",
    description: "Google Calendar is a time management and scheduling service developed by Google. Allows users to create and edit events, with options available for type and...",
    logo: "/app-icons/google-calendar.svg",
    isDefault: true,
  },
  {
    category: "conferencing",
    name: "Google Meet",
    description: "Google Meet is Google's web-based video conferencing platform, designed to compete with major conferencing platforms.",
    logo: "/app-icons/google-meet.svg",
    isDefault: false,
  }
];

export function InstalledAppsPage() {
  const [activeCategory, setActiveCategory] = useState("all");

  const filteredApps = activeCategory === "all" 
    ? MOCK_INSTALLED_APPS 
    : MOCK_INSTALLED_APPS.filter(app => app.category === activeCategory);

  return (
    <div className="flex-1 w-full max-w-full">
      {/* ── Shell Header ───────────────────────────────────── */}
      <div className="flex items-center md:mb-6 md:mt-0 lg:mb-8">
        <header className="flex w-full max-w-full flex-col md:flex-row md:items-center justify-between">
          <div className="min-w-0 flex-1 ltr:mr-4 rtl:ml-4">
            <h3 className="font-cal text-emphasis inline truncate text-lg font-semibold tracking-wide sm:text-xl xl:max-w-full">
              Installed Apps
            </h3>
            <p className="text-default hidden text-sm md:block mt-1">
              Manage your connected apps
            </p>
          </div>
        </header>
      </div>

      {/* ── Two Column Layout ───────────────────────────────────── */}
      <div className="flex flex-col xl:flex-row xl:space-x-6 min-w-0 w-full">
        
        {/* Left Sidebar (Vertical Tabs) - Hidden on Mobile, Visible on Desktop */}
        <div className="hidden xl:block w-64 flex-shrink-0">
          <nav className="sticky top-0 flex flex-col gap-1">
            {CATEGORIES.map(category => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`flex w-full items-center justify-between rounded-md px-3 py-2 text-sm font-medium transition ${
                  activeCategory === category.id 
                    ? "bg-emphasis text-emphasis" 
                    : "text-subtle hover:bg-subtle hover:text-emphasis"
                }`}
              >
                <span>{category.label}</span>
                {category.count > 0 && (
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-subtle text-[11px] font-medium text-subtle font-cal">
                    {category.count}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Top Scrollable Tabs - Visible on Mobile, Hidden on Desktop */}
        <div className="block xl:hidden mb-6 -mx-2 px-2 overflow-x-auto no-scrollbar">
          <nav className="flex space-x-1 min-w-max pb-1">
            {CATEGORIES.map(category => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition ${
                  activeCategory === category.id 
                    ? "bg-emphasis text-emphasis" 
                    : "text-subtle bg-muted hover:bg-subtle hover:text-emphasis"
                }`}
              >
                {category.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Right Content Area */}
        <main className="flex-1 min-w-0">
          {filteredApps.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-md border border-dashed border-subtle bg-subtle py-12 px-6 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-default mb-4 shadow-sm border border-subtle">
                <Icon name="grid-3x3" className="h-6 w-6 text-subtle" />
              </div>
              <h3 className="font-cal text-emphasis text-lg font-semibold">No apps found</h3>
              <p className="text-subtle mt-1 text-sm">
                You haven't installed any {activeCategory !== 'all' ? activeCategory : ''} apps yet.
              </p>
              <button className="btn-secondary mt-6 flex items-center justify-center bg-brand text-brand-contrast border-brand hover:bg-brand-emphasis hover:text-brand-contrast hover:border-brand-emphasis">
                <Icon name="plus" className="mr-1.5 h-4 w-4" />
                Connect apps
              </button>
            </div>
          ) : (
            <div className="border-subtle rounded-md border p-7">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-emphasis font-semibold text-base">
                    {CATEGORIES.find(c => c.id === activeCategory)?.label || "Apps"}
                  </h3>
                  <p className="text-subtle text-sm">
                    Manage your installed {activeCategory !== 'all' ? activeCategory : ''} apps.
                  </p>
                </div>
                <button className="btn-secondary flex items-center justify-center">
                  <Icon name="plus" className="mr-1.5 h-4 w-4" />
                  Add
                </button>
              </div>

              {/* App List */}
              <ul className="flex flex-col gap-4">
                {filteredApps.map(app => (
                  <li key={app.name} className="flex flex-col sm:flex-row sm:items-center justify-between rounded-lg border border-subtle bg-default p-4 hover:border-emphasis transition-colors gap-4">
                    <div className="flex items-start gap-4">
                      <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-md bg-muted/20">
                        <img
                          src={app.logo}
                          alt={app.name}
                          className="h-8 w-8"
                        />
                      </div>
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <h4 className="text-emphasis text-sm font-semibold">{app.name}</h4>
                          {app.isDefault && (
                            <span className="bg-subtle text-emphasis flex items-center rounded-md px-2 py-0.5 text-xs font-medium border border-subtle">
                              Default
                            </span>
                          )}
                        </div>
                        <p className="text-subtle mt-1 text-sm line-clamp-2 max-w-xl">
                          {app.description}
                        </p>
                      </div>
                    </div>
                    <div className="flex sm:flex-shrink-0 items-center gap-2 self-end sm:self-center">
                      <button className="btn-icon-secondary">
                        <Icon name="ellipsis" className="h-4 w-4" />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
