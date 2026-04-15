import React, { useState } from "react";
import { EventTypeCard } from "./EventTypeCard";
import { demoEventTypes, demoProfile } from "../data/demo";
import { Icon } from "./Icon";

/**
 * Pixel-perfect replica of Cal.com /event-types page.
 *
 * Layout:
 *  - Header row: "Event types" heading + subtitle left, Search + "+ New" right
 *  - Event type list in a bordered card
 */
export function EventTypesPage() {
  const [searchTerm, setSearchTerm] = useState("");

  const filtered = demoEventTypes.filter((t) =>
    t.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex-1">
      {/* ── Header row ─────────────────────────────────────── */}
      <div className="flex items-center md:mb-6 md:mt-0 lg:mb-8">
        <header className="flex w-full max-w-full items-center flex-wrap md:flex-nowrap gap-2 md:gap-0">
          {/* Heading + Subtitle */}
          <div className="hidden min-w-0 flex-1 ltr:mr-4 rtl:ml-4 md:block">
            <h3 className="font-cal text-emphasis max-w-28 sm:max-w-72 md:max-w-80 inline truncate text-lg font-semibold tracking-wide sm:text-xl md:block xl:max-w-full">
              Event types
            </h3>
            <p className="text-default hidden text-sm md:block">
              Configure different events for people to book on your calendar.
            </p>
          </div>

          {/* CTA: Search + New */}
          <div className="shrink-0 md:relative md:bottom-auto md:right-auto">
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
                  className="bg-default border-subtle text-emphasis block w-full rounded-md border py-2 pl-10 pr-3 text-sm focus:border-emphasis focus:ring-0 focus:outline-none transition-all placeholder:text-muted"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              {/* + New button */}
              <button className="whitespace-nowrap inline-flex items-center text-sm font-medium relative rounded-[10px] transition cursor-pointer gap-1 bg-inverted text-inverted border border-inverted px-3 py-2 leading-none hover:opacity-90">
                <Icon name="plus" className="h-4 w-4 shrink-0 stroke-[1.5px]" />
                <span>New</span>
              </button>
            </div>
          </div>
        </header>
      </div>

      {/* ── Event Type List ──────────────────────────────────── */}
      <div className="bg-default border-subtle flex flex-col rounded-md border">
        <ul className="divide-subtle w-full divide-y" data-testid="event-types">
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
            <li className="flex flex-col items-center justify-center py-20">
              <Icon name="link" className="text-subtle h-10 w-10 mb-4" />
              <h3 className="text-emphasis text-lg font-semibold">
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
