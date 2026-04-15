import React, { useState, useEffect } from "react";
import { Icon } from "./Icon";
import { Skeleton, SkeletonText, SkeletonButton, SkeletonAvatar } from "./Skeleton";
import { useAutoAnimate } from "@formkit/auto-animate/react";

const TAB_OPTIONS = [
  { value: "upcoming", label: "Upcoming" },
  { value: "unconfirmed", label: "Unconfirmed" },
  { value: "recurring", label: "Recurring" },
  { value: "past", label: "Past" },
  { value: "cancelled", label: "Cancelled" },
];

const EMPTY_DESCRIPTIONS = {
  upcoming: "You have no upcoming bookings. As soon as someone books a time with you it will show up here.",
  unconfirmed: "You have no unconfirmed bookings. As soon as someone books a time with you it will show up here.",
  recurring: "You have no recurring bookings. As soon as someone books a time with you it will show up here.",
  past: "You have no past bookings. As soon as someone books a time with you it will show up here.",
  cancelled: "You have no cancelled bookings. As soon as someone books a time with you it will show up here.",
};

export function BookingsPage() {
  const [activeTab, setActiveTab] = useState("upcoming");
  const [isLoading, setIsLoading] = useState(true);
  const [parent] = useAutoAnimate();

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 700);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
       <div className="flex-1 lg:pr-6">
        <div className="flex items-center md:mb-6 md:mt-0 lg:mb-8 justify-between">
           <div className="flex flex-col gap-2">
              <Skeleton className="h-7 w-48" />
              <Skeleton className="h-4 w-72" />
           </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 mb-4">
           <Skeleton className="h-9 w-64 rounded-md" />
           <Skeleton className="h-9 w-24 rounded-md" />
           <div className="grow" />
           <Skeleton className="h-9 w-32 rounded-md" />
        </div>
        <div className="border border-subtle rounded-md bg-default divide-y divide-subtle">
           {[1, 2, 3].map(i => (
              <div key={i} className="p-6 flex items-center justify-between animate-pulse">
                 <div className="flex items-center gap-4">
                    <div className="flex flex-col items-center">
                       <Skeleton className="h-4 w-8" />
                       <Skeleton className="h-6 w-10 mt-1" />
                    </div>
                    <div className="h-10 w-[1px] bg-subtle mx-2" />
                    <div className="flex flex-col gap-2">
                       <Skeleton className="h-4 w-32" />
                       <Skeleton className="h-3 w-48" />
                    </div>
                 </div>
                 <Skeleton className="h-9 w-24 rounded-md" />
              </div>
           ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 lg:pr-6 text-emphasis">
      {/* ── Shell Header ───────────────────────────────────── */}
      <div className="flex items-center md:mb-6 md:mt-0 lg:mb-8">
        <header className="flex w-full max-w-full items-center flex-wrap md:flex-nowrap gap-2 md:gap-0">
          <div className="hidden min-w-0 flex-1 ltr:mr-4 rtl:ml-4 md:block">
            <h3 className="font-cal text-emphasis max-w-28 sm:max-w-72 md:max-w-80 inline truncate text-lg font-semibold tracking-wide sm:text-xl md:block xl:max-w-full">
              Bookings
            </h3>
            <p className="text-subtle hidden text-sm md:block mt-1">
              See upcoming and past events booked through your event type links.
            </p>
          </div>
        </header>
      </div>

      {/* ── Controls row ───────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <div className="w-full md:w-auto">
          <ToggleGroup options={TAB_OPTIONS} value={activeTab} onValueChange={setActiveTab} />
        </div>
        <button className="btn-secondary inline-flex items-center gap-1.5 h-9">
          <Icon name="list-filter" className="h-4 w-4" />
          <span>Filter</span>
        </button>
        <div className="hidden grow md:block" />
        <button className="btn-secondary inline-flex items-center gap-1.5 h-9">
          <Icon name="list-filter" className="h-4 w-4" />
          <span>Saved filters</span>
          <Icon name="chevron-down" className="h-4 w-4 ml-1" />
        </button>
      </div>

      {/* ── List / Empty State ─────────────────────────────── */}
      <div ref={parent} className="mt-4">
        <EmptyScreen
          icon="calendar"
          headline={`No ${activeTab} bookings`}
          description={EMPTY_DESCRIPTIONS[activeTab]}
        />
      </div>
    </div>
  );
}

function ToggleGroup({ options, value, onValueChange }) {
  return (
    <div className="bg-muted inline-flex gap-0.5 rounded-[10px] p-0.5" role="radiogroup">
      {options.map((option) => {
        const isActive = value === option.value;
        return (
          <button
            key={option.value}
            onClick={() => onValueChange(option.value)}
            className={`rounded-lg border p-1.5 text-sm leading-none transition cursor-pointer ${
              isActive
                ? "bg-default border-subtle shadow-[0px_2px_3px_0px_rgba(0,0,0,0.03),0px_2px_2px_-1px_rgba(0,0,0,0.03)] text-emphasis font-medium"
                : "border-transparent text-subtle hover:text-emphasis hover:bg-subtle"
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

function EmptyScreen({ icon, headline, description }) {
  return (
    <div className="flex w-full select-none flex-col items-center justify-center rounded-lg border-subtle border border-dashed p-7 lg:p-20 bg-default">
      <div className="bg-emphasis flex h-[72px] w-[72px] items-center justify-center rounded-full">
        <Icon name={icon} className="text-emphasis inline-block h-10 w-10 stroke-[1.3px]" />
      </div>
      <div className="flex max-w-[420px] flex-col items-center">
        <h2 className="text-semibold font-cal text-emphasis text-center text-xl mt-6">{headline}</h2>
        <div className="text-subtle mb-8 mt-3 text-center text-sm font-normal leading-6">{description}</div>
      </div>
    </div>
  );
}
