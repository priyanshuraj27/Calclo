import React from "react";
import { Icon } from "../Icon";

export function BillingPage() {
  return (
    <div className="flex flex-col flex-1 max-w-5xl">
      <div className="border-b border-subtle pb-6 mb-6">
        <h2 className="text-xl font-semibold text-emphasis">Manage billing</h2>
        <p className="text-sm text-subtle mt-1">View and manage your subscription and invoices.</p>
      </div>

      <div className="border border-subtle rounded-lg flex flex-col overflow-hidden mb-6 bg-default items-start">
         <div className="border-b border-subtle p-6 bg-muted/40 w-full flex justify-between items-center">
            <h3 className="text-base font-semibold text-emphasis">Current Subscription</h3>
            <span className="bg-brand/10 text-brand text-xs font-semibold px-2 py-0.5 rounded border border-brand/20">Active</span>
         </div>
         <div className="p-6 flex flex-col w-full">
            <div className="flex justify-between w-full mb-4">
               <div>
                  <h4 className="font-semibold text-emphasis">Free Plan</h4>
                  <p className="text-sm text-subtle mt-1">You are currently on the free plan. Upgrade to access premium features.</p>
               </div>
               <div className="text-right">
                  <span className="text-2xl font-bold text-emphasis">$0</span>
                  <span className="text-subtle text-sm"> / month</span>
               </div>
            </div>
            <div className="flex justify-between w-full mt-4 pt-6 border-t border-subtle">
               <button className="h-9 px-4 text-sm font-medium border border-subtle rounded-md bg-default hover:bg-subtle transition text-emphasis">Cancel subscription</button>
               <button className="btn-primary h-9 px-4 rounded-md bg-emphasis text-inverted font-medium text-sm hover:opacity-90 transition">Upgrade plan</button>
            </div>
         </div>
      </div>
      
      <div className="border border-subtle rounded-lg flex flex-col overflow-hidden bg-default">
         <div className="border-b border-subtle p-6 bg-muted/40 w-full">
            <h3 className="text-base font-semibold text-emphasis">Billing History</h3>
         </div>
         <div className="flex flex-col items-center justify-center p-12 text-center">
            <Icon name="receipt" className="h-10 w-10 text-subtle mb-4 opacity-50" />
            <p className="text-sm text-emphasis font-medium">No billing history</p>
            <p className="text-sm text-subtle mt-1">You haven't made any payments yet.</p>
         </div>
      </div>
    </div>
  );
}
