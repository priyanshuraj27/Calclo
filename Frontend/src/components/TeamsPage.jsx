import React from "react";
import { Icon } from "./Icon";

const FEATURES = [
  "Route inbound requests to the right person",
  "Distribute meetings fairly with round-robin",
  "See what's getting booked (and what's not)",
  "Remove Cal.com branding",
];

export function TeamsPage() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center bg-subtle px-3 py-8 sm:px-6 lg:p-0">
      <div className="flex h-auto w-full max-w-4xl flex-col gap-4 overflow-hidden rounded-2xl border border-subtle bg-default p-4 shadow-sm sm:rounded-3xl sm:p-5 md:flex-row md:gap-2 md:py-8 md:pl-8 md:pr-0">
          
          {/* Left Content */}
          <div className="flex flex-1 flex-col justify-between overflow-hidden">
            <div className="md:overflow-visible">
              <div>
                <span className="inline-flex items-center rounded-md border border-subtle px-2 py-1 text-xs font-semibold text-default bg-subtle">
                  Teams
                </span>
              </div>
              <h2 className="mt-4 font-cal font-semibold text-emphasis text-xl sm:text-2xl leading-none">
                Use Cal with your team
              </h2>
              <p className="mt-3 text-subtle text-sm leading-normal">
                Turn individual scheduling into a system that assigns, distributes, and manages meetings for our team.
              </p>

              {/* Features List */}
              <ul className="mt-5 hidden space-y-2.5 sm:block">
                {FEATURES.map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-sm text-subtle">
                    <span className="text-subtle text-lg leading-none mt-[-2px]">•</span>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-6 md:mt-8">
              <div className="hidden md:flex items-center gap-2 mb-4">
                <p className="text-sm font-medium text-subtle">Available on</p>
                <div className="inline-flex items-center rounded-md px-1.5 py-0.5 text-xs font-medium bg-orange-100 text-orange-800 dark:bg-orange-400/20 dark:text-orange-300">
                  Teams
                </div>
                <div className="inline-flex items-center rounded-md px-1.5 py-0.5 text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-400/20 dark:text-purple-300">
                  Orgs
                </div>
              </div>
              <div className="mt-4 h-px w-full border border-t-subtle border-dashed" />
              
              {/* Buttons */}
              <div className="mt-6 flex items-center justify-between md:justify-start gap-4">
                <button
                  type="button"
                  className="bg-brand text-brand-contrast hover:bg-brand-emphasis inline-flex items-center justify-center rounded-md px-4 py-2.5 text-sm font-medium transition"
                >
                  Try it for free
                  <Icon name="arrow-right" className="ml-2 h-4 w-4" />
                </button>
                <button
                  type="button"
                  className="inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition text-subtle hover:bg-subtle hover:text-emphasis"
                >
                  Learn more
                </button>
              </div>
            </div>
          </div>

          {/* Right Content - Image */}
          <div className="-my-2 hidden md:flex flex-1 items-center justify-center rounded-l-xl bg-subtle aspect-[3/4] overflow-hidden border border-subtle border-r-0 relative">
            <img
              src="https://cal.com/upgrade/full_teams.png"
              alt="Teams graphic"
              className="h-full w-full object-cover object-top"
            />
          </div>
        </div>
      </div>
  );
}
