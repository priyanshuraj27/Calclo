import React, { useState } from "react";
import { Icon } from "./Icon";

const TAB_OPTIONS = [
  { value: "mine", label: "My availability" },
  { value: "team", label: "Team availability" },
];

export function AvailabilityPage() {
  const [activeTab, setActiveTab] = useState("mine");

  return (
    <div className="flex-1">
      {/* ── Shell Header ───────────────────────────────────── */}
      <div className="flex items-center md:mb-6 md:mt-0 lg:mb-8">
        <header className="flex w-full max-w-full items-center flex-wrap md:flex-nowrap gap-2 md:gap-0 justify-between">
          <div className="hidden min-w-0 flex-1 ltr:mr-4 rtl:ml-4 md:block">
            <h3 className="font-cal text-emphasis max-w-28 sm:max-w-72 md:max-w-80 inline truncate text-lg font-semibold tracking-wide sm:text-xl md:block xl:max-w-full">
              Availability
            </h3>
            <p className="text-default hidden text-sm md:block">
              Configure times when you are available for bookings.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <ToggleGroup
              options={TAB_OPTIONS}
              value={activeTab}
              onValueChange={setActiveTab}
            />
            <button
              type="button"
              className="bg-brand text-brand-contrast hover:bg-brand-emphasis inline-flex items-center justify-center rounded-md px-3 py-2 text-sm font-medium transition"
              data-testid="new-event-type-button"
            >
              <Icon name="plus" className="mr-2 h-4 w-4" />
              New
            </button>
          </div>
        </header>
      </div>

      {/* ── Availability List ───────────────────────────────────── */}
      <div className="border-subtle bg-default overflow-hidden rounded-md border mt-4">
        <ul className="divide-subtle divide-y" data-testid="schedules">
          <li>
            <div className="hover:bg-cal-muted flex items-center justify-between px-3 py-5 transition sm:px-4 cursor-pointer">
              <div className="grow truncate text-sm" title="Working hours">
                <div className="space-x-2 rtl:space-x-reverse">
                  <span className="text-emphasis truncate font-medium">Working hours</span>
                  <div className="inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-semibold normal-case whitespace-nowrap bg-muted text-default border-transparent">
                    Default
                  </div>
                </div>
                <p className="text-subtle mt-1 flex flex-col">
                  <span>Mon - Fri, 9:00 AM - 5:00 PM</span>
                  <span className="my-1 flex items-center first-letter:text-xs">
                    <Icon name="globe" className="h-3.5 w-3.5 mr-1" />
                    Asia/Calcutta
                  </span>
                </p>
              </div>
              <button
                type="button"
                className="btn-icon-secondary rounded-full ml-4"
              >
                <Icon name="ellipsis" className="h-4 w-4" />
              </button>
            </div>
          </li>
        </ul>
      </div>

      <div className="text-default mb-16 mt-4 block text-center text-sm">
        Temporarily out-of-office?{" "}
        <a href="#" className="underline">
          Add a redirect
        </a>
      </div>
    </div>
  );
}

/**
 * ToggleGroup – pixel-perfect replica of Cal.com's Radix ToggleGroup.
 */
function ToggleGroup({ options, value, onValueChange }) {
  return (
    <div
      className="bg-muted inline-flex gap-0.5 rounded-[10px] p-0.5 rtl:flex-row-reverse"
      role="radiogroup"
    >
      {options.map((option) => {
        const isActive = value === option.value;
        return (
          <button
            key={option.value}
            role="radio"
            aria-checked={isActive}
            data-testid={`toggle-group-item-${option.value}`}
            onClick={() => onValueChange(option.value)}
            className={`rounded-lg border p-1.5 text-sm leading-none transition cursor-pointer ${
              isActive
                ? "bg-default border-subtle shadow-[0px_2px_3px_0px_rgba(0,0,0,0.03),0px_2px_2px_-1px_rgba(0,0,0,0.03)]"
                : "border-transparent text-default hover:text-emphasis hover:bg-subtle"
            }`}
          >
            <div className="flex items-center justify-center gap-1">
              {option.label}
            </div>
          </button>
        );
      })}
    </div>
  );
}
