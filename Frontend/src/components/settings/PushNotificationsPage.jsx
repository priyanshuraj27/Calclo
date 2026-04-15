import React from "react";
import { Icon } from "../Icon";

export function PushNotificationsPage() {
  return (
    <div className="flex flex-col flex-1 max-w-5xl">
      <div className="border-b border-subtle pb-6 mb-6">
        <h2 className="text-xl font-semibold text-emphasis">Push notifications</h2>
        <p className="text-sm text-subtle mt-1">Configure your push notification preferences for this device.</p>
      </div>

      <div className="border border-subtle rounded-lg flex flex-col p-6 bg-default items-start">
         <div className="flex items-center gap-4 mb-4">
            <div className="h-10 w-10 bg-muted border border-subtle rounded-full flex items-center justify-center">
               <Icon name="bell" className="h-5 w-5 text-emphasis" />
            </div>
            <div className="flex flex-col">
               <h3 className="font-semibold text-sm text-emphasis">Desktop Push Notifications</h3>
               <p className="text-sm text-subtle">Get notified about new bookings on this device.</p>
            </div>
         </div>
         <button className="h-9 px-4 text-sm font-medium border border-subtle rounded-md bg-default hover:bg-subtle transition text-emphasis">
            Enable notifications
         </button>
      </div>
    </div>
  );
}
