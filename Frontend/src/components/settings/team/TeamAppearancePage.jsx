import React, { useState } from "react";
import { Icon } from "../../Icon";

export function TeamAppearancePage() {
  const [theme, setTheme] = useState("system");
  const [brandColor, setBrandColor] = useState("#292929");

  return (
    <div className="flex flex-col flex-1 max-w-5xl text-emphasis">
      <div className="border-b border-subtle pb-6 mb-6">
        <h2 className="text-xl font-semibold">Team Appearance</h2>
        <p className="text-sm text-subtle mt-1">Customize how this team looks to your customers.</p>
      </div>

      <div className="flex flex-col gap-10">
        {/* Theme Grid */}
        <div className="border border-subtle rounded-lg flex flex-col bg-default overflow-hidden">
           <div className="border-b border-subtle p-6 bg-muted/40">
              <h3 className="text-base font-semibold">Theme</h3>
              <p className="text-sm text-subtle mt-1">Select a theme for booking pages belonging to this team.</p>
           </div>
           <div className="p-6 flex gap-4">
              {['system', 'light', 'dark'].map((t) => (
                 <button 
                   key={t}
                   onClick={() => setTheme(t)}
                   className={`flex-1 border rounded-lg p-4 flex flex-col items-center justify-center transition border ${theme === t ? 'border-brand ring-1 ring-brand bg-brand/5' : 'border-subtle hover:border-emphasis'}`}
                 >
                    <Icon name={t === 'system' ? 'monitor' : t} className="h-6 w-6 mb-2 opacity-70" />
                    <span className="text-sm font-medium capitalize">{t}</span>
                 </button>
              ))}
           </div>
        </div>

        {/* Brand Color */}
        <div className="border border-subtle rounded-lg flex flex-col bg-default overflow-hidden">
           <div className="border-b border-subtle p-6 bg-muted/40">
              <h3 className="text-base font-semibold">Brand Colors</h3>
              <p className="text-sm text-subtle mt-1">Override the global brand color for this specific team.</p>
           </div>
           <div className="p-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                 <div className="h-10 w-10 rounded border border-subtle shadow-sm" style={{ backgroundColor: brandColor }} />
                 <div className="flex flex-col">
                    <span className="text-sm font-medium">Primary Brand Color</span>
                    <span className="text-xs text-subtle font-mono">{brandColor.toUpperCase()}</span>
                 </div>
              </div>
              <button className="h-9 px-4 text-sm font-medium border border-subtle rounded-md bg-default hover:bg-subtle transition">
                 Choose color
              </button>
           </div>
        </div>

        <div className="flex justify-end">
           <button className="btn-primary h-9 px-4 rounded-md bg-emphasis text-inverted font-medium text-sm hover:opacity-90 transition">
              Update appearance
           </button>
        </div>
      </div>
    </div>
  );
}
