import React from "react";
import { Icon } from "./Icon";

const SETTINGS_CATEGORIES = [
  {
    title: "Priyanshu", // User Account
    icon: "user",
    avatar: "P",
    items: [
      { id: "profile", label: "Profile", icon: "user", desc: "Manage your profile details or delete your account" },
      { id: "general", label: "General", icon: "settings", desc: "Manage language, timezone, and other preferences" },
      { id: "calendars", label: "Calendars", icon: "calendar", desc: "Connect and manage your calendar integrations" },
      { id: "conferencing", label: "Conferencing", icon: "video", desc: "Configure your video conferencing apps" },
      { id: "out-of-office", label: "Out of office", icon: "calendar-off", desc: "Set your away dates and redirect bookings" },
      { id: "billing", label: "Manage billing", icon: "credit-card", desc: "View and manage your subscription and invoices" },
      { id: "plans", label: "Plans", icon: "layers", desc: "Compare plans and upgrade your subscription" },
      { id: "appearance", label: "Appearance", icon: "sun", desc: "Customize your booking page theme and branding" },
      { id: "push-notifications", label: "Push notifications", icon: "bell", desc: "Configure push notification preferences" },
      { id: "features", label: "Features", icon: "sparkles", desc: "Opt in to new and experimental features" },
    ]
  },
  {
    title: "Security",
    icon: "lock",
    items: [
      { id: "password", label: "Password", icon: "key", desc: "Update your password or sign-in method" },
      { id: "impersonation", label: "Impersonation", icon: "users", desc: "Allow support to sign in on your behalf" },
      { id: "two-factor", label: "Two factor authentication", icon: "shield", desc: "Add an extra layer of security to your account" },
      { id: "compliance", label: "Compliance", icon: "shield-check", desc: "Manage data compliance and privacy settings" },
    ]
  },
  {
    title: "Billing",
    icon: "credit-card",
    items: [
      { id: "billing", label: "Manage billing", desc: "View and manage your subscription and invoices" },
      { id: "plans", label: "Plans", desc: "Compare plans and upgrade your subscription" },
    ]
  },
  {
    title: "Developer",
    icon: "terminal",
    items: [
      { id: "webhooks", label: "Webhooks", icon: "zap", desc: "Subscribe to events and receive real-time notifications" },
      { id: "oauth", label: "OAuth Clients", icon: "globe", desc: "Register and manage OAuth applications" },
      { id: "api-keys", label: "API keys", icon: "code", desc: "Create and manage your API keys" }
    ]
  }
];

export function SettingsPage({ activePath = "/settings" }) {
  const pathParts = activePath.split("/").filter(Boolean);
  const activeTab = pathParts.length > 1 ? pathParts[1] : "overview";

  const renderOverview = () => (
    <div className="flex flex-col flex-1 w-full max-w-7xl pb-10">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold text-emphasis">Settings</h2>
        <div className="relative w-64 text-subtle hidden sm:block">
           <Icon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" />
           <input 
             type="text" 
             placeholder="Search" 
             className="w-full bg-default border border-subtle rounded-md h-9 pl-9 pr-3 text-sm focus:outline-none focus:ring-1 focus:ring-brand focus:border-brand transition-all"
           />
        </div>
      </div>

      <div className="flex flex-col gap-10">
        {/* Personal Settings Section */}
        <div>
           <h3 className="text-lg font-semibold text-emphasis mb-4">Personal settings</h3>
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-6 gap-x-8">
              {SETTINGS_CATEGORIES[0].items.map(item => (
                 <button key={item.id} onClick={() => window.history.pushState({}, "", `/settings/${item.id}`)} className="flex items-start text-left hover:opacity-80 transition group p-2 -m-2 rounded-lg hover:bg-subtle">
                    <div className="flex-shrink-0 h-10 w-10 bg-muted border border-subtle rounded-md flex items-center justify-center mr-4 group-hover:bg-default transition-colors">
                       <Icon name={item.icon} className="h-5 w-5 text-emphasis" />
                    </div>
                    <div className="flex flex-col">
                       <span className="font-medium text-sm text-emphasis mb-0.5">{item.label}</span>
                       <span className="text-xs text-subtle leading-snug">{item.desc}</span>
                    </div>
                 </button>
              ))}
           </div>
        </div>

        {/* Security Section */}
        <div>
           <h3 className="text-lg font-semibold text-emphasis mb-4">Security</h3>
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-6 gap-x-8">
              {SETTINGS_CATEGORIES[1].items.map(item => (
                 <button key={item.id} onClick={() => window.history.pushState({}, "", `/settings/${item.id}`)} className="flex items-start text-left hover:opacity-80 transition group p-2 -m-2 rounded-lg hover:bg-subtle">
                    <div className="flex-shrink-0 h-10 w-10 bg-muted border border-subtle rounded-md flex items-center justify-center mr-4 group-hover:bg-default transition-colors">
                       <Icon name={item.icon} className="h-5 w-5 text-emphasis" />
                    </div>
                    <div className="flex flex-col">
                       <span className="font-medium text-sm text-emphasis mb-0.5">{item.label}</span>
                       <span className="text-xs text-subtle leading-snug">{item.desc}</span>
                    </div>
                 </button>
              ))}
           </div>
        </div>

        {/* Developer Section */}
        <div>
           <h3 className="text-lg font-semibold text-emphasis mb-4">Developer</h3>
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-6 gap-x-8">
              {SETTINGS_CATEGORIES[3].items.map(item => (
                 <button key={item.id} onClick={() => window.history.pushState({}, "", `/settings/${item.id}`)} className="flex items-start text-left hover:opacity-80 transition group p-2 -m-2 rounded-lg hover:bg-subtle">
                    <div className="flex-shrink-0 h-10 w-10 bg-muted border border-subtle rounded-md flex items-center justify-center mr-4 group-hover:bg-default transition-colors">
                       <Icon name={item.icon} className="h-5 w-5 text-emphasis" />
                    </div>
                    <div className="flex flex-col">
                       <span className="font-medium text-sm text-emphasis mb-0.5">{item.label}</span>
                       <span className="text-xs text-subtle leading-snug">{item.desc}</span>
                    </div>
                 </button>
              ))}
           </div>
        </div>
      </div>
    </div>
  );

  const renderProfileSettings = () => (
    <div className="flex flex-col flex-1 max-w-3xl">
      <div className="border-b border-subtle pb-6 mb-6">
        <h2 className="text-xl font-semibold text-emphasis">Profile</h2>
        <p className="text-sm text-subtle mt-1">Manage your public profile and personal details.</p>
      </div>

      <div className="flex flex-col gap-6">
        {/* Cover Photo and Avatar */}
        <div className="flex flex-col gap-4">
          <label className="text-sm font-medium text-emphasis">Picture</label>
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-brand flex items-center justify-center text-brand-contrast text-xl font-bold">
              P
            </div>
            <div className="flex gap-2">
              <button className="btn-secondary h-9 px-4 text-sm font-medium border border-subtle rounded-md bg-default hover:bg-subtle transition">
                Change
              </button>
              <button className="btn-secondary h-9 px-4 text-sm font-medium border border-subtle rounded-md bg-default text-destructive hover:bg-subtle hover:text-destructive transition">
                Remove
              </button>
            </div>
          </div>
        </div>

        {/* Inputs */}
        <div className="flex flex-col gap-4 max-w-md mt-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-emphasis">Username</label>
            <div className="flex rounded-md border border-subtle overflow-hidden focus-within:ring-2 focus-within:ring-brand focus-within:border-brand">
              <span className="flex items-center px-3 bg-muted text-subtle text-sm border-r border-subtle">
                cal.com/
              </span>
              <input type="text" className="flex-1 bg-default h-9 px-3 text-sm text-emphasis outline-none" defaultValue="priyanshu" />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-emphasis">Full name</label>
            <input type="text" className="w-full bg-default border border-subtle rounded-md h-9 px-3 text-sm text-emphasis focus:ring-2 focus:ring-brand focus:border-brand outline-none" defaultValue="Priyanshu" />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-emphasis">About</label>
            <textarea className="w-full bg-default border border-subtle rounded-md p-3 text-sm text-emphasis focus:ring-2 focus:ring-brand focus:border-brand outline-none resize-none h-24" placeholder="A little bit about yourself..."></textarea>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-subtle flex justify-end">
          <button className="btn-primary h-9 px-4 rounded-md bg-brand text-brand-contrast font-medium text-sm hover:opacity-90 transition">
            Update
          </button>
        </div>
      </div>
    </div>
  );

  const renderGeneral = () => (
    <div className="flex flex-col flex-1 max-w-3xl">
      <div className="border-b border-subtle pb-6 mb-6">
        <h2 className="text-xl font-semibold text-emphasis">General</h2>
        <p className="text-sm text-subtle mt-1">Manage your timezone, language, and formatting preferences.</p>
      </div>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-1.5 max-w-md">
          <label className="text-sm font-medium text-emphasis">Language</label>
          <select className="bg-default border border-subtle rounded-md h-9 px-3 text-sm text-emphasis focus:ring-2 focus:ring-brand focus:border-brand outline-none w-full">
            <option>English</option>
            <option>Spanish</option>
            <option>French</option>
          </select>
        </div>
        <div className="flex flex-col gap-1.5 max-w-md">
          <label className="text-sm font-medium text-emphasis">Timezone</label>
          <select className="bg-default border border-subtle rounded-md h-9 px-3 text-sm text-emphasis focus:ring-2 focus:ring-brand focus:border-brand outline-none w-full">
            <option>Asia/Calcutta</option>
            <option>America/New_York</option>
            <option>Europe/London</option>
          </select>
        </div>
        <div className="flex flex-col gap-1.5 max-w-md">
          <label className="text-sm font-medium text-emphasis">Time format</label>
          <div className="flex border border-subtle rounded-md overflow-hidden h-9">
            <button className="flex-1 bg-emphasis text-emphasis font-medium text-sm">12h</button>
            <button className="flex-1 bg-default hover:bg-subtle text-subtle font-medium text-sm border-l border-subtle">24h</button>
          </div>
        </div>
        <div className="mt-6 pt-6 border-t border-subtle flex justify-end">
          <button className="btn-primary h-9 px-4 rounded-md bg-brand text-brand-contrast font-medium text-sm hover:opacity-90 transition">Update</button>
        </div>
      </div>
    </div>
  );

  const renderPlaceholder = () => (
    <div className="flex flex-col flex-1 max-w-3xl">
      <div className="border-b border-subtle pb-6 mb-6">
        <h2 className="text-xl font-semibold text-emphasis capitalize">{activeTab.replace("-", " ")}</h2>
        <p className="text-sm text-subtle mt-1">Manage your {activeTab.replace("-", " ")} configuration.</p>
      </div>
      <div className="flex-1 w-full flex items-center justify-center text-subtle text-sm bg-muted rounded-md border border-dashed border-subtle h-64">
          <Icon name="settings" className="h-8 w-8 mb-4 opacity-50 block mx-auto content-center" />
          No settings configured for this module.
      </div>
    </div>
  );

  const renderContent = () => {
    switch(activeTab) {
      case "overview": return renderOverview();
      case "profile": return renderProfileSettings();
      case "general": return renderGeneral();
      // Others default to dummy block for brevity in mock
      default: return renderPlaceholder();
    }
  };

  return (
    <div className="flex flex-1 w-full h-[calc(100vh-2rem)]">
      {/* Settings Secondary Sidebar */}
      <aside className="w-56 shrink-0 flex flex-col gap-2 pr-4 border-r border-subtle mr-6 overflow-y-auto hidden md:flex h-full">
        <button 
           onClick={() => window.history.pushState({}, "", `/event-types`)}
           className="flex items-center text-sm font-medium text-emphasis hover:bg-subtle rounded-md px-2 py-2 mb-2 transition"
        >
           <Icon name="arrow-left" className="mr-2 h-4 w-4" />
           Back
        </button>
        
        <button 
           onClick={() => window.history.pushState({}, "", `/settings`)}
           className={`flex items-center text-sm font-medium rounded-md px-2 py-2 mb-4 transition ${
             activeTab === "overview" ? "bg-emphasis text-emphasis" : "text-subtle hover:bg-subtle hover:text-emphasis"
           }`}
        >
           <Icon name="grid-3x3" className="mr-3 h-4 w-4" />
           Overview
        </button>

        {SETTINGS_CATEGORIES.map((category) => (
          <div key={category.title} className="flex flex-col gap-0.5 mb-2">
            <div className="flex items-center px-2 py-1.5 mb-1 group cursor-default">
               {category.avatar ? (
                 <div className="h-5 w-5 rounded-full bg-brand flex items-center justify-center text-[10px] text-brand-contrast font-bold mr-2">
                   {category.avatar}
                 </div>
               ) : category.icon ? (
                 <Icon name={category.icon} className="h-4 w-4 text-subtle mr-2" />
               ) : null}
               <span className="text-sm font-medium text-subtle">{category.title}</span>
            </div>
            
            {category.items.map((item) => {
              // Hide explicit items from the sidebar to match the screenshot spacing
              // "two-factor auth" is missing from screenshot sidebar, just present in grid
              if (item.id === "two-factor" || item.id === "features") {
                  return null; 
              }

              // Also screenshot moves "billing" and "plans" out of Personal, up to Billing
              if (category.title === "Priyanshu" && ["billing", "plans"].includes(item.id)) {
                  return null;
              }

              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => window.history.pushState({}, "", `/settings/${item.id}`)}
                  className={`flex items-center w-full rounded-md px-3 py-1.5 text-sm font-medium transition ml-2 border border-transparent ${
                    isActive 
                      ? "bg-emphasis text-emphasis" 
                      : "text-subtle hover:bg-subtle hover:text-emphasis"
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </div>
        ))}
      </aside>

      {/* Settings Content Area */}
      <div className="flex-1 overflow-y-auto pb-10 pr-2">
        {renderContent()}
      </div>
    </div>
  );
}
