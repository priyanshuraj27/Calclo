import React, { useState } from "react";
import { Icon } from "./Icon";

const FEATURED_CATEGORIES = [
  { name: "Conferencing", count: 27, icon: "conferencing.svg" },
  { name: "Automation", count: 22, icon: "automation.svg" },
  { name: "Analytics", count: 11, icon: "analytics.svg" },
  { name: "Other", count: 11, icon: "other.svg" },
  { name: "Calendar", count: 10, icon: "calendar.svg" },
];

const MOCK_APPS = [
  {
    name: "Google Calendar",
    description: "Google Calendar is a time management and scheduling service developed by Google. Allows users to create and edit events, with options available for type and...",
    logo: "/app-icons/google-calendar.svg",
  },
  {
    name: "Google Meet",
    description: "Google Meet is Google's web-based video conferencing platform, designed to compete with major conferencing platforms.",
    logo: "/app-icons/google-meet.svg",
  },
  {
    name: "Zoom Video",
    description: "Zoom is a secure and reliable video platform that supports all of your online communication needs. It can provide everything from one on one meetings, chat,...",
    logo: "/app-icons/zoom.svg",
  }
];

export function AppsPage() {
  return (
    <div className="flex-1 w-full max-w-full">
      {/* ── Shell Header ───────────────────────────────────── */}
      <div className="flex items-center md:mb-6 md:mt-0 lg:mb-8">
        <header className="flex w-full max-w-full flex-col md:flex-row md:items-center justify-between">
          <div className="min-w-0 flex-1 ltr:mr-4 rtl:ml-4">
            <h3 className="font-cal text-emphasis inline truncate text-lg font-semibold tracking-wide sm:text-xl xl:max-w-full">
              App store
            </h3>
            <p className="text-default hidden text-sm md:block mt-1">
              Connecting people, technology and the workplace.
            </p>
          </div>
          <div className="flex w-full flex-col pt-4 md:flex-row md:justify-between md:pt-0 lg:w-auto relative">
            <div className="relative flex items-center h-9 mt-1 rounded-md border border-default bg-default px-3 py-2 focus-within:ring-2 focus-within:ring-brand focus-within:border-brand overflow-hidden transition w-64 lg:w-80">
              <Icon name="search" className="h-4 w-4 text-subtle mr-2 flex-shrink-0" />
              <input 
                type="search" 
                placeholder="Search" 
                className="bg-transparent border-none p-0 text-sm w-full text-default placeholder-subtle outline-none focus:outline-none focus:ring-0" 
              />
            </div>
          </div>
        </header>
      </div>

      <div className="flex flex-col gap-y-12">
        {/* Featured Categories */}
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-emphasis text-base font-semibold leading-none">Featured categories</h2>
            <div className="flex gap-2">
              <button className="text-subtle hover:text-emphasis transition"><Icon name="chevron-left" className="h-4 w-4" /></button>
              <button className="text-subtle hover:text-emphasis transition"><Icon name="chevron-right" className="h-4 w-4" /></button>
            </div>
          </div>
          <div className="flex gap-4 overflow-hidden">
            {FEATURED_CATEGORIES.map(cat => (
              <div 
                key={cat.name} 
                className="flex-shrink-0 w-64 relative flex flex-col rounded-[14px] bg-muted overflow-hidden border border-subtle transition hover:bg-subtle cursor-pointer"
              >
                <div className="w-full relative px-6 py-5 flex flex-col justify-end bg-gradient-to-tr from-transparent to-muted/50 h-44">
                  <div className="absolute top-4 left-0 w-full flex justify-center opacity-80 dark:mix-blend-screen scale-110">
                    <img 
                      src={`https://cal.com/app-categories/${cat.icon}`} 
                      alt={cat.name} 
                      className="w-24 h-24 dark:invert opacity-90 dark:mix-blend-plus-lighter"
                      onError={(e) => { e.currentTarget.style.display = 'none'; }}
                    />
                  </div>
                  <div className="relative z-10 mt-auto">
                    <h3 className="text-emphasis text-sm font-semibold capitalize">{cat.name}</h3>
                    <p className="text-subtle pt-1.5 text-[13px] font-medium flex items-center gap-1">
                      {cat.count} apps <Icon name="arrow-right" className="h-3 w-3" />
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Most Popular */}
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-emphasis text-base font-semibold leading-none">Most popular</h2>
            <div className="flex gap-2">
              <button className="text-subtle hover:text-emphasis transition"><Icon name="chevron-left" className="h-4 w-4" /></button>
              <button className="text-subtle hover:text-emphasis transition"><Icon name="chevron-right" className="h-4 w-4" /></button>
            </div>
          </div>
          <div className="grid gap-4 lg:grid-cols-3 md:grid-cols-2 grid-cols-1">
            {MOCK_APPS.map((app) => (
              <div key={app.name} className="border-subtle relative flex h-[240px] flex-col rounded-xl border p-5 bg-default transition-colors hover:bg-muted/50">
                <div className="flex">
                  <img
                    src={app.logo}
                    alt={`${app.name} Logo`}
                    className="mb-4 h-11 w-11 rounded-md bg-muted/20"
                  />
                </div>
                <div className="flex items-center">
                  <h3 className="text-emphasis font-semibold text-[15px]">{app.name}</h3>
                </div>
                <p className="text-subtle mt-2 flex-grow text-sm line-clamp-3 leading-snug">
                  {app.description}
                </p>

                <div className="mt-auto pt-4 flex max-w-full flex-row justify-between gap-2">
                  <button className="btn-secondary flex w-full justify-center">
                    Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Recently Added (Placeholder exactly like popular) */}
        <section className="pb-16">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-emphasis text-base font-semibold leading-none">Recently added</h2>
            <div className="flex gap-2">
              <button className="text-subtle hover:text-emphasis transition"><Icon name="chevron-left" className="h-4 w-4" /></button>
              <button className="text-subtle hover:text-emphasis transition"><Icon name="chevron-right" className="h-4 w-4" /></button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
