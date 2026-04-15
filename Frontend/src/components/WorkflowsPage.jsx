import React from "react";
import { Icon } from "./Icon";

const MOCK_WORKFLOWS = [
  {
    id: 1,
    name: "Email Reminder before meeting",
    description: "Send an email to attendees 24 hours before event starts",
    trigger: "BEFORE_EVENT",
    action: "SEND_EMAIL",
    active: true,
  },
  {
    id: 2,
    name: "SMS Follow-up",
    description: "Send a thank you SMS 1 hour after meeting ends",
    trigger: "AFTER_EVENT",
    action: "SEND_SMS",
    active: true,
  },
  {
    id: 3,
    name: "Webhook to CRM",
    description: "Trigger a webhook when a new booking is created",
    trigger: "NEW_EVENT",
    action: "SEND_WEBHOOK",
    active: false,
  }
];

const TRIGGER_VARIANTS = {
  BEFORE_EVENT: { icon: "clock", label: "Before event" },
  AFTER_EVENT: { icon: "clock", label: "After event" },
  NEW_EVENT: { icon: "calendar", label: "New event" }
};

const ACTION_VARIANTS = {
  SEND_EMAIL: { icon: "mail", label: "Send email" },
  SEND_SMS: { icon: "smartphone", label: "Send SMS" },
  SEND_WEBHOOK: { icon: "code", label: "Webhook" }
};

export function WorkflowsPage() {
  return (
    <div className="flex-1 w-full max-w-full">
      {/* ── Shell Header ───────────────────────────────────── */}
      <div className="flex items-center md:mb-6 md:mt-0 lg:mb-8">
        <header className="flex w-full max-w-full flex-col md:flex-row md:items-center justify-between">
          <div className="min-w-0 flex-1 ltr:mr-4 rtl:ml-4">
            <h3 className="font-cal text-emphasis inline truncate text-lg font-semibold tracking-wide sm:text-xl xl:max-w-full">
              Workflows
            </h3>
            <p className="text-default hidden text-sm md:block mt-1">
              Automate notifications and reminders for your bookings.
            </p>
          </div>
          <div className="flex w-full flex-col pt-4 md:flex-row md:justify-between md:pt-0 lg:w-auto relative">
            <button className="btn-primary flex items-center justify-center">
              <Icon name="plus" className="mr-1.5 h-4 w-4" />
              New
            </button>
          </div>
        </header>
      </div>

      <div className="mb-10 w-full bg-default border border-subtle rounded-md overflow-hidden">
        <ul className="flex flex-col m-0 p-0 divide-y divide-subtle">
          {MOCK_WORKFLOWS.map((workflow) => {
            const TriggerInfo = TRIGGER_VARIANTS[workflow.trigger];
            const ActionInfo = ACTION_VARIANTS[workflow.action];
            
            return (
              <li key={workflow.id} className="group hover:bg-subtle flex max-w-full flex-col justify-between p-4 transition-colors sm:flex-row xl:p-6 cursor-pointer">
                <div className="flex w-full flex-col truncate pr-4 sm:w-8/12">
                  <h4 className="text-emphasis mb-1 font-semibold text-sm leading-tight">
                    {workflow.name}
                  </h4>
                  <p className="text-subtle text-sm line-clamp-1">{workflow.description}</p>
                  
                  <div className="mt-4 flex flex-wrap gap-2">
                    <span className="bg-subtle text-emphasis flex items-center rounded-md px-1.5 py-0.5 text-xs font-medium border border-subtle">
                      <Icon name={TriggerInfo.icon} className="mr-1 h-3 w-3 text-subtle" />
                      {TriggerInfo.label}
                    </span>
                    <span className="text-subtle flex items-center justify-center font-bold">
                       <Icon name="arrow-right" className="h-3 w-3" />
                    </span>
                    <span className="bg-subtle text-emphasis flex items-center rounded-md px-1.5 py-0.5 text-xs font-medium border border-subtle">
                      <Icon name={ActionInfo.icon} className="mr-1 h-3 w-3 text-subtle" />
                      {ActionInfo.label}
                    </span>
                  </div>
                </div>

                <div className="mt-4 flex flex-shrink-0 items-center justify-between sm:mt-0 sm:items-start xl:gap-6">
                  {/* Toggle Switch */}
                  <div className="self-center flex items-center justify-center mr-6">
                     <button
                      role="switch"
                      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                        workflow.active ? "bg-brand" : "bg-muted"
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-brand-contrast transition ${
                          workflow.active ? "translate-x-4" : "translate-x-1"
                        }`}
                      />
                    </button>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <div className="flex -space-x-px overflow-hidden rounded-md border border-subtle group/btnContainer">
                      <button className="flex h-9 items-center justify-center px-3 hover:bg-subtle bg-default text-emphasis border-r border-subtle transition-colors">
                        <Icon name="pencil" className="h-4 w-4" />
                      </button>
                      <button className="flex h-9 items-center justify-center px-3 hover:bg-subtle bg-default text-emphasis transition-colors">
                        <Icon name="ellipsis" className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
