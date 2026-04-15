import React from "react";
import { Icon } from "../../Icon";

export function AdminBillingPage() {
  return (
    <div className="flex flex-col flex-1 max-w-5xl text-emphasis">
      <div className="border-b border-subtle pb-6 mb-6">
        <h2 className="text-xl font-semibold">Instance Billing & License</h2>
        <p className="text-sm text-subtle mt-1">Manage global billing for the entire Cal.com instance.</p>
      </div>

      <div className="flex flex-col gap-8">
        {/* License Key Section */}
        <div className="border border-subtle rounded-lg flex flex-col bg-default overflow-hidden">
           <div className="border-b border-subtle p-6 bg-muted/40 flex justify-between items-center">
              <div>
                 <h3 className="text-base font-semibold">License Key</h3>
                 <p className="text-sm text-subtle mt-1">Your Enterprise license key for this instance.</p>
              </div>
              <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-0.5 rounded border border-green-200 uppercase tracking-wider">Valid</span>
           </div>
           <div className="p-6 flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                 <label className="text-xs font-medium text-subtle uppercase">Current License</label>
                 <div className="flex gap-2">
                    <input type="text" readOnly value="XXXX-XXXX-XXXX-CAL-ENT" className="flex-1 bg-muted border border-subtle rounded-md h-9 px-3 text-sm font-mono text-subtle outline-none" />
                    <button className="h-9 px-4 text-sm font-medium border border-subtle rounded-md bg-default hover:bg-subtle transition">Update</button>
                 </div>
              </div>
              <p className="text-xs text-subtle">Licensed to Cal.com, Inc. Expires on January 1st, 2025.</p>
           </div>
        </div>

        {/* Global Statistics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
           <div className="border border-subtle rounded-lg p-6 bg-default flex flex-col">
              <span className="text-sm font-medium text-subtle">Total Revenue (MRR)</span>
              <span className="text-2xl font-bold mt-2">$24,500.00</span>
              <span className="text-xs text-green-500 mt-1 flex items-center gap-1">
                 <Icon name="arrow-up-right" className="h-3 w-3" /> +12% from last month
              </span>
           </div>
           <div className="border border-subtle rounded-lg p-6 bg-default flex flex-col">
              <span className="text-sm font-medium text-subtle">Active Organizations</span>
              <span className="text-2xl font-bold mt-2">1,248</span>
              <span className="text-xs text-subtle mt-1 font-mono">15 pending review</span>
           </div>
           <div className="border border-subtle rounded-lg p-6 bg-default flex flex-col">
              <span className="text-sm font-medium text-subtle">Active Members</span>
              <span className="text-2xl font-bold mt-2">15,842</span>
              <span className="text-xs text-subtle mt-1">~12.6 per organization</span>
           </div>
        </div>

        {/* Subscription History Placeholder */}
        <div className="border border-subtle rounded-lg flex flex-col bg-default overflow-hidden">
           <div className="border-b border-subtle p-6 bg-muted/40 font-semibold">Instance Invoices</div>
           <div className="p-12 flex flex-col items-center justify-center text-center">
              <Icon name="receipt" className="h-10 w-10 text-subtle opacity-30 mb-4" />
              <p className="text-sm text-subtle">No global invoices found. All organizational billing is currently handled individually.</p>
           </div>
        </div>
      </div>
    </div>
  );
}
