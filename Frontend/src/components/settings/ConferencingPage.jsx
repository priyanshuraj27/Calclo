import React from "react";
import { Icon } from "../Icon";

export function ConferencingPage() {
  return (
    <div className="flex flex-col flex-1 max-w-5xl">
      <div className="border-b border-subtle pb-6 mb-6 flex items-start justify-between">
         <div>
            <h2 className="text-xl font-semibold text-emphasis">Conferencing</h2>
            <p className="text-sm text-subtle mt-1">Connect your video conferencing tools to automatically generate event links.</p>
         </div>
      </div>

      <div className="flex flex-col gap-6">
        <div className="border border-subtle rounded-lg flex justify-between p-6 bg-default items-center">
            <div className="flex items-center gap-4">
               <div className="h-10 w-10 bg-muted border border-subtle rounded flex items-center justify-center">
                  <Icon name="video" className="h-5 w-5 text-emphasis" />
               </div>
               <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                     <h3 className="font-semibold text-sm text-emphasis">Cal Video</h3>
                     <span className="text-xs font-semibold px-1.5 py-0.5 rounded bg-brand/10 text-brand border border-brand/20">Default</span>
                  </div>
                  <p className="text-sm text-subtle">Use Cal.com's own video conferencing solution.</p>
               </div>
            </div>
            <div className="flex gap-2">
               <button className="h-9 px-4 text-sm font-medium border border-subtle rounded-md bg-default text-emphasis flex items-center">
                  <div className="relative inline-flex h-4 w-8 items-center rounded-full bg-brand transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 mr-2">
                     <span className="inline-block h-3 w-3 translate-x-4 transform rounded-full bg-inverted transition-transform" />
                  </div>
                  Active
               </button>
            </div>
        </div>

        <div className="border border-subtle rounded-lg flex justify-between p-6 bg-default items-center">
            <div className="flex items-center gap-4">
               <div className="h-10 w-10 bg-muted border border-subtle rounded flex items-center justify-center">
                  <Icon name="video" className="h-5 w-5 text-emphasis" />
               </div>
               <div className="flex flex-col">
                  <h3 className="font-semibold text-sm text-emphasis">Google Meet</h3>
                  <p className="text-sm text-subtle">Add Google Meet links to your booked events.</p>
               </div>
            </div>
            <button className="h-9 px-4 text-sm font-medium border border-subtle rounded-md bg-default hover:bg-subtle transition text-emphasis">
               Add
            </button>
        </div>

        <div className="border border-subtle rounded-lg flex justify-between p-6 bg-default items-center">
            <div className="flex items-center gap-4">
               <div className="h-10 w-10 bg-muted border border-subtle rounded flex items-center justify-center">
                  <Icon name="video" className="h-5 w-5 text-emphasis" />
               </div>
               <div className="flex flex-col">
                  <h3 className="font-semibold text-sm text-emphasis">Zoom Video</h3>
                  <p className="text-sm text-subtle">Add Zoom Video links to your booked events.</p>
               </div>
            </div>
            <button className="h-9 px-4 text-sm font-medium border border-subtle rounded-md bg-default hover:bg-subtle transition text-emphasis">
               Add
            </button>
        </div>
      </div>
    </div>
  );
}
