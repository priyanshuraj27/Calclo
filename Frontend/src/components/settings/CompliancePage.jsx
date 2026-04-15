import React from "react";
import { Icon } from "../Icon";

export function CompliancePage() {
  return (
    <div className="flex flex-col flex-1 max-w-5xl">
      <div className="border-b border-subtle pb-6 mb-6">
        <h2 className="text-xl font-semibold text-emphasis">Compliance</h2>
        <p className="text-sm text-subtle mt-1">Manage data privacy and compliance settings.</p>
      </div>

      <div className="flex flex-col gap-6">
         <div className="border border-subtle rounded-lg flex justify-between p-6 bg-default items-center">
            <div className="flex flex-col pr-8">
               <h3 className="font-semibold text-sm text-emphasis flex items-center gap-2">
                  Request Data Export
               </h3>
               <p className="text-sm text-subtle mt-1">Download a copy of all your data associated with this account.</p>
            </div>
            <button className="h-9 px-4 text-sm font-medium border border-subtle rounded-md bg-default hover:bg-subtle transition text-emphasis whitespace-nowrap">
               Request Export
            </button>
         </div>

         <div className="border border-subtle rounded-lg flex justify-between p-6 bg-default items-center">
            <div className="flex items-center gap-4">
               <div className="h-10 w-10 bg-muted border border-subtle rounded flex items-center justify-center">
                  <Icon name="shield-check" className="h-5 w-5 text-emphasis" />
               </div>
               <div className="flex flex-col">
                  <h3 className="font-semibold text-sm text-emphasis">HIPAA Compliance</h3>
                  <p className="text-sm text-subtle">Upgrade your account to enable HIPAA compliance features.</p>
               </div>
            </div>
            <button className="h-9 px-4 text-sm font-medium border border-brand/20 bg-brand/10 text-brand rounded-md transition whitespace-nowrap">
               Upgrade
            </button>
         </div>
      </div>
    </div>
  );
}
