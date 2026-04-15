import React from "react";
import { Icon } from "../Icon";

export function ApiKeysPage() {
  return (
    <div className="flex flex-col flex-1 max-w-5xl">
      <div className="border-b border-subtle pb-6 mb-6 flex justify-between items-start">
        <div>
           <h2 className="text-xl font-semibold text-emphasis">API Keys</h2>
           <p className="text-sm text-subtle mt-1">Manage API keys to authenticate your requests to the Cal.com API.</p>
        </div>
        <button className="btn-primary h-9 px-4 rounded-md bg-brand text-brand-contrast font-medium text-sm flex items-center hover:opacity-90 transition">
           <Icon name="plus" className="h-4 w-4 mr-2" /> New API Key
        </button>
      </div>

      <div className="border border-subtle rounded-lg flex flex-col p-12 bg-default items-center text-center">
         <Icon name="code" className="h-10 w-10 text-subtle mb-4 opacity-50" />
         <h3 className="text-sm font-medium text-emphasis mb-1">No API Keys</h3>
         <p className="text-sm text-subtle max-w-sm mb-6">You don't have any API keys. Create one to authenticate API requests.</p>
         <button className="h-9 px-4 text-sm font-medium border border-subtle rounded-md bg-default hover:bg-subtle transition text-emphasis">
            Create API Key
         </button>
      </div>
    </div>
  );
}
