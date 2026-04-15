import React from "react";
import { Icon } from "../Icon";

export function PlansPage() {
  return (
    <div className="flex flex-col flex-1 max-w-5xl">
      <div className="border-b border-subtle pb-6 mb-6">
        <h2 className="text-xl font-semibold text-emphasis">Plans</h2>
        <p className="text-sm text-subtle mt-1">Compare plans and upgrade your subscription.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
         {/* Free Plan */}
         <div className="border border-brand ring-1 ring-brand rounded-lg p-6 bg-default flex flex-col relative">
            <div className="absolute top-0 right-6 -translate-y-1/2 bg-brand text-brand-contrast text-xs font-bold px-3 py-1 rounded-full">
               CURRENT PLAN
            </div>
            <h3 className="text-lg font-semibold text-emphasis">Free</h3>
            <div className="mt-4 mb-6">
               <span className="text-3xl font-bold text-emphasis">$0</span>
               <span className="text-subtle"> / user / month</span>
            </div>
            <ul className="flex flex-col gap-3 mb-8 flex-1">
               <li className="flex items-center text-sm text-emphasis"><Icon name="check" className="text-brand h-4 w-4 mr-3 shrink-0" /> Unlimited bookings</li>
               <li className="flex items-center text-sm text-emphasis"><Icon name="check" className="text-brand h-4 w-4 mr-3 shrink-0" /> Unlimited event types</li>
               <li className="flex items-center text-sm text-emphasis"><Icon name="check" className="text-brand h-4 w-4 mr-3 shrink-0" /> Connect 1 calendar</li>
               <li className="flex items-center text-sm text-emphasis"><Icon name="check" className="text-brand h-4 w-4 mr-3 shrink-0" /> Basic integrations</li>
            </ul>
            <button className="w-full h-10 rounded-md border border-subtle bg-subtle text-subtle font-medium text-sm cursor-default" disabled>
               Current Plan
            </button>
         </div>

         {/* Teams Plan */}
         <div className="border border-subtle rounded-lg p-6 bg-default flex flex-col hover:border-emphasis transition">
            <h3 className="text-lg font-semibold text-emphasis">Pro</h3>
            <div className="mt-4 mb-6">
               <span className="text-3xl font-bold text-emphasis">$15</span>
               <span className="text-subtle"> / user / month</span>
            </div>
            <ul className="flex flex-col gap-3 mb-8 flex-1">
               <li className="flex items-center text-sm text-emphasis"><Icon name="check" className="text-brand h-4 w-4 mr-3 shrink-0" /> Everything in Free</li>
               <li className="flex items-center text-sm text-emphasis"><Icon name="check" className="text-brand h-4 w-4 mr-3 shrink-0" /> Connect unlimited calendars</li>
               <li className="flex items-center text-sm text-emphasis"><Icon name="check" className="text-brand h-4 w-4 mr-3 shrink-0" /> Remove Cal.com branding</li>
               <li className="flex items-center text-sm text-emphasis"><Icon name="check" className="text-brand h-4 w-4 mr-3 shrink-0" /> Workflows & Routing forms</li>
               <li className="flex items-center text-sm text-emphasis"><Icon name="check" className="text-brand h-4 w-4 mr-3 shrink-0" /> Stripe payments</li>
            </ul>
            <button className="w-full btn-primary h-10 rounded-md bg-emphasis text-inverted font-medium text-sm hover:opacity-90 transition">
               Upgrade to Pro
            </button>
         </div>
      </div>
    </div>
  );
}
