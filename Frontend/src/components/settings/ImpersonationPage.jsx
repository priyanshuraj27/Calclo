import React from "react";
import { Icon } from "../Icon";

export function ImpersonationPage() {
  return (
    <div className="flex flex-col flex-1 max-w-5xl">
      <div className="border-b border-subtle pb-6 mb-6">
        <h2 className="text-xl font-semibold text-emphasis">Impersonation</h2>
        <p className="text-sm text-subtle mt-1">Allow support team to sign in on your behalf.</p>
      </div>

      <div className="border border-subtle rounded-lg flex flex-col p-6 bg-default items-start">
         <div className="flex items-center gap-4 mb-6">
            <div className="h-10 w-10 bg-muted border border-subtle rounded flex items-center justify-center">
               <Icon name="users" className="h-5 w-5 text-emphasis" />
            </div>
            <div className="flex flex-col">
               <h3 className="font-semibold text-sm text-emphasis">Support Impersonation</h3>
               <p className="text-sm text-subtle">Allow Cal.com team members to impersonate your account for troubleshooting.</p>
            </div>
         </div>
         <div className="w-full flex items-center justify-between border-t border-subtle pt-6">
            <span className="text-sm font-medium text-emphasis">Enable impersonation</span>
            <div className="relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full bg-subtle transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2">
               <span className="inline-block h-5 w-5 translate-x-1 transform rounded-full bg-default transition-transform shadow-sm" />
            </div>
         </div>
      </div>
    </div>
  );
}
