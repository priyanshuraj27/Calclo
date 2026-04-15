import React from "react";
import { Icon } from "../Icon";

export function TwoFactorPage() {
  return (
    <div className="flex flex-col flex-1 max-w-5xl">
      <div className="border-b border-subtle pb-6 mb-6">
        <h2 className="text-xl font-semibold text-emphasis">Two-Factor Authentication</h2>
        <p className="text-sm text-subtle mt-1">Add an extra layer of security to your account.</p>
      </div>

      <div className="border border-subtle rounded-lg flex justify-between p-6 bg-default items-center">
         <div className="flex flex-col pr-8">
            <h3 className="font-semibold text-sm text-emphasis flex items-center gap-2">
               Authenticator App
            </h3>
            <p className="text-sm text-subtle mt-1">Use an authenticator app to generate one time security codes.</p>
         </div>
         <button className="h-9 px-4 text-sm font-medium border border-subtle rounded-md bg-default hover:bg-subtle transition text-emphasis whitespace-nowrap">
            Setup 2FA
         </button>
      </div>
    </div>
  );
}
