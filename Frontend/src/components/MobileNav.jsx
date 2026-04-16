import React from 'react';
import { Icon } from './Icon';

export function MobileTopBar({ onNavigate }) {
  return (
    <header className="flex md:hidden items-center justify-between px-4 py-3 bg-default border-b border-subtle sticky top-0 z-[100]">
      <button
        type="button"
        onClick={() => onNavigate("/event-types")}
        className="flex items-center gap-2 rounded-lg p-0.5 -m-0.5 hover:bg-subtle/60 transition-colors text-left"
        aria-label="Go to event types"
      >
        <img
          src="/app-icons/cal-com-icon.svg"
          alt=""
          width={32}
          height={32}
          className="h-8 w-8 shrink-0"
          decoding="async"
          aria-hidden
        />
        <span className="font-cal font-bold text-lg text-emphasis">Cal.com</span>
      </button>
      
      <button 
        onClick={() => onNavigate('/settings/my-account/profile')}
        className="w-8 h-8 rounded-full border border-subtle overflow-hidden"
      >
        <img src="https://ui-avatars.com/api/?name=Priyanshu&background=262626&color=fff" alt="avatar" />
      </button>
    </header>
  );
}

export function MobileBottomNav({ activePath, onNavigate }) {
  const items = [
    { label: "Events", icon: "link", href: "/event-types" },
    { label: "Bookings", icon: "calendar", href: "/bookings" },
    { label: "Availability", icon: "clock", href: "/availability" },
    { label: "Settings", icon: "settings", href: "/settings" },
  ];

  return (
    <nav className="flex md:hidden items-center justify-around bg-default border-t border-subtle fixed bottom-0 left-0 right-0 h-16 px-2 z-[100] safe-area-bottom">
      {items.map((item) => {
        const isActive = activePath.startsWith(item.href);
        return (
          <button
            key={item.href}
            onClick={() => onNavigate(item.href)}
            className={`flex flex-col items-center gap-1 flex-1 transition-colors ${
              isActive ? "text-emphasis" : "text-subtle hover:text-emphasis"
            }`}
          >
            <Icon name={item.icon} className={`h-5 w-5 ${isActive ? "text-emphasis" : "text-subtle"}`} />
            <span className="text-[10px] font-semibold">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
