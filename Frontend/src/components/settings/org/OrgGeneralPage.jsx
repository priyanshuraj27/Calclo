import React from "react";
import { Icon } from "../../Icon";

export function OrgGeneralPage() {
  return (
    <div className="flex flex-col flex-1 max-w-5xl">
       <div className="border-b border-subtle pb-6 mb-6">
        <h2 className="text-xl font-semibold text-emphasis">General Settings</h2>
        <p className="text-sm text-subtle mt-1">Configure your organization's behavior and defaults.</p>
      </div>

      <div className="flex flex-col gap-10">
        {/* Time Settings */}
        <div className="border border-subtle rounded-lg flex flex-col bg-default overflow-hidden">
           <div className="border-b border-subtle p-6 bg-muted/40">
              <h3 className="text-base font-semibold text-emphasis">Time settings</h3>
              <p className="text-sm text-subtle mt-1">Set the default time preferences for all members.</p>
           </div>
           
           <div className="p-6 flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                 <label className="text-sm font-medium text-emphasis">Default Timezone</label>
                 <select className="bg-default border border-subtle rounded-md h-9 px-3 text-sm text-emphasis focus:ring-1 focus:ring-brand focus:border-brand outline-none w-full max-w-sm">
                    <option>Europe/London (GMT+0:00)</option>
                    <option selected>America/New_York (GMT-5:00)</option>
                    <option>Asia/Calcutta (GMT+5:30)</option>
                 </select>
              </div>

              <div className="flex flex-col gap-2">
                 <label className="text-sm font-medium text-emphasis">Time Format</label>
                 <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                       <div className="h-4 w-4 rounded-full border border-brand bg-brand flex items-center justify-center">
                          <div className="h-1.5 w-1.5 rounded-full bg-white" />
                       </div>
                       <span className="text-sm text-emphasis">12h (am/pm)</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer opacity-50">
                       <div className="h-4 w-4 rounded-full border border-subtle flex items-center justify-center" />
                       <span className="text-sm text-emphasis">24h</span>
                    </label>
                 </div>
              </div>
           </div>
        </div>

        {/* Branding */}
        <div className="border border-subtle rounded-lg flex flex-col bg-default overflow-hidden">
           <div className="border-b border-subtle p-6 bg-muted/40 font-semibold text-emphasis">Branding</div>
           <div className="p-6 flex flex-col gap-6">
              <div className="flex justify-between items-center">
                 <div>
                    <h4 className="text-sm font-medium text-emphasis">Disable Cal.com branding</h4>
                    <p className="text-xs text-subtle mt-0.5">Remove the "Powered by Cal.com" footer from all booking pages.</p>
                 </div>
                 <div className="relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full bg-brand transition-colors">
                    <span className="inline-block h-5 w-5 translate-x-5 transform rounded-full bg-default transition-transform shadow-sm" />
                 </div>
              </div>
           </div>
        </div>

        <div className="flex justify-end">
           <button className="btn-primary h-9 px-4 rounded-md bg-emphasis text-inverted font-medium text-sm hover:opacity-90 transition">
              Update settings
           </button>
        </div>
      </div>
    </div>
  );
}
