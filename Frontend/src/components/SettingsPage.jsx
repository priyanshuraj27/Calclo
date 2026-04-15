import React, { useState } from "react";
import { Icon } from "./Icon";

// My Account
import { ProfilePage } from "./settings/ProfilePage";
import { GeneralPage } from "./settings/GeneralPage";
import { AppearancePage } from "./settings/AppearancePage";
import { CalendarsPage } from "./settings/CalendarsPage";
import { ConferencingPage } from "./settings/ConferencingPage";
import { OutOfOfficePage } from "./settings/OutOfOfficePage";
import { PushNotificationsPage } from "./settings/PushNotificationsPage";
import { FeaturesPage } from "./settings/FeaturesPage";
import { BillingPage } from "./settings/BillingPage";
import { PlansPage } from "./settings/PlansPage";

// Security
import { PasswordPage } from "./settings/PasswordPage";
import { ImpersonationPage } from "./settings/ImpersonationPage";
import { TwoFactorPage } from "./settings/TwoFactorPage";
import { CompliancePage } from "./settings/CompliancePage";

// Developer
import { WebhooksPage } from "./settings/WebhooksPage";
import { OAuthPage } from "./settings/OAuthPage";
import { ApiKeysPage } from "./settings/ApiKeysPage";

// Organization
import { OrgProfilePage } from "./settings/org/OrgProfilePage";
import { OrgGeneralPage } from "./settings/org/OrgGeneralPage";
import { OrgMembersPage } from "./settings/org/OrgMembersPage";
import { OrgSecurityPage } from "./settings/org/OrgSecurityPage";

// Team
import { TeamProfilePage } from "./settings/team/TeamProfilePage";
import { TeamMembersPage } from "./settings/team/TeamMembersPage";
import { TeamAppearancePage } from "./settings/team/TeamAppearancePage";

// Admin
import { AdminUsersPage } from "./settings/admin/AdminUsersPage";
import { AdminOrgsPage } from "./settings/admin/AdminOrgsPage";
import { AdminFlagsPage } from "./settings/admin/AdminFlagsPage";
import { AdminBillingPage } from "./settings/admin/AdminBillingPage";

const SETTINGS_CATEGORIES = [
  {
    id: "personal",
    title: "Priyanshu",
    icon: "user",
    avatar: "P",
    items: [
      { id: "profile", label: "Profile", icon: "user", desc: "Manage your profile details or delete your account" },
      { id: "general", label: "General", icon: "settings", desc: "Manage language, timezone, and other preferences" },
      { id: "calendars", label: "Calendars", icon: "calendar", desc: "Connect and manage your calendar integrations" },
      { id: "conferencing", label: "Conferencing", icon: "video", desc: "Configure your video conferencing apps" },
      { id: "out-of-office", label: "Out of office", icon: "calendar-off", desc: "Set your away dates and redirect bookings" },
      { id: "appearance", label: "Appearance", icon: "sun", desc: "Customize your booking page theme and branding" },
      { id: "push-notifications", label: "Push notifications", icon: "bell", desc: "Configure push notification preferences" },
      { id: "features", label: "Features", icon: "sparkles", desc: "Opt in to new and experimental features" },
    ]
  },
  {
    id: "security",
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
    id: "billing",
    title: "Billing",
    icon: "credit-card",
    items: [
      { id: "billing", label: "Manage billing", icon: "credit-card", desc: "View and manage your subscription and invoices" },
      { id: "plans", label: "Plans", icon: "layers", desc: "Compare plans and upgrade your subscription" },
    ]
  },
  {
    id: "developer",
    title: "Developer",
    icon: "terminal",
    items: [
      { id: "webhooks", label: "Webhooks", icon: "zap", desc: "Subscribe to events and receive real-time notifications" },
      { id: "oauth", label: "OAuth Clients", icon: "globe", desc: "Register and manage OAuth applications" },
      { id: "api-keys", label: "API keys", icon: "code", desc: "Create and manage your API keys" }
    ]
  },
  {
    id: "organization",
    title: "Cal.com, Inc.",
    avatar: "C",
    items: [
      { id: "org-profile", label: "Profile", icon: "user", desc: "Manage organization public information" },
      { id: "org-general", label: "General", icon: "settings", desc: "Configure organization behavior and defaults" },
      { id: "org-members", label: "Members", icon: "users", desc: "Manage people in your organization" },
      { id: "org-security", label: "Security & SSO", icon: "shield", desc: "Manage single sign-on and directory synchronization" },
    ]
  },
  {
    id: "team",
    title: "Engineering",
    avatar: "E",
    items: [
      { id: "team-profile", label: "Profile", icon: "user", desc: "Manage team details and slug" },
      { id: "team-members", label: "Members", icon: "users", desc: "Manage team contributors" },
      { id: "team-appearance", label: "Appearance", icon: "sun", desc: "Customize team-specific colors and themes" },
    ]
  },
  {
    id: "admin",
    title: "Admin Settings",
    icon: "lock",
    items: [
      { id: "admin-users", label: "Users", icon: "users", desc: "Manage all users across the instance" },
      { id: "admin-orgs", label: "Organizations", icon: "globe", desc: "Manage all organizations on this instance" },
      { id: "admin-flags", label: "Feature Flags", icon: "flag", desc: "Globally enable or disable features" },
      { id: "admin-billing", label: "Billing & License", icon: "credit-card", desc: "Manage global instance billing" },
    ]
  }
];

export function SettingsPage({ activePath = "/settings", onNavigate }) {
  const pathParts = activePath.split("/").filter(Boolean);
  const rawTab = pathParts.length > 1 ? pathParts[1] : "overview";
  
  const activeTab = rawTab;

  const [expandedSections, setExpandedSections] = useState({
     personal: true,
     security: true,
     billing: true,
     developer: true,
     organization: true,
     team: true,
     admin: true
  });

  const toggleSection = (id) => {
     setExpandedSections(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const renderOverview = () => (
    <div className="flex flex-col flex-1 w-full max-w-7xl pb-10">
      <div className="flex items-center justify-between mb-8 text-emphasis">
        <h2 className="text-2xl font-bold">Settings</h2>
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
        {SETTINGS_CATEGORIES.map(category => (
           <div key={category.id}>
              <h3 className="text-sm font-semibold text-subtle uppercase tracking-wider mb-4">{category.title}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-6 gap-x-8">
                 {category.items.map(item => (
                    <button key={item.id} onClick={() => onNavigate(`/settings/${item.id}`)} className="flex items-start text-left hover:opacity-80 transition group p-2 -m-2 rounded-lg hover:bg-subtle">
                       <div className="flex-shrink-0 h-10 w-10 bg-muted border border-subtle rounded-md flex items-center justify-center mr-4 group-hover:bg-default transition-colors">
                          <Icon name={item.icon || "settings"} className="h-5 w-5 text-emphasis" />
                       </div>
                       <div className="flex flex-col">
                          <span className="font-medium text-sm text-emphasis mb-0.5">{item.label}</span>
                          <span className="text-xs text-subtle leading-snug">{item.desc}</span>
                       </div>
                    </button>
                 ))}
              </div>
           </div>
        ))}
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
           <div className="text-center">
              <Icon name="settings" className="h-8 w-8 mb-4 opacity-50 block mx-auto" />
              This page is coming soon.
           </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch(activeTab) {
      case "overview": return renderOverview();
      case "profile": return <ProfilePage />;
      case "general": return <GeneralPage />;
      case "appearance": return <AppearancePage />;
      case "calendars": return <CalendarsPage />;
      case "conferencing": return <ConferencingPage />;
      case "out-of-office": return <OutOfOfficePage />;
      case "push-notifications": return <PushNotificationsPage />;
      case "features": return <FeaturesPage />;
      case "password": return <PasswordPage />;
      case "impersonation": return <ImpersonationPage />;
      case "two-factor": return <TwoFactorPage />;
      case "compliance": return <CompliancePage />;
      case "billing": return <BillingPage />;
      case "plans": return <PlansPage />;
      case "webhooks": return <WebhooksPage />;
      case "oauth": return <OAuthPage />;
      case "api-keys": return <ApiKeysPage />;
      
      // Organization
      case "org-profile": return <OrgProfilePage />;
      case "org-general": return <OrgGeneralPage />;
      case "org-members": return <OrgMembersPage />;
      case "org-security": return <OrgSecurityPage />;
      
      // Team
      case "team-profile": return <TeamProfilePage />;
      case "team-members": return <TeamMembersPage />;
      case "team-appearance": return <TeamAppearancePage />;
      
      // Admin
      case "admin-users": return <AdminUsersPage />;
      case "admin-orgs": return <AdminOrgsPage />;
      case "admin-flags": return <AdminFlagsPage />;
      case "admin-billing": return <AdminBillingPage />;

      default: return renderPlaceholder();
    }
  };

  return (
    <div className="flex flex-1 w-full h-[calc(100vh-2rem)] overflow-hidden">
      {/* Settings Secondary Sidebar */}
      <aside className="w-60 shrink-0 flex flex-col pr-4 border-r border-subtle mr-6 overflow-y-auto hidden md:flex h-full no-scrollbar">
        <button 
           onClick={() => onNavigate(`/event-types`)}
           className="flex items-center text-sm font-medium text-emphasis hover:bg-subtle rounded-md px-2 py-2 mb-2 transition"
        >
           <Icon name="arrow-left" className="mr-2 h-4 w-4" />
           Back
        </button>
        
        <button 
           onClick={() => onNavigate(`/settings`)}
           className={`flex items-center text-sm font-medium rounded-md px-2 py-2 mb-4 transition ${
             activeTab === "overview" ? "bg-emphasis text-emphasis" : "text-subtle hover:bg-subtle hover:text-emphasis"
           }`}
        >
           <Icon name="grid-3x3" className="mr-3 h-4 w-4" />
           Overview
        </button>

        <div className="flex flex-col gap-1">
          {SETTINGS_CATEGORIES.map((category) => {
            const isExpanded = expandedSections[category.id];
            return (
              <div key={category.id} className="flex flex-col mb-1">
                <button 
                  onClick={() => toggleSection(category.id)}
                  className="flex items-center justify-between px-2 py-1.5 group hover:bg-subtle/50 rounded-md transition"
                >
                   <div className="flex items-center overflow-hidden">
                      {category.avatar ? (
                        <div className="h-5 w-5 shrink-0 rounded-full bg-brand flex items-center justify-center text-[10px] text-brand-contrast font-bold mr-2">
                          {category.avatar}
                        </div>
                      ) : category.icon ? (
                        <Icon name={category.icon} className="h-4 w-4 shrink-0 text-subtle mr-2" />
                      ) : null}
                      <span className="text-[11px] font-semibold text-subtle uppercase tracking-wider truncate">{category.title}</span>
                   </div>
                   <Icon name="chevron-down" className={`h-3 w-3 shrink-0 text-subtle transition-transform duration-200 ${isExpanded ? 'rotate-0' : '-rotate-90'}`} />
                </button>
                
                <div 
                  className={`grid transition-all duration-300 ease-in-out ${isExpanded ? 'grid-rows-[1fr] opacity-100 mt-1' : 'grid-rows-[0fr] opacity-0'}`}
                >
                   <div className="flex flex-col gap-0.5 border-l border-subtle/50 ml-2.5 pl-2 overflow-hidden">
                      {category.items.map((item) => {
                        const isActive = activeTab === item.id;
                        return (
                          <button
                            key={item.id}
                            onClick={() => onNavigate(`/settings/${item.id}`)}
                            className={`flex items-center w-full rounded-md px-2 py-1.5 text-sm font-medium transition ${
                              isActive 
                                ? "bg-muted text-emphasis" 
                                : "text-subtle hover:bg-subtle hover:text-emphasis"
                            }`}
                          >
                            {item.label}
                          </button>
                        );
                      })}
                   </div>
                </div>
              </div>
            );
          })}
        </div>
      </aside>

      {/* Settings Content Area */}
      <div className="flex-1 overflow-y-auto pb-10 pr-2 min-w-0">
        <div className="max-w-7xl mx-auto">
           {renderContent()}
        </div>
      </div>
    </div>
  );
}


