import React from "react";
import { Icon } from "./Icon";

export function ReferPage() {
  return (
    <div className="flex-1 w-full max-w-full flex items-center justify-center p-6">
      <div className="w-full max-w-2xl bg-default border border-subtle rounded-xl p-8 flex flex-col items-center text-center shadow-sm">
        
        <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center mb-6 border border-subtle">
           <Icon name="gift" className="h-8 w-8 text-brand" />
        </div>

        <h2 className="text-2xl font-bold text-emphasis mb-2">Refer and Earn!</h2>
        <p className="text-subtle text-base mb-8 max-w-md">
          Invite your friends to use Cal.com and earn credits or special perks when they sign up using your unique link!
        </p>

        <div className="w-full max-w-md">
          <label className="block text-left text-sm font-medium text-emphasis mb-2">Your unique referral link</label>
          <div className="flex w-full mb-6 relative">
            <input 
              readOnly 
              value="https://cal.com/refer/john-doe" 
              className="bg-muted text-emphasis border border-subtle rounded-l-md w-full h-10 px-3 text-sm focus:outline-none" 
            />
            <button className="btn-primary h-10 px-4 bg-brand text-brand-contrast rounded-r-md font-medium text-sm flex items-center hover:opacity-90">
              <Icon name="copy" className="mr-2 h-4 w-4" />
              Copy
            </button>
          </div>

          <div className="flex flex-col gap-4 text-left border-t border-subtle pt-6">
             <div className="flex items-start gap-4">
                <div className="mt-1 bg-subtle p-2 rounded-full">
                  <Icon name="link" className="h-4 w-4 text-emphasis" />
                </div>
                <div>
                   <h4 className="text-emphasis font-medium text-sm">1. Share your link</h4>
                   <p className="text-subtle text-sm">Send this link to anyone you want to refer.</p>
                </div>
             </div>
             <div className="flex items-start gap-4">
                <div className="mt-1 bg-subtle p-2 rounded-full">
                  <Icon name="users" className="h-4 w-4 text-emphasis" />
                </div>
                <div>
                   <h4 className="text-emphasis font-medium text-sm">2. They sign up</h4>
                   <p className="text-subtle text-sm">When they create an account, they get a trial bonus.</p>
                </div>
             </div>
             <div className="flex items-start gap-4">
                <div className="mt-1 bg-subtle p-2 rounded-full">
                  <Icon name="zap" className="h-4 w-4 text-emphasis" />
                </div>
                <div>
                   <h4 className="text-emphasis font-medium text-sm">3. You earn!</h4>
                   <p className="text-subtle text-sm">You receive platform credits instantly to your account.</p>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
