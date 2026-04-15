import React from "react";
import { Icon } from "../Icon";

export function FeaturesPage() {
  return (
    <div className="flex flex-col flex-1 max-w-5xl">
      <div className="border-b border-subtle pb-6 mb-6">
        <h2 className="text-xl font-semibold text-emphasis">Features</h2>
        <p className="text-sm text-subtle mt-1">Opt in to new and experimental features before they are released.</p>
      </div>

      <div className="border border-subtle rounded-lg flex justify-between p-6 bg-default items-center">
         <div className="flex flex-col pr-8">
            <h3 className="font-semibold text-sm text-emphasis flex items-center gap-2">
               New Booking Interface 
               <span className="text-xs font-semibold px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 border border-amber-200">BETA</span>
            </h3>
            <p className="text-sm text-subtle mt-1">Try the new redesigned booking interface for your public scheduling pages. This includes improved mobile responsiveness and a faster checkout flow.</p>
         </div>
         <div className="relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full bg-brand transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2">
            <span className="inline-block h-5 w-5 translate-x-5 transform rounded-full bg-default transition-transform shadow-sm" />
         </div>
      </div>
    </div>
  );
}
