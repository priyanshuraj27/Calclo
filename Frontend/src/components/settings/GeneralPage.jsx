import React from "react";

export function GeneralPage() {
  return (
    <div className="flex flex-col flex-1 max-w-3xl">
      <div className="border-b border-subtle pb-6 mb-6">
        <h2 className="text-xl font-semibold text-emphasis">General</h2>
        <p className="text-sm text-subtle mt-1">Manage your timezone, language, and formatting preferences.</p>
      </div>
      
      <div className="border border-subtle rounded-lg flex flex-col overflow-hidden">
        <div className="p-6 flex flex-col gap-6">
          <div className="flex flex-col gap-1.5 w-full">
            <label className="text-sm font-medium text-emphasis">Language</label>
            <select className="bg-default border border-subtle rounded-md h-9 px-3 text-sm text-emphasis focus:ring-2 focus:ring-brand focus:border-brand outline-none w-full appearance-none">
              <option>English</option>
              <option>French (Français)</option>
              <option>Spanish (Español)</option>
              <option>Hindi (हिन्दी)</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5 w-full">
            <label className="text-sm font-medium text-emphasis">Timezone</label>
            <select className="bg-default border border-subtle rounded-md h-9 px-3 text-sm text-emphasis focus:ring-2 focus:ring-brand focus:border-brand outline-none w-full appearance-none">
              <option>Asia/Calcutta</option>
              <option>Europe/London</option>
              <option>America/New_York</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5 w-full">
            <label className="text-sm font-medium text-emphasis">Time format</label>
            <div className="flex border border-subtle rounded-md overflow-hidden h-9 w-full max-w-[200px]">
              <button className="flex-1 bg-emphasis text-inverted font-medium text-sm">12h</button>
              <button className="flex-1 bg-default hover:bg-subtle text-subtle font-medium text-sm border-l border-subtle">24h</button>
            </div>
          </div>

          <div className="flex flex-col gap-1.5 w-full">
             <label className="text-sm font-medium text-emphasis">Week starts on</label>
             <div className="flex border border-subtle rounded-md overflow-hidden h-9 w-full max-w-[400px]">
                <button className="flex-1 bg-emphasis text-inverted font-medium text-sm">Sunday</button>
                <button className="flex-1 bg-default hover:bg-subtle text-subtle font-medium text-sm border-l border-subtle">Monday</button>
                <button className="flex-1 bg-default hover:bg-subtle text-subtle font-medium text-sm border-l border-subtle">Tuesday</button>
             </div>
          </div>
        </div>

        {/* Section Bottom Actions */}
        <div className="px-6 py-4 bg-subtle border-t border-subtle flex justify-end">
          <button className="btn-primary h-9 px-4 rounded-md bg-emphasis text-inverted font-medium text-sm hover:opacity-90 transition">
            Update
          </button>
        </div>
      </div>
    </div>
  );
}
