import React, { useState } from "react";
import { Icon } from "./Icon";
import { Switch } from "./Switch";
import { useAutoAnimate } from "@formkit/auto-animate/react";

// ─── Sub-Components ─────────────────────────────────────────────────────────


const SidebarItem = ({ active, icon, label, sublabel, onClick }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center justify-between p-3 rounded-lg text-left transition-all duration-150 group mb-0.5 ${
      active 
        ? "bg-subtle/50 text-emphasis shadow-sm" 
        : "text-subtle hover:bg-subtle/20 hover:text-emphasis"
    }`}
  >
    <div className="flex items-center gap-3 pr-2 min-w-0">
      <Icon name={icon} className={`h-4 w-4 shrink-0 ${active ? "text-emphasis" : "text-subtle group-hover:text-emphasis"}`} />
      <div className="min-w-0">
        <p className={`text-[13px] font-semibold leading-tight truncate ${active ? "text-emphasis" : "text-default"}`}>{label}</p>
        <p className={`text-[11px] mt-1.5 truncate ${active ? "text-subtle" : "text-muted"}`}>{sublabel}</p>
      </div>
    </div>
    <Icon name="chevron-right" className={`h-3.5 w-3.5 transition-opacity duration-200 ${active ? "opacity-100 text-subtle" : "opacity-0 group-hover:opacity-40"}`} />
  </button>
);

const SectionHeader = ({ title }) => (
  <h2 className="text-sm font-semibold text-emphasis mb-4">{title}</h2>
);

const InputField = ({ label, value, onChange, placeholder, suffix }) => (
  <div className="space-y-2">
    <label className="text-sm font-semibold text-emphasis block">{label}</label>
    <div className="relative">
      <input 
        type="text" 
        value={value} 
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-transparent border border-subtle rounded-lg px-4 py-2 text-sm focus:ring-1 focus:ring-emphasis focus:border-emphasis outline-none transition-all placeholder:text-muted"
        placeholder={placeholder}
      />
      {suffix && (
        <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none text-sm text-subtle">
          {suffix}
        </div>
      )}
    </div>
  </div>
);

const SettingsToggle = ({ title, description, checked, onChange }) => (
  <div className="flex items-start justify-between py-1">
    <div className="space-y-0.5">
       <p className="text-sm font-semibold text-emphasis">{title}</p>
       <p className="text-xs text-subtle leading-normal max-w-[440px]">{description}</p>
    </div>
    <Switch checked={checked} onChange={onChange} />
  </div>
);

// ─── Main Component ──────────────────────────────────────────────────────────

export function EditEventTypePage({ onNavigate, title: initialTitle }) {
  const [title, setTitle] = useState(initialTitle || "15 Min Meeting");
  const [slug, setSlug] = useState(title.toLowerCase().replace(/ /g, "-"));
  const [duration, setDuration] = useState(15);
  const [activeTab, setActiveTab] = useState("basics");
  const [enabled, setEnabled] = useState(true);
  
  const [parent] = useAutoAnimate();

  const sidebarItems = [
    { id: "basics", label: "Basics", sublabel: `${duration} mins`, icon: "link" },
    { id: "availability", label: "Availability", sublabel: "Working hours", icon: "calendar" },
    { id: "limits", label: "Limits", sublabel: "How often you can be booked", icon: "clock" },
    { id: "advanced", label: "Advanced", sublabel: "Calendar settings & more...", icon: "layers" },
    { id: "recurring", label: "Recurring", sublabel: "Set up a repeating schedule", icon: "refresh-cw" },
    { id: "apps", label: "Apps", sublabel: "0 apps, 0 active", icon: "grid-3x3" },
    { id: "workflows", label: "Workflows", sublabel: "0 active", icon: "zap" },
    { id: "webhooks", label: "Webhooks", sublabel: "0 active", icon: "webhook" },
  ];

  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const [availability, setAvailability] = useState({
    Monday: [{ from: "09:00", to: "17:00" }],
    Tuesday: [{ from: "09:00", to: "17:00" }],
    Wednesday: [{ from: "09:00", to: "17:00" }],
    Thursday: [{ from: "09:00", to: "17:00" }],
    Friday: [{ from: "09:00", to: "17:00" }],
  });

  return (
    <div className="flex flex-col h-full -m-2 sm:-m-4 lg:-m-6 bg-default text-default overflow-hidden">
      {/* ── Top Header ──────────────────────────────────────── */}
      <div className="bg-default border-b border-subtle px-4 py-3 flex items-center justify-between z-40 transition-all duration-200 sticky top-0">
        <div className="flex items-center gap-3 sm:gap-4 min-w-0">
          <button 
            onClick={() => onNavigate("/event-types")}
            className="p-1.5 sm:p-2 hover:bg-subtle rounded-md text-subtle transition-colors"
          >
            <Icon name="arrow-left" className="h-4 w-4" />
          </button>
          <div className="min-w-0">
            <h1 className="text-sm sm:text-lg font-bold text-emphasis truncate">{title}</h1>
            <p className="text-[10px] sm:text-xs text-subtle font-medium truncate">cal.com/priyanshu/{slug}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          <div className="flex items-center gap-1 sm:gap-4 pr-2 sm:pr-3 mr-0 sm:mr-1 border-r border-subtle">
             <div className="hidden xs:flex items-center border-r border-subtle pr-2 sm:pr-4 mr-1 sm:mr-2">
                <Switch checked={enabled} onChange={setEnabled} />
             </div>
             <button className="p-2 hover:bg-subtle rounded-md text-subtle hover:text-emphasis transition group" title="Preview">
               <Icon name="external-link" className="h-[18px] w-[18px]" />
             </button>
             <button className="hidden sm:block p-2 hover:bg-subtle rounded-md text-subtle hover:text-emphasis transition" title="Copy link">
               <Icon name="link" className="h-[18px] w-[18px]" />
             </button>
             <button className="p-2 hover:bg-subtle rounded-md text-subtle hover:text-red-500 transition" title="Delete">
               <Icon name="trash" className="h-[18px] w-[18px]" />
             </button>
          </div>
          <button className="btn-primary px-4 py-1.5 h-9 opacity-50 cursor-not-allowed">
            Save
          </button>
        </div>
      </div>

      <div className="flex border-b border-subtle overflow-x-auto lg:hidden no-scrollbar bg-default sticky top-[57px] z-30">
        <div className="flex px-2 py-2">
          {sidebarItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex-shrink-0 px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${
                activeTab === item.id 
                  ? "bg-subtle/50 text-emphasis" 
                  : "text-subtle hover:bg-subtle/20"
              }`}
            >
              <div className="flex items-center gap-2">
                <Icon name={item.icon} className="h-4 w-4" />
                <span>{item.label}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* ── Vertical Sidebar ────────────────────────────────── */}
        <aside className="w-[300px] border-r border-subtle p-4 overflow-y-auto hidden lg:block bg-default">
          <div className="space-y-1">
            {sidebarItems.map((item) => (
              <SidebarItem
                key={item.id}
                icon={item.icon}
                label={item.label}
                sublabel={item.sublabel}
                active={activeTab === item.id}
                onClick={() => setActiveTab(item.id)}
              />
            ))}
          </div>
        </aside>

        {/* ── Main Content Area ───────────────────────────────── */}
        <main className="flex-1 overflow-y-auto bg-muted/20 p-6 sm:p-8 lg:p-12 scroll-smooth">
          <div className="max-w-4xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-500" ref={parent}>
            
            {/* ── Basics Tab ──────────────────────────────────── */}
            {activeTab === "basics" && (
              <div className="space-y-8">
                <InputField 
                    label="Title" 
                    value={title} 
                    onChange={setTitle} 
                    placeholder="e.g. Quick Chat" 
                />

                <div className="space-y-2">
                   <label className="text-sm font-semibold text-emphasis block">Description</label>
                   <div className="border border-subtle rounded-lg overflow-hidden bg-default shadow-sm">
                      <div className="flex items-center gap-1 p-2 border-b border-subtle bg-muted/10">
                         <div className="px-2 py-1 flex items-center gap-1.5 text-xs font-medium text-subtle hover:bg-subtle rounded cursor-pointer">
                            Normal <Icon name="chevron-down" className="h-3 w-3" />
                         </div>
                         <div className="h-4 w-[1px] bg-subtle mx-1" />
                         <button className="p-1.5 hover:bg-subtle rounded text-subtle transition"><Icon name="bold" className="h-3.5 w-3.5" /></button>
                         <button className="p-1.5 hover:bg-subtle rounded text-subtle transition"><Icon name="italic" className="h-3.5 w-3.5" /></button>
                         <button className="p-1.5 hover:bg-subtle rounded text-subtle transition"><Icon name="link" className="h-3.5 w-3.5" /></button>
                      </div>
                      <textarea 
                        className="w-full bg-transparent p-4 min-h-[120px] text-sm outline-none resize-none"
                        value={title}
                        readOnly
                      />
                   </div>
                </div>

                <div className="space-y-2">
                   <label className="text-sm font-semibold text-emphasis block">URL</label>
                   <div className="flex rounded-lg border border-subtle bg-subtle overflow-hidden focus-within:ring-1 focus-within:ring-emphasis group transition-all shadow-sm">
                      <span className="px-4 py-2.5 text-sm text-subtle bg-muted/20 border-r border-subtle whitespace-nowrap">
                        cal.com/genius-loq-3uk8nj/
                      </span>
                      <input 
                        type="text" 
                        className="flex-1 bg-transparent px-4 py-2.5 text-sm outline-none font-medium" 
                        value={slug}
                        onChange={(e) => setSlug(e.target.value)}
                      />
                   </div>
                </div>

                <div className="pt-6 border-t border-subtle space-y-6">
                  <InputField label="Duration" value={duration} onChange={setDuration} suffix="Minutes" />
                  <SettingsToggle 
                    title="Allow multiple durations" 
                    description="Allow bookers to choose between multiple durations for this event type."
                    checked={false}
                    onChange={() => {}}
                  />
                </div>

                <div className="pt-6 border-t border-subtle space-y-6">
                   <SectionHeader title="Location" />
                   <div className="relative group cursor-pointer flex items-center justify-between p-3 bg-default border border-subtle rounded-lg hover:border-emphasis transition shadow-sm">
                      <div className="flex items-center gap-3">
                         <div className="p-1.5 bg-subtle rounded border border-subtle">
                            <Icon name="video" className="h-4 w-4" />
                         </div>
                         <span className="text-sm font-medium">Cal Video (Default)</span>
                      </div>
                      <div className="flex items-center gap-2">
                         <Icon name="chevron-down" className="h-4 w-4 text-subtle" />
                         <Icon name="x" className="h-4 w-4 text-subtle hover:text-red-500 transition-colors" />
                      </div>
                   </div>
                   
                   <div className="flex items-center justify-between group cursor-pointer py-1">
                      <span className="text-sm font-medium text-emphasis">Show advanced settings</span>
                      <Icon name="chevron-down" className="h-4 w-4 text-subtle group-hover:text-emphasis transition" />
                   </div>

                   <button className="flex items-center gap-2 text-sm font-bold text-emphasis py-1 hover:underline group">
                      <div className="p-1 bg-subtle border border-subtle rounded group-hover:border-emphasis transition">
                        <Icon name="plus" className="h-3 w-3" />
                      </div>
                      Add a location
                   </button>

                   <div className="text-xs text-subtle pt-2 border-t border-subtle/50">
                      Can't find the right conferencing app? Visit our <span className="text-emphasis font-semibold hover:underline cursor-pointer">App Store</span>.
                   </div>
                </div>
              </div>
            )}

            {/* ── Availability Tab ────────────────────────────── */}
            {activeTab === "availability" && (
              <div className="space-y-8 animate-in fade-in slide-in-from-right-1">
                <div className="space-y-4">
                  <SectionHeader title="Availability" />
                  <div className="flex items-center gap-3 p-3 bg-default border border-subtle rounded-lg focus-within:border-emphasis transition shadow-sm">
                    <Icon name="calendar" className="h-4 w-4 text-subtle" />
                    <select className="flex-1 bg-transparent outline-none text-sm font-medium text-emphasis cursor-pointer">
                      <option>Working Hours (Default)</option>
                      <option>Weekend Warm-up</option>
                    </select>
                  </div>
                </div>

                <div className="bg-default border border-subtle rounded-xl overflow-hidden shadow-sm divide-y divide-subtle">
                   {days.map(day => {
                     const isAvailable = availability[day] && availability[day].length > 0;
                     return (
                        <div key={day} className="flex items-start lg:items-center p-4 hover:bg-muted/10 transition group gap-6">
                           <div className="w-40 flex items-center gap-3">
                              <Switch checked={isAvailable} onChange={() => {}} />
                              <span className={`text-sm font-bold ${isAvailable ? 'text-emphasis' : 'text-subtle'}`}>{day}</span>
                           </div>
                           <div className="flex-1 flex flex-col sm:flex-row gap-3">
                              {isAvailable ? (
                                <div className="flex items-center gap-2">
                                   <div className="flex items-center gap-2 bg-subtle px-3 py-1.5 rounded-lg border border-subtle group-hover:border-emphasis transition text-sm">
                                      <span className="font-medium">09:00</span>
                                      <span className="text-muted">–</span>
                                      <span className="font-medium">17:00</span>
                                   </div>
                                   <button className="p-2 hover:bg-subtle rounded-lg text-subtle transition opacity-0 group-hover:opacity-100">
                                      <Icon name="plus" className="h-4 w-4" />
                                   </button>
                                </div>
                              ) : (
                                <span className="text-sm text-subtle italic py-1.5 underline underline-offset-4 decoration-subtle/30">Unavailable</span>
                              )}
                           </div>
                        </div>
                     );
                   })}
                </div>

                <div className="flex items-center justify-between text-xs text-subtle pt-2">
                   <div className="flex items-center gap-1.5">
                      <Icon name="globe" className="h-3.5 w-3.5" />
                      <span>Asia/Kolkata (GMT +5:30)</span>
                   </div>
                   <button onClick={() => onNavigate('/availability')} className="font-semibold text-emphasis hover:underline">Edit availability</button>
                </div>
              </div>
            )}

            {/* ── Limits Tab ──────────────────────────────────── */}
            {activeTab === "limits" && (
              <div className="space-y-8 animate-in fade-in slide-in-from-right-1">
                 <div className="bg-default border border-subtle rounded-xl p-8 space-y-8 shadow-sm">
                    <SectionHeader title="Booking Limits" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                       <InputField label="Max bookings per day" suffix="Bookings" placeholder="No limit" />
                       <InputField label="Max bookings per week" suffix="Bookings" placeholder="No limit" />
                    </div>

                    <div className="pt-8 border-t border-subtle">
                       <SectionHeader title="Notice Period" />
                       <InputField label="Minimum notice period" suffix="Minutes" placeholder="e.g. 120" />
                    </div>

                    <div className="pt-8 border-t border-subtle">
                       <SectionHeader title="Buffer Time" />
                       <div className="space-y-6">
                          <InputField label="Buffer before event" suffix="Minutes" placeholder="0" />
                          <InputField label="Buffer after event" suffix="Minutes" placeholder="0" />
                       </div>
                    </div>
                 </div>
              </div>
            )}

            {/* ── Advanced Tab ────────────────────────────────── */}
            {activeTab === "advanced" && (
              <div className="space-y-8 animate-in fade-in slide-in-from-right-1">
                 <div className="bg-default border border-subtle rounded-xl p-8 space-y-8 shadow-sm">
                    <div className="space-y-6">
                       <SettingsToggle 
                         title="Requires confirmation" 
                         description="Events will only be added to your calendar once you have confirmed them."
                         checked={false}
                         onChange={() => {}}
                       />
                       <SettingsToggle 
                         title="Hide branding" 
                         description="Hide 'Powered by Cal.com' branding on the booking page."
                         checked={false}
                         onChange={() => {}}
                       />
                       <SettingsToggle 
                         title="Private event" 
                         description="Hide this event type from your public profile page."
                         checked={false}
                         onChange={() => {}}
                       />
                    </div>

                    <div className="pt-8 border-t border-subtle">
                       <InputField label="Redirect on completion" placeholder="https://example.com/thanks" />
                    </div>
                 </div>
              </div>
            )}

            {/* ── Recurring Tab ───────────────────────────────── */}
            {activeTab === "recurring" && (
              <div className="space-y-8 animate-in fade-in slide-in-from-right-1">
                 <div className="bg-default border border-subtle rounded-xl p-8 shadow-sm text-center py-16">
                    <div className="mx-auto w-16 h-16 bg-muted/20 rounded-full flex items-center justify-center mb-6">
                       <Icon name="refresh-cw" className="h-8 w-8 text-subtle" />
                    </div>
                    <h3 className="text-base font-bold text-emphasis mb-2">Recurring events</h3>
                    <p className="text-sm text-subtle max-w-sm mx-auto mb-8 leading-relaxed">
                       Allow people to book multiple occurrences of this event type at once.
                    </p>
                    <button className="btn-primary px-6 opacity-100 cursor-pointer h-10 transition-transform active:scale-95">
                       Enable recurring events
                    </button>
                 </div>
              </div>
            )}

            {/* ── Apps Tab ────────────────────────────────────── */}
            {activeTab === "apps" && (
              <div className="space-y-8 animate-in fade-in slide-in-from-right-1">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      { name: "Google Calendar", category: "Calendar", icon: "calendar", active: true },
                      { name: "Zoom", category: "Conferencing", icon: "video", active: true },
                      { name: "Daily Video", category: "Conferencing", icon: "video", active: true },
                      { name: "Stripe", category: "Payments", icon: "credit-card", active: false },
                    ].map(app => (
                      <div key={app.name} className="p-4 bg-default border border-subtle rounded-xl flex items-center justify-between hover:border-emphasis transition cursor-pointer shadow-sm">
                         <div className="flex items-center gap-3">
                            <div className="p-2 bg-subtle rounded-lg border border-subtle">
                               <Icon name={app.icon} className="h-5 w-5 text-emphasis" />
                            </div>
                            <div>
                               <p className="text-sm font-bold text-emphasis">{app.name}</p>
                               <p className="text-[11px] text-subtle">{app.category}</p>
                            </div>
                         </div>
                         <div className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${app.active ? 'bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400' : 'bg-subtle text-subtle'}`}>
                            {app.active ? 'Active' : 'Not installed'}
                         </div>
                      </div>
                    ))}
                 </div>
                 <div className="text-center py-6">
                    <button className="text-sm font-bold text-emphasis hover:underline flex items-center justify-center gap-2 mx-auto">
                       Visit App Store
                       <Icon name="external-link" className="h-4 w-4" />
                    </button>
                 </div>
              </div>
            )}

            {/* ── Workflows Tab ───────────────────────────────── */}
            {activeTab === "workflows" && (
              <div className="space-y-8 animate-in fade-in slide-in-from-right-1 text-center py-20 bg-default border border-subtle rounded-xl shadow-sm border-dashed">
                  <div className="mx-auto w-16 h-16 bg-muted/20 rounded-full flex items-center justify-center mb-6">
                    <Icon name="zap" className="h-8 w-8 text-subtle" />
                  </div>
                  <h3 className="text-base font-bold text-emphasis mb-2">Automate your scheduling</h3>
                  <p className="text-sm text-subtle max-w-sm mx-auto mb-8 leading-relaxed">
                    Set up triggers and actions to automatically send notifications, reminders, or follow-ups.
                  </p>
                  <button className="btn-primary px-8 opacity-100 cursor-pointer h-10 transition-transform active:scale-95">
                    Create your first workflow
                  </button>
              </div>
            )}

            {/* ── Webhooks Tab ────────────────────────────────── */}
            {activeTab === "webhooks" && (
              <div className="space-y-8 animate-in fade-in slide-in-from-right-1">
                 <div className="flex items-center justify-between px-2">
                    <SectionHeader title="Webhooks" />
                    <button className="text-sm font-bold text-emphasis flex items-center gap-2 hover:underline">
                       <div className="p-1 bg-subtle border border-subtle rounded">
                          <Icon name="plus" className="h-3 w-3" />
                       </div>
                       Add webhook
                    </button>
                 </div>
                 <div className="p-12 text-center bg-default border border-subtle rounded-xl shadow-sm italic text-subtle text-sm">
                    No webhooks configured for this event type.
                 </div>
              </div>
            )}
            
          </div>
        </main>
      </div>

      {/* Floating help button simulator */}
      <div className="fixed bottom-6 right-6">
         <div className="bg-emphasis text-inverted w-12 h-12 rounded-full shadow-2xl flex items-center justify-center cursor-pointer hover:scale-110 active:scale-95 transition-all group">
            <Icon name="message-square" className="h-6 w-6 group-hover:rotate-12 transition-transform" />
            <div className="absolute right-0 bottom-full mb-3 px-3 py-1 bg-emphasis text-inverted text-xs font-bold rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-xl border border-white/10">
               Need help?
            </div>
         </div>
      </div>
    </div>
  );
}
