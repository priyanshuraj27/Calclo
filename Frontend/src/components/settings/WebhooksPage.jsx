import React from "react";
import { Icon } from "../Icon";

export function WebhooksPage() {
  return (
    <div className="flex flex-col flex-1 max-w-5xl">
      <div className="border-b border-subtle pb-6 mb-6 flex justify-between items-start">
        <div>
           <h2 className="text-xl font-semibold text-emphasis">Webhooks</h2>
           <p className="text-sm text-subtle mt-1">Subscribe to events and receive real-time notifications.</p>
        </div>
        <button className="btn-primary h-9 px-4 rounded-md bg-brand text-brand-contrast font-medium text-sm flex items-center hover:opacity-90 transition">
           <Icon name="plus" className="h-4 w-4 mr-2" /> New Webhook
        </button>
      </div>

      <div className="border border-subtle rounded-lg flex flex-col p-12 bg-default items-center text-center">
         <Icon name="zap" className="h-10 w-10 text-subtle mb-4 opacity-50" />
         <h3 className="text-sm font-medium text-emphasis mb-1">No Webhooks configured</h3>
         <p className="text-sm text-subtle max-w-sm mb-6">You haven't setup any webhooks. Create a webhook to get real-time POST requests when events happen.</p>
         <button className="h-9 px-4 text-sm font-medium border border-subtle rounded-md bg-default hover:bg-subtle transition text-emphasis">
            Create Webhook
         </button>
      </div>
    </div>
  );
}
