import React from "react";
import { Icon } from "./Icon";

const MOCK_ROUTING_FORMS = [
  {
    id: 1,
    name: "Enterprise Sales Funnel",
    description: "Route potential leads based on deal size and urgency.",
    fields: 3,
    routes: 4,
    responses: 128,
    active: true,
  },
  {
    id: 2,
    name: "Support Triage",
    description: "Send customers to the right support agent based on product.",
    fields: 2,
    routes: 2,
    responses: 45,
    active: false,
  }
];

export function RoutingFormsPage() {
  return (
    <div className="flex-1 w-full max-w-full">
      {/* ── Shell Header ───────────────────────────────────── */}
      <div className="flex items-center md:mb-6 md:mt-0 lg:mb-8">
        <header className="flex w-full max-w-full flex-col md:flex-row md:items-center justify-between">
          <div className="min-w-0 flex-1 ltr:mr-4 rtl:ml-4">
            <h3 className="font-cal text-emphasis inline truncate text-lg font-semibold tracking-wide sm:text-xl xl:max-w-full">
              Routing
            </h3>
            <p className="text-default hidden text-sm md:block mt-1">
              Create your forms to route people to the right booking using conditional logic.
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

      <div className="mb-10 w-full">
        <div className="bg-default mb-16 overflow-hidden rounded-md border border-subtle">
          <ul className="flex flex-col m-0 p-0 divide-y divide-subtle">
            {MOCK_ROUTING_FORMS.map((form, index) => (
              <div
                className="group flex w-full max-w-full items-center justify-between overflow-hidden"
                key={form.id}>
                
                {/* Arrow Reordering Buttons */}
                <div className="flex flex-col border-r border-subtle w-10 flex-shrink-0">
                  <button 
                    disabled={index === 0} 
                    className="h-10 hover:bg-subtle flex items-center justify-center text-subtle hover:text-emphasis transition-colors disabled:opacity-30 border-b border-subtle"
                  >
                    <Icon name="chevron-up" className="h-4 w-4" />
                  </button>
                  <button 
                    disabled={index === MOCK_ROUTING_FORMS.length - 1} 
                    className="h-10 hover:bg-subtle flex items-center justify-center text-subtle hover:text-emphasis transition-colors disabled:opacity-30"
                  >
                    <Icon name="chevron-down" className="h-4 w-4" />
                  </button>
                </div>

                {/* Main Content Area */}
                <li className="flex-1 hover:bg-subtle/50 transition-colors cursor-pointer group-hover:bg-subtle/50 flex w-full flex-col sm:flex-row sm:items-center justify-between p-4 px-5">
                  <div className="flex flex-col">
                    <h4 className="text-emphasis text-sm font-semibold">{form.name}</h4>
                    <p className="text-subtle mt-1 text-sm line-clamp-1">{form.description}</p>
                    
                    <div className="flex flex-wrap gap-2 mt-3">
                      <span className="bg-subtle text-emphasis flex items-center rounded-md px-1.5 py-0.5 text-xs font-medium border border-subtle">
                        <Icon name="grid-3x3" className="mr-1 h-3 w-3 text-subtle" />
                        {form.fields} {form.fields === 1 ? "field" : "fields"}
                      </span>
                      <span className="bg-subtle text-emphasis flex items-center rounded-md px-1.5 py-0.5 text-xs font-medium border border-subtle">
                        <Icon name="split" className="mr-1 h-3 w-3 text-subtle" />
                        {form.routes} {form.routes === 1 ? "route" : "routes"}
                      </span>
                      <span className="bg-subtle text-emphasis flex items-center rounded-md px-1.5 py-0.5 text-xs font-medium border border-subtle">
                        <Icon name="message-circle" className="mr-1 h-3 w-3 text-subtle" />
                        {form.responses} {form.responses === 1 ? "response" : "responses"}
                      </span>
                    </div>
                  </div>

                  {/* Actions Area */}
                  <div className="mt-4 flex flex-shrink-0 sm:mt-0 sm:items-center space-x-2 rtl:space-x-reverse ml-4">
                    {/* Toggle Switch */}
                    <div className="self-center flex items-center justify-center mr-2">
                       <button
                        role="switch"
                        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                          form.active ? "bg-brand" : "bg-muted"
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-brand-contrast transition ${
                            form.active ? "translate-x-4" : "translate-x-1"
                          }`}
                        />
                      </button>
                    </div>

                    <div className="flex -space-x-px overflow-hidden rounded-md border border-subtle group/btnContainer">
                      <button className="flex h-9 items-center justify-center px-3 hover:bg-subtle bg-default text-emphasis hover:text-emphasis border-r border-subtle">
                        <Icon name="external-link" className="h-4 w-4" />
                      </button>
                      <button className="flex h-9 items-center justify-center px-3 hover:bg-subtle bg-default text-emphasis hover:text-emphasis border-r border-subtle">
                        <Icon name="link" className="h-4 w-4" />
                      </button>
                      <button className="flex h-9 items-center justify-center px-3 hover:bg-subtle bg-default text-emphasis hover:text-emphasis border-r border-subtle">
                        <Icon name="code" className="h-4 w-4" />
                      </button>
                      <button className="flex h-9 items-center justify-center px-3 hover:bg-subtle bg-default text-emphasis hover:text-emphasis">
                        <Icon name="ellipsis" className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </li>
              </div>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
