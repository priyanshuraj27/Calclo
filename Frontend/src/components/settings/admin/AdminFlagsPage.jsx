import React from "react";
import { Icon } from "../../Icon";

const MOCK_FLAGS = [
  { id: "ai-auto-scheduling", name: "AI Auto Scheduling", desc: "Use AI to automatically find the best time for meetings.", enabled: true },
  { id: "new-booking-ui", name: "New Booking UI", desc: "The redesigned checkout flow for public pages.", enabled: true },
  { id: "org-members-export", name: "Organization Members Export", desc: "Allow admins to export member lists as CSV.", enabled: false },
  { id: "insights-v2", name: "Insights Dashboard V2", desc: "Experimental analytics and reporting features.", enabled: true },
  { id: "platform-api-v2", name: "Platform API V2", desc: "Access to the next-gen Platform API endpoints.", enabled: false },
  { id: "workflow-whatsapp", name: "WhatsApp Workflows", desc: "Send automated notifications via WhatsApp.", enabled: true },
];

export function AdminFlagsPage() {
  return (
    <div className="flex flex-col flex-1 max-w-5xl text-emphasis">
      <div className="border-b border-subtle pb-6 mb-6">
        <h2 className="text-xl font-semibold">Feature Flags</h2>
        <p className="text-sm text-subtle mt-1">Globally enable or disable features across the entire instance.</p>
      </div>

      <div className="flex flex-col gap-4">
        <div className="relative">
           <Icon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-subtle" />
           <input type="text" placeholder="Search flags..." className="w-full bg-default border border-subtle rounded-md h-9 pl-9 pr-3 text-sm focus:ring-1 focus:ring-brand focus:border-brand outline-none" />
        </div>

        <div className="flex flex-col border border-subtle rounded-lg bg-default divide-y divide-subtle">
           {MOCK_FLAGS.map((flag) => (
              <div key={flag.id} className="p-6 flex justify-between items-center group hover:bg-muted/30 transition-colors">
                 <div className="flex flex-col pr-8">
                    <h3 className="text-sm font-semibold text-emphasis">{flag.name}</h3>
                    <code className="text-[10px] text-brand font-mono mb-1">{flag.id}</code>
                    <p className="text-sm text-subtle">{flag.desc}</p>
                 </div>
                 <div className={`relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors cursor-pointer ${flag.enabled ? 'bg-brand' : 'bg-subtle'}`}>
                    <span className={`inline-block h-5 w-5 transform rounded-full bg-default transition-transform shadow-sm ${flag.enabled ? 'translate-x-5' : 'translate-x-1'}`} />
                 </div>
              </div>
           ))}
        </div>
      </div>
    </div>
  );
}
