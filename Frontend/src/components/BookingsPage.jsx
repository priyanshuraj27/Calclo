import React, { useState } from "react";
import { Icon } from "./Icon";

/**
 * Pixel-perfect replica of Cal.com /bookings page.
 *
 * Layout (from source):
 *  ShellMainAppDir header:
 *    - heading: "Bookings"
 *    - subtitle: "See upcoming and past events booked through your event type links."
 *
 *  BookingListContainer:
 *    - ToggleGroup tabs: Upcoming | Unconfirmed | Recurring | Past | Cancelled
 *    - Filter button (list-filter icon + "Filter" text)
 *    - spacer
 *    - Saved filters dropdown (list-filter icon + "Saved filters" + chevron-down)
 *
 *  EmptyScreen:
 *    - calendar icon in circle (72x72 bg-emphasis)
 *    - "No upcoming bookings" heading (Cal Sans, xl)
 *    - description text
 */

const TAB_OPTIONS = [
  { value: "upcoming", label: "Upcoming" },
  { value: "unconfirmed", label: "Unconfirmed" },
  { value: "recurring", label: "Recurring" },
  { value: "past", label: "Past" },
  { value: "cancelled", label: "Cancelled" },
];

const EMPTY_DESCRIPTIONS = {
  upcoming:
    "You have no upcoming bookings. As soon as someone books a time with you it will show up here.",
  unconfirmed:
    "You have no unconfirmed bookings. As soon as someone books a time with you it will show up here.",
  recurring:
    "You have no recurring bookings. As soon as someone books a time with you it will show up here.",
  past: "You have no past bookings. As soon as someone books a time with you it will show up here.",
  cancelled:
    "You have no cancelled bookings. As soon as someone books a time with you it will show up here.",
};

export function BookingsPage() {
  const [activeTab, setActiveTab] = useState("upcoming");

  return (
    <div className="flex-1">
      {/* ── Shell Header ───────────────────────────────────── */}
      <div className="flex items-center md:mb-6 md:mt-0 lg:mb-8">
        <header className="flex w-full max-w-full items-center flex-wrap md:flex-nowrap gap-2 md:gap-0">
          <div className="hidden min-w-0 flex-1 ltr:mr-4 rtl:ml-4 md:block">
            <h3 className="font-cal text-emphasis max-w-28 sm:max-w-72 md:max-w-80 inline truncate text-lg font-semibold tracking-wide sm:text-xl md:block xl:max-w-full">
              Bookings
            </h3>
            <p className="text-default hidden text-sm md:block">
              See upcoming and past events booked through your event type links.
            </p>
          </div>
        </header>
      </div>

      {/* ── Controls row ───────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-2">
        {/* ToggleGroup tabs */}
        <div className="w-full md:w-auto">
          <div className="overflow-x-auto md:overflow-visible">
            <ToggleGroup
              options={TAB_OPTIONS}
              value={activeTab}
              onValueChange={setActiveTab}
            />
          </div>
        </div>

        {/* Filter button */}
        <button className="btn-secondary inline-flex items-center gap-1.5 h-full">
          <Icon name="list-filter" className="h-4 w-4" />
          <span>Filter</span>
        </button>

        {/* Spacer (desktop) */}
        <div className="hidden grow md:block" />

        {/* Saved filters */}
        <button className="btn-secondary inline-flex items-center gap-1.5">
          <Icon name="list-filter" className="h-4 w-4" />
          <span>Saved filters</span>
          <Icon name="chevron-down" className="h-4 w-4" />
        </button>
      </div>

      {/* ── BookingList EmptyScreen ─────────────────────────── */}
      <div className="mt-4">
        <div className="flex items-center justify-center pt-2 xl:pt-0">
          <EmptyScreen
            icon="calendar"
            headline={`No ${activeTab} bookings`}
            description={EMPTY_DESCRIPTIONS[activeTab]}
          />
        </div>
      </div>
    </div>
  );
}

/**
 * ToggleGroup – pixel-perfect replica of Cal.com's Radix ToggleGroup.
 *
 * Root: bg-muted rounded-[10px] p-0.5, inline-flex gap-0.5
 * Item: rounded-lg border border-transparent p-1.5 text-sm
 *       aria-checked => bg-default border-subtle shadow
 *       unchecked => text-default hover:text-emphasis hover:bg-subtle
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

/**
 * EmptyScreen – pixel-perfect replica of Cal.com's EmptyScreen component.
 *
 * Container: border-subtle border border-dashed rounded-lg p-7 lg:p-20
 * Icon wrapper: bg-emphasis h-[72px] w-[72px] rounded-full
 * Icon: text-default h-10 w-10 stroke-[1.3px]
 * Headline: font-cal text-emphasis text-xl text-center mt-6
 * Description: text-default text-sm text-center mt-3 mb-8
 */
function EmptyScreen({ icon, headline, description }) {
  return (
    <div
      data-testid="empty-screen"
      className="flex w-full select-none flex-col items-center justify-center rounded-lg border-subtle border border-dashed p-7 lg:p-20"
    >
      {/* Icon circle */}
      <div className="bg-emphasis flex h-[72px] w-[72px] items-center justify-center rounded-full">
        <Icon
          name={icon}
          className="text-default inline-block h-10 w-10 stroke-[1.3px]"
        />
      </div>

      {/* Text content */}
      <div className="flex max-w-[420px] flex-col items-center">
        <h2 className="text-semibold font-cal text-emphasis text-center text-xl normal-nums mt-6">
          {headline}
        </h2>
        {description && (
          <div className="text-default mb-8 mt-3 text-center text-sm font-normal leading-6">
            {description}
          </div>
        )}
      </div>
    </div>
  );
}
