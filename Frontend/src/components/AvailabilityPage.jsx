import React, { useState, useEffect } from "react";
import { Icon } from "./Icon";
import { Skeleton, SkeletonText, SkeletonButton, SkeletonAvatar } from "./Skeleton";
import { useAutoAnimate } from "@formkit/auto-animate/react";

const TAB_OPTIONS = [
  { value: "mine", label: "My availability" },
  { value: "team", label: "Team availability" },
];

export function AvailabilityPage() {
  const [activeTab, setActiveTab] = useState("mine");
  const [isLoading, setIsLoading] = useState(true);
  const [parent] = useAutoAnimate();

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 600);
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
           <div className="flex gap-2">
              <Skeleton className="h-9 w-40 rounded-md" />
              <Skeleton className="h-9 w-20 rounded-md" />
           </div>
        </div>
        <div className="border border-subtle rounded-md bg-default divide-y divide-subtle mt-4">
           {[1, 2].map(i => (
              <div key={i} className="p-6 flex items-center justify-between animate-pulse">
                 <div className="flex flex-col gap-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-48" />
                 </div>
                 <Skeleton className="h-8 w-8 rounded-full" />
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
        <header className="flex w-full max-w-full items-center flex-wrap md:flex-nowrap gap-2 md:gap-0 justify-between">
          <div className="hidden min-w-0 flex-1 ltr:mr-4 rtl:ml-4 md:block">
            <h3 className="font-cal text-emphasis max-w-28 sm:max-w-72 md:max-w-80 inline truncate text-lg font-semibold tracking-wide sm:text-xl md:block xl:max-w-full">
              Availability
            </h3>
            <p className="text-subtle hidden text-sm md:block mt-1">
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
              className="bg-emphasis text-inverted hover:opacity-90 inline-flex items-center justify-center rounded-md px-3 py-2 text-sm font-medium transition h-9"
            >
              <Icon name="plus" className="mr-2 h-4 w-4" />
              New
            </button>
          </div>
        </header>
      </div>

      {/* ── Availability List ───────────────────────────────────── */}
      <div className="border-subtle bg-default overflow-hidden rounded-md border mt-4">
        <ul ref={parent} className="divide-subtle divide-y" data-testid="schedules">
          {activeTab === "mine" ? (
             <li>
               <div className="hover:bg-muted flex items-center justify-between px-3 py-5 transition sm:px-4 cursor-pointer">
                 <div className="grow truncate text-sm">
                   <div className="space-x-2 rtl:space-x-reverse flex items-center">
                     <span className="text-emphasis truncate font-medium">Working hours</span>
                     <div className="inline-flex items-center rounded-md border px-2 py-0.5 text-[11px] font-bold uppercase whitespace-nowrap bg-muted text-subtle border-subtle">
                       Default
                     </div>
                   </div>
                   <p className="text-subtle mt-1.5 flex flex-col gap-0.5">
                     <span className="text-xs">Mon - Fri, 9:00 AM - 5:00 PM</span>
                     <span className="flex items-center text-xs">
                       <Icon name="globe" className="h-3.5 w-3.5 mr-1" />
                       Asia/Calcutta
                     </span>
                   </p>
                 </div>
                 <button type="button" className="btn-icon-secondary rounded-full ml-4 border-none hover:bg-subtle">
                   <Icon name="more-horizontal" className="h-4 w-4" />
                 </button>
               </div>
             </li>
          ) : (
             <li className="py-20 flex flex-col items-center justify-center text-center">
                <Icon name="users" className="h-10 w-10 text-subtle opacity-30 mb-4" />
                <span className="text-sm text-subtle">No team availability found.</span>
             </li>
          )}
        </ul>
      </div>

      <div className="text-subtle mb-16 mt-6 block text-center text-sm">
        Temporarily out-of-office?{" "}
        <a href="#" className="underline hover:text-emphasis transition">
          Add a redirect
        </a>
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

