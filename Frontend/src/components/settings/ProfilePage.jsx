import React from "react";
import { Icon } from "../Icon";

export function ProfilePage() {
  return (
    <div className="flex flex-col flex-1 max-w-3xl">
      <div className="border-b border-subtle pb-6 mb-6">
        <h2 className="text-xl font-semibold text-emphasis">Profile</h2>
        <p className="text-sm text-subtle mt-1">Manage settings for your Cal.com profile</p>
      </div>

      <div className="border border-subtle rounded-lg flex flex-col overflow-hidden">
        <div className="p-6 flex flex-col gap-6">
          {/* Avatar Area */}
          <div className="flex gap-4 items-center">
            <div className="h-16 w-16 rounded-full bg-brand flex flex-shrink-0 items-center justify-center text-brand-contrast text-2xl font-bold uppercase overflow-hidden">
              P
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-sm font-medium text-emphasis">Profile picture</span>
              <div className="flex gap-2">
                <button className="h-9 px-4 text-sm font-medium border border-subtle rounded-md bg-default hover:bg-subtle transition text-emphasis flex items-center justify-center">
                  Upload Avatar
                </button>
              </div>
            </div>
          </div>

          <p className="text-subtle mt-1 flex gap-1 text-sm bg-subtle/50 p-2 rounded-md">
            <Icon name="info" className="mt-0.5 shrink-0 h-4 w-4" />
            <span className="flex-1">You can change your username here. This will update your booking link.</span>
          </p>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-emphasis">Username</label>
            <div className="flex rounded-md border border-subtle overflow-hidden focus-within:ring-2 focus-within:ring-brand focus-within:border-brand">
              <span className="flex items-center px-3 bg-muted text-subtle text-sm border-r border-subtle">
                cal.com/
              </span>
              <input type="text" className="flex-1 bg-default h-9 px-3 text-sm text-emphasis outline-none leading-none" defaultValue="priyanshu" />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-emphasis">Full name</label>
            <input type="text" className="w-full bg-default border border-subtle rounded-md h-9 px-3 text-sm text-emphasis focus:ring-2 focus:ring-brand focus:border-brand outline-none" defaultValue="Priyanshu" />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-emphasis">Email</label>
            <div className="flex items-center gap-2 w-full">
              <input type="email" className="flex-1 bg-default border border-subtle rounded-md h-9 px-3 text-sm text-emphasis focus:ring-2 focus:ring-brand focus:border-brand outline-none" defaultValue="priyanshu@example.com" />
            </div>
            <button className="flex items-center text-sm font-medium text-emphasis hover:text-brand mt-1 self-start">
               <Icon name="plus" className="h-4 w-4 mr-1" /> Add email
            </button>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-emphasis">About</label>
            <textarea className="w-full bg-default border border-subtle rounded-md p-3 text-sm text-emphasis focus:ring-2 focus:ring-brand focus:border-brand outline-none resize-none h-28" placeholder="A little bit about yourself..."></textarea>
          </div>
        </div>

        {/* Section Bottom Actions */}
        <div className="px-6 py-4 bg-subtle border-t border-subtle flex justify-end">
          <button className="btn-primary h-9 px-4 rounded-md bg-emphasis text-inverted font-medium text-sm hover:opacity-90 transition">
            Update
          </button>
        </div>
      </div>

      <div className="border border-destructive/20 border-b-0 mt-6 rounded-t-lg p-6 bg-red-50/10">
        <h3 className="mb-1 text-base font-semibold text-destructive">Danger Zone</h3>
        <p className="text-subtle text-sm">Deleting your account is a permanent action and cannot be reversed.</p>
      </div>
      <div className="px-6 py-4 bg-subtle border border-destructive/20 rounded-b-lg flex justify-end">
         <button className="h-9 px-4 border-destructive/30 border text-destructive rounded-md bg-default font-medium text-sm hover:bg-destructive hover:text-white transition group flex items-center gap-2">
            <Icon name="trash-2" className="h-4 w-4" />
            Delete account
         </button>
      </div>
    </div>
  );
}
