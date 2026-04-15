import React, { useState, useEffect } from "react";
import { EventTypeCard } from "./EventTypeCard";
import { demoEventTypes, demoProfile } from "../data/demo";
import { Icon } from "./Icon";
import { Skeleton, SkeletonText, SkeletonButton, SkeletonAvatar } from "./Skeleton";
import { useAutoAnimate } from "@formkit/auto-animate/react";

export function EventTypesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [parent] = useAutoAnimate();

  // Simulate loading to show wireframes
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  const filtered = demoEventTypes.filter((t) =>
    t.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex-1 lg:pr-6">
        <div className="flex items-center md:mb-6 md:mt-0 lg:mb-8 justify-between">
           <div className="flex flex-col gap-2">
              <Skeleton className="h-7 w-48" />
              <Skeleton className="h-4 w-72" />
           </div>
           <div className="flex gap-4">
              <Skeleton className="h-9 w-64 rounded-md" />
              <Skeleton className="h-9 w-20 rounded-md" />
           </div>
        </div>
        <div className="border border-subtle rounded-md bg-default divide-y divide-subtle">
           {[1, 2, 3].map(i => (
              <div key={i} className="p-4 flex items-center justify-between">
                 <div className="flex items-center gap-3">
                    <SkeletonAvatar className="h-10 w-10" />
                    <div className="flex flex-col gap-2">
                       <Skeleton className="h-4 w-32" />
                       <Skeleton className="h-3 w-48" />
                    </div>
                 </div>
                 <div className="flex gap-2">
                    <Skeleton className="h-8 w-16" />
                    <Skeleton className="h-8 w-8 rounded-full" />
                 </div>
              </div>
           ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 lg:pr-6">
      {/* ── Header row ─────────────────────────────────────── */}
      <div className="flex items-center md:mb-6 md:mt-0 lg:mb-8">
        <header className="flex w-full max-w-full items-center flex-wrap md:flex-nowrap gap-2 md:gap-0">
          {/* Heading + Subtitle */}
          <div className="hidden min-w-0 flex-1 ltr:mr-4 rtl:ml-4 md:block text-emphasis">
            <h3 className="font-cal max-w-28 sm:max-w-72 md:max-w-80 inline truncate text-lg font-semibold tracking-wide sm:text-xl md:block xl:max-w-full">
              Event types
            </h3>
            <p className="text-subtle hidden text-sm md:block mt-1">
              Configure different events for people to book on your calendar.
            </p>
          </div>

          {/* CTA: Search + New */}
          <div className="shrink-0 md:relative md:bottom-auto md:right-auto ml-auto">
            <div className="flex items-center gap-4">
              {/* Search */}
              <div className="max-w-64 relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Icon name="search" className="text-subtle h-4 w-4" />
                </div>
                <input
                  type="search"
                  autoComplete="off"
                  placeholder="Search"
                  className="bg-default border-subtle text-emphasis block w-full rounded-md border py-2 pl-10 pr-3 text-sm focus:border-brand focus:ring-1 focus:ring-brand focus:outline-none transition-all placeholder:text-muted"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              {/* + New button */}
              <button className="whitespace-nowrap inline-flex items-center text-sm font-medium relative rounded-md transition cursor-pointer gap-1 px-3 py-2 hover:opacity-90 btn-primary">
                <Icon name="plus" className="h-4 w-4 shrink-0 stroke-[1.5px]" />
                <span>New</span>
              </button>
            </div>
          </div>
        </header>
      </div>

      {/* ── Event Type List ──────────────────────────────────── */}
      <div className="bg-default border-subtle flex flex-col rounded-md border overflow-hidden">
        <ul ref={parent} className="divide-subtle w-full divide-y" data-testid="event-types">
          {filtered.length > 0 ? (
            filtered.map((type, index) => (
              <EventTypeCard
                key={type.id}
                type={type}
                profile={demoProfile}
                isFirst={index === 0}
                isLast={index === filtered.length - 1}
              />
            ))
          ) : (
            <li className="flex flex-col items-center justify-center py-20 text-emphasis">
              <Icon name="link" className="text-subtle h-10 w-10 mb-4 opacity-50" />
              <h3 className="text-lg font-semibold">
                No results found
              </h3>
              <p className="text-subtle text-sm mt-1">
                Try adjusting your search to find what you&apos;re looking for.
              </p>
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}

