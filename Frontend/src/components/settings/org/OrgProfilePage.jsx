import React from "react";
import { Icon } from "../../Icon";

export function OrgProfilePage() {
  return (
    <div className="flex flex-col flex-1 max-w-5xl">
      <div className="border-b border-subtle pb-6 mb-6">
        <h2 className="text-xl font-semibold text-emphasis">Organization Profile</h2>
        <p className="text-sm text-subtle mt-1">Manage your organization's public information.</p>
      </div>

      <div className="flex flex-col gap-8">
        {/* Logo & Header */}
        <div className="flex flex-col gap-6">
           <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-emphasis">Logo</label>
              <div className="flex items-center gap-4">
                 <div className="h-16 w-16 bg-muted border border-subtle rounded-md flex items-center justify-center overflow-hidden">
                    <img src="https://cal.com/logo.svg" alt="Org Logo" className="h-10 w-10" />
                 </div>
                 <div className="flex gap-2">
                    <button className="h-9 px-4 text-sm font-medium border border-subtle rounded-md bg-default hover:bg-subtle transition text-emphasis">Change logo</button>
                    <button className="h-9 px-4 text-sm font-medium text-red-500 hover:bg-red-50 transition rounded-md">Remove</button>
                 </div>
              </div>
           </div>

           <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-emphasis">Header Image</label>
              <div className="h-32 w-full bg-muted border border-dashed border-subtle rounded-lg flex flex-col items-center justify-center text-subtle">
                 <Icon name="image" className="h-8 w-8 mb-2 opacity-50" />
                 <span className="text-xs">Dimensions: 1500x500. Click to upload.</span>
              </div>
           </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-emphasis">Organization Name</label>
              <input type="text" defaultValue="Cal.com, Inc." className="w-full bg-default border border-subtle rounded-md h-9 px-3 text-sm text-emphasis focus:ring-1 focus:ring-brand focus:border-brand outline-none" />
           </div>
           <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-emphasis">Organization Slug</label>
              <div className="flex h-9">
                 <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-subtle bg-muted text-subtle text-sm">cal.com/</span>
                 <input type="text" defaultValue="acme" className="flex-1 bg-default border border-subtle rounded-r-md h-full px-3 text-sm text-emphasis focus:ring-1 focus:ring-brand focus:border-brand outline-none" />
              </div>
           </div>
        </div>

        <div className="flex flex-col gap-1.5">
           <label className="text-sm font-medium text-emphasis">About</label>
           <textarea className="w-full bg-default border border-subtle rounded-md min-h-[120px] p-3 text-sm text-emphasis focus:ring-1 focus:ring-brand focus:border-brand outline-none" defaultValue="Cal.com is the open source Cal.com. Everything you need to schedule everything." />
        </div>

        <div className="pt-4 flex justify-end">
           <button className="btn-primary h-9 px-4 rounded-md bg-emphasis text-inverted font-medium text-sm hover:opacity-90 transition">
              Save Changes
           </button>
        </div>
      </div>
    </div>
  );
}
