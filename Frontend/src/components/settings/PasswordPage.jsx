import React from "react";
import { Icon } from "../Icon";

export function PasswordPage() {
  return (
    <div className="flex flex-col flex-1 max-w-xl">
      <div className="border-b border-subtle pb-6 mb-6">
        <h2 className="text-xl font-semibold text-emphasis">Password</h2>
        <p className="text-sm text-subtle mt-1">Manage your password.</p>
      </div>

      <div className="flex flex-col gap-6">
         <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-emphasis">Current Password</label>
            <input type="password" placeholder="••••••••••••" className="w-full bg-default border border-subtle rounded-md h-9 px-3 text-sm text-emphasis focus:ring-2 focus:ring-brand focus:border-brand outline-none" />
         </div>

         <div className="flex flex-col gap-1.5 mt-2">
            <label className="text-sm font-medium text-emphasis">New Password</label>
            <input type="password" placeholder="••••••••••••" className="w-full bg-default border border-subtle rounded-md h-9 px-3 text-sm text-emphasis focus:ring-2 focus:ring-brand focus:border-brand outline-none" />
         </div>

         <div className="mt-4 pt-4 flex">
            <button className="btn-primary h-9 px-4 rounded-md bg-emphasis text-inverted font-medium text-sm hover:opacity-90 transition">
               Update
            </button>
         </div>
      </div>
    </div>
  );
}
