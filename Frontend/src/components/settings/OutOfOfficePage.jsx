import React from "react";
import { Icon } from "../Icon";

export function OutOfOfficePage() {
  return (
    <div className="flex flex-col flex-1 max-w-5xl">
      <div className="border-b border-subtle pb-6 mb-6 flex items-start justify-between">
         <div>
            <h2 className="text-xl font-semibold text-emphasis">Out of Office</h2>
            <p className="text-sm text-subtle mt-1">Set your out of office dates and redirect bookings to another team member.</p>
         </div>
      </div>

      <div className="border border-subtle rounded-lg flex flex-col items-center justify-center py-16 bg-default text-center">
         <div className="h-12 w-12 bg-muted border border-subtle rounded-full flex items-center justify-center mb-4 text-emphasis">
            <Icon name="calendar-off" className="h-6 w-6" />
         </div>
         <h3 className="font-semibold text-emphasis mb-1">No out of office periods</h3>
         <p className="text-sm text-subtle mb-6 max-w-sm">You haven't set any out of office periods yet. Create one to block your calendar and optionally redirect events.</p>
         <button className="btn-primary h-9 px-4 rounded-md bg-brand text-brand-contrast font-medium text-sm flex items-center hover:opacity-90 transition">
            <Icon name="plus" className="h-4 w-4 mr-2" />
            Add Out of Office
         </button>
      </div>

    </div>
  );
}
