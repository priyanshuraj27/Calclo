import React, { useState, useEffect } from "react";
import { Icon } from "../Icon";

export function AppearancePage() {
  const [appTheme, setAppTheme] = useState(() => {
    if (document.documentElement.classList.contains("dark")) return "dark";
    return "light"; // Defaulting to light if not explicitly dark for demo
  });
  const [bookingTheme, setBookingTheme] = useState("system");
  const [showStatus, setShowStatus] = useState(false);

  const handleUpdate = () => {
    if (appTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else if (appTheme === "light") {
      document.documentElement.classList.remove("dark");
    } else {
      // System
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      if (prefersDark) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    }
    
    // Show a temporary success status
    setShowStatus(true);
    setTimeout(() => setShowStatus(false), 3000);
  };

  return (
    <div className="flex flex-col flex-1 max-w-3xl">
      <div className="border-b border-subtle pb-6 mb-6 flex justify-between items-end">
        <div>
          <h2 className="text-xl font-semibold text-emphasis">Appearance</h2>
          <p className="text-sm text-subtle mt-1">Manage settings for your app appearance</p>
        </div>
        {showStatus && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-green-500/10 border border-green-500/20 text-green-500 rounded text-xs font-medium animate-in fade-in slide-in-from-bottom-2">
             <Icon name="check" className="h-3 w-3" />
             Settings updated
          </div>
        )}
      </div>

      {/* App Theme */}
      <div className="border border-subtle rounded-lg flex flex-col mb-6">
        <div className="border-b border-subtle p-6 bg-muted/40 rounded-t-lg">
          <h3 className="text-base font-semibold text-emphasis">App theme</h3>
          <p className="text-sm text-subtle mt-1">Select or customize your app theme.</p>
        </div>
        
        <div className="p-6 flex gap-4 w-full">
           <button 
              onClick={() => setAppTheme('system')}
              className={`flex-1 border rounded-lg p-4 flex flex-col items-center justify-center transition ${appTheme === 'system' ? 'border-brand ring-1 ring-brand bg-brand/5' : 'border-subtle hover:border-emphasis bg-default'}`}>
              <Icon name="monitor" className="h-6 w-6 mb-2 text-emphasis opacity-70" />
              <span className="text-sm font-medium text-emphasis">System</span>
           </button>
           <button 
              onClick={() => setAppTheme('light')}
              className={`flex-1 border rounded-lg p-4 flex flex-col items-center justify-center transition ${appTheme === 'light' ? 'border-brand ring-1 ring-brand bg-brand/5' : 'border-subtle hover:border-emphasis bg-default'}`}>
              <Icon name="sun" className="h-6 w-6 mb-2 text-emphasis opacity-70" />
              <span className="text-sm font-medium text-emphasis">Light</span>
           </button>
           <button 
              onClick={() => setAppTheme('dark')}
              className={`flex-1 border rounded-lg p-4 flex flex-col items-center justify-center transition ${appTheme === 'dark' ? 'border-brand ring-1 ring-brand bg-brand/5' : 'border-subtle hover:border-emphasis bg-default'}`}>
              <Icon name="moon" className="h-6 w-6 mb-2 text-emphasis opacity-70" />
              <span className="text-sm font-medium text-emphasis">Dark</span>
           </button>
        </div>

        <div className="px-6 py-4 bg-muted border-t border-subtle flex justify-end">
          <button 
            onClick={handleUpdate}
            className="btn-primary h-9 px-4 rounded-md bg-emphasis text-inverted font-medium text-sm hover:opacity-90 transition active:scale-[0.98]">
            Update
          </button>
        </div>
      </div>

      {/* Booking Page Theme */}
      <div className="border border-subtle rounded-lg flex flex-col mb-6">
        <div className="border-b border-subtle p-6 bg-muted/40 rounded-t-lg">
          <h3 className="text-base font-semibold text-emphasis">Theme</h3>
          <p className="text-sm text-subtle mt-1">Select or customize your booking page theme.</p>
        </div>
        
        <div className="p-6 flex gap-4 w-full">
           <button 
              onClick={() => setBookingTheme('system')}
              className={`flex-1 border rounded-lg p-4 flex flex-col items-center justify-center transition ${bookingTheme === 'system' ? 'border-brand ring-1 ring-brand bg-brand/5' : 'border-subtle hover:border-emphasis bg-default'}`}>
              <Icon name="monitor" className="h-6 w-6 mb-2 text-emphasis opacity-70" />
              <span className="text-sm font-medium text-emphasis">System</span>
           </button>
           <button 
              onClick={() => setBookingTheme('light')}
              className={`flex-1 border rounded-lg p-4 flex flex-col items-center justify-center transition ${bookingTheme === 'light' ? 'border-brand ring-1 ring-brand bg-brand/5' : 'border-subtle hover:border-emphasis bg-default'}`}>
              <Icon name="sun" className="h-6 w-6 mb-2 text-emphasis opacity-70" />
              <span className="text-sm font-medium text-emphasis">Light</span>
           </button>
           <button 
              onClick={() => setBookingTheme('dark')}
              className={`flex-1 border rounded-lg p-4 flex flex-col items-center justify-center transition ${bookingTheme === 'dark' ? 'border-brand ring-1 ring-brand bg-brand/5' : 'border-subtle hover:border-emphasis bg-default'}`}>
              <Icon name="moon" className="h-6 w-6 mb-2 text-emphasis opacity-70" />
              <span className="text-sm font-medium text-emphasis">Dark</span>
           </button>
        </div>

        <div className="px-6 py-4 bg-muted border-t border-subtle flex justify-end">
          <button 
            onClick={handleUpdate}
            className="btn-primary h-9 px-4 rounded-md bg-emphasis text-inverted font-medium text-sm hover:opacity-90 transition active:scale-[0.98]">
            Update
          </button>
        </div>
      </div>


      {/* Brand Colors */}
      <div className="border border-subtle rounded-lg flex flex-col mb-6 bg-default items-center justify-between p-6 flex-row">
         <div className="flex flex-col flex-1 pr-4">
            <h3 className="text-sm font-semibold text-emphasis">Custom brand colors</h3>
            <p className="text-sm text-subtle mt-1">Customize your booking colors to match your brand</p>
         </div>
         <div className="relative inline-flex h-6 w-11 items-center rounded-full bg-subtle transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2">
            <span className="inline-block h-5 w-5 translate-x-1 transform rounded-full bg-default transition-transform shadow-sm" />
         </div>
      </div>

      {/* Hide Branding */}
      <div className="border border-subtle rounded-lg flex flex-col mb-6 bg-default items-center justify-between p-6 flex-row">
         <div className="flex flex-col flex-1 pr-4">
            <div className="flex items-center gap-2">
               <h3 className="text-sm font-semibold text-emphasis">Disable Cal.com branding</h3>
               <span className="bg-muted border border-subtle text-xs px-1.5 py-0.5 rounded font-medium text-emphasis">UPGRADE</span>
            </div>
            <p className="text-sm text-subtle mt-1">Removes "Powered by Cal.com" from your public booking pages</p>
         </div>
         <div className="relative inline-flex h-6 w-11 items-center rounded-full bg-subtle opacity-50 cursor-not-allowed">
            <span className="inline-block h-5 w-5 translate-x-1 transform rounded-full bg-default transition-transform shadow-sm" />
         </div>
      </div>

    </div>
  );
}
