import React from "react";
import { Icon } from "../../Icon";

export function TeamProfilePage() {
  return (
    <div className="flex flex-col flex-1 max-w-5xl text-emphasis">
      <div className="border-b border-subtle pb-6 mb-6">
        <h2 className="text-xl font-semibold">Team Profile</h2>
        <p className="text-sm text-subtle mt-1">Manage the details of your specific team.</p>
      </div>

      <div className="flex flex-col gap-6">
         <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">Team Logo</label>
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 bg-muted border border-subtle rounded-lg flex items-center justify-center text-emphasis font-bold text-xl uppercase">
                 E
              </div>
              <button className="h-9 px-4 text-sm font-medium border border-subtle rounded-md bg-default hover:bg-subtle transition">
                 Upload logo
              </button>
            </div>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-1.5">
               <label className="text-sm font-medium">Team Name</label>
               <input type="text" defaultValue="Engineering" className="w-full bg-default border border-subtle rounded-md h-9 px-3 text-sm text-emphasis focus:ring-1 focus:ring-brand focus:border-brand outline-none" />
            </div>
            <div className="flex flex-col gap-1.5">
               <label className="text-sm font-medium">Team Slug</label>
               <div className="flex h-9">
                  <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-subtle bg-muted text-subtle text-sm">cal.com/team/</span>
                  <input type="text" defaultValue="eng" className="flex-1 bg-default border border-subtle rounded-r-md h-full px-3 text-sm text-emphasis focus:ring-1 focus:ring-brand focus:border-brand outline-none" />
               </div>
            </div>
         </div>

         <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium">Description</label>
            <textarea className="w-full bg-default border border-subtle rounded-md min-h-[100px] p-3 text-sm text-emphasis focus:ring-1 focus:ring-brand focus:border-brand outline-none" defaultValue="The collective of builders, thinkers, and explorers at Cal.com" />
         </div>

         <div className="pt-4 flex justify-end">
            <button className="btn-primary h-9 px-4 rounded-md bg-emphasis text-inverted font-medium text-sm hover:opacity-90 transition">
               Save changes
            </button>
         </div>
      </div>
    </div>
  );
}
