import React, { useState, useEffect, useCallback } from "react";
import { Icon } from "./Icon";
import { ThemeToggle } from "./ThemeToggle";
import { apiData } from "../api/client.js";

/** Phone (max-width 767px): Settings is inside More. Tablet: Settings in the bottom bar. */
function useSettingsInMoreMenu() {
  const [narrow, setNarrow] = useState(() =>
    typeof window !== "undefined"
      ? window.matchMedia("(max-width: 767px)").matches
      : true
  );
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const onChange = () => setNarrow(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);
  return narrow;
}

function moreMenuContainsPath(pathname, settingsInMore) {
  if (pathname.startsWith("/teams")) return true;
  if (pathname.startsWith("/apps")) return true;
  if (pathname.startsWith("/routing")) return true;
  if (pathname.startsWith("/workflows")) return true;
  if (pathname.startsWith("/insights")) return true;
  if (pathname.startsWith("/refer")) return true;
  if (settingsInMore && pathname.startsWith("/settings")) return true;
  return false;
}

function publicProfileUrl(username) {
  const base = (
    import.meta.env.VITE_PUBLIC_APP_URL ||
    import.meta.env.VITE_PUBLIC_BOOKING_BASE_URL ||
    ""
  ).replace(/\/$/, "");
  if (!base || !username) return null;
  return `${base}/${encodeURIComponent(username)}`;
}

function MoreMenuSheet({ open, onClose, onNavigate, settingsInMore }) {
  const [hostSlug, setHostSlug] = useState(
    import.meta.env.VITE_DEFAULT_HOST_USERNAME || "priyanshu"
  );

  useEffect(() => {
    if (!open) return;
    apiData("/api/v1/users/current-user")
      .then((u) => {
        if (u?.username) setHostSlug(u.username);
      })
      .catch(() => {});
  }, [open]);

  const go = useCallback(
    (path) => {
      onNavigate(path);
      onClose();
    },
    [onNavigate, onClose]
  );

  const profileUrl = publicProfileUrl(hostSlug);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[140] lg:hidden" role="dialog" aria-modal="true" aria-label="More navigation">
      <button
        type="button"
        className="absolute inset-0 bg-black/50 backdrop-blur-[2px]"
        aria-label="Close menu"
        onClick={onClose}
      />
      <div
        className="absolute bottom-0 left-0 right-0 max-h-[min(85vh,640px)] flex flex-col rounded-t-2xl border border-subtle border-b-0 bg-default shadow-2xl animate-in slide-in-from-bottom-4 duration-200"
        style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
      >
        <div className="flex items-center justify-between border-b border-subtle px-4 py-3 shrink-0">
          <p className="text-sm font-bold text-emphasis">More</p>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-subtle hover:bg-subtle hover:text-emphasis"
            aria-label="Close"
          >
            <Icon name="x" className="h-5 w-5" />
          </button>
        </div>
        <div className="overflow-y-auto flex-1 px-2 py-3 space-y-1">
          <p className="px-3 pb-1 text-[11px] font-bold uppercase tracking-wide text-muted">
            Main app
          </p>
          <SheetRow icon="users" label="Teams" onClick={() => go("/teams")} />
          <SheetRow icon="grid-3x3" label="App store" onClick={() => go("/apps")} />
          <SheetRow icon="grid-3x3" label="Installed apps" onClick={() => go("/apps/installed")} />
          <SheetRow icon="git-merge" label="Routing forms" onClick={() => go("/routing")} />
          <SheetRow icon="split" label="Workflows" onClick={() => go("/workflows")} />
          <p className="px-3 pt-3 pb-1 text-[11px] font-bold uppercase tracking-wide text-muted">
            Insights
          </p>
          <SheetRow icon="chart-bar" label="Overview" onClick={() => go("/insights")} />
          <SheetRow icon="chart-bar" label="Routing" onClick={() => go("/insights/routing")} />
          <SheetRow icon="chart-bar" label="Router position" onClick={() => go("/insights/router-position")} />
          <SheetRow icon="chart-bar" label="Call history" onClick={() => go("/insights/call-history")} />
          <SheetRow icon="chart-bar" label="Wrong routing" onClick={() => go("/insights/wrong-routing")} />
          <p className="px-3 pt-3 pb-1 text-[11px] font-bold uppercase tracking-wide text-muted">
            Other
          </p>
          <SheetRow icon="gift" label="Refer and earn" onClick={() => go("/refer")} />
          {settingsInMore ? (
            <SheetRow
              icon="settings"
              label="Settings"
              onClick={() => go("/settings/my-account/profile")}
            />
          ) : null}
          <p className="px-3 pt-3 pb-1 text-[11px] font-bold uppercase tracking-wide text-muted">
            Public page
          </p>
          <SheetRow
            icon="external-link"
            label="View public page"
            onClick={() => {
              if (profileUrl) window.open(profileUrl, "_blank", "noopener,noreferrer");
              onClose();
            }}
          />
          <SheetRow
            icon="copy"
            label="Copy public page link"
            onClick={() => {
              if (profileUrl) {
                navigator.clipboard?.writeText(profileUrl).catch(() => {});
              }
              onClose();
            }}
          />
        </div>
        <div className="border-t border-subtle px-2 py-1 shrink-0 bg-muted/20">
          <ThemeToggle />
        </div>
      </div>
    </div>
  );
}

function SheetRow({ icon, label, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-emphasis hover:bg-subtle/80 transition-colors"
    >
      <Icon name={icon} className="h-4 w-4 text-subtle shrink-0" />
      <span className="min-w-0">{label}</span>
    </button>
  );
}

export function MobileTopBar({ onNavigate }) {
  return (
    <header className="flex lg:hidden items-center justify-between px-4 py-3 bg-default border-b border-subtle sticky top-0 z-[100]">
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
        type="button"
        onClick={() => onNavigate("/settings/my-account/profile")}
        className="w-8 h-8 rounded-full border border-subtle overflow-hidden shrink-0"
        aria-label="Open settings"
      >
        <img
          src="https://ui-avatars.com/api/?name=Priyanshu&background=262626&color=fff"
          alt=""
        />
      </button>
    </header>
  );
}

export function MobileBottomNav({ activePath, onNavigate }) {
  const [moreOpen, setMoreOpen] = useState(false);
  const settingsInMore = useSettingsInMoreMenu();

  useEffect(() => {
    if (moreOpen) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [moreOpen]);

  useEffect(() => {
    if (!moreOpen) return;
    const onKey = (e) => {
      if (e.key === "Escape") setMoreOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [moreOpen]);

  const coreItems = [
    { label: "Events", icon: "link", href: "/event-types" },
    { label: "Bookings", icon: "calendar", href: "/bookings" },
    { label: "Availability", icon: "clock", href: "/availability" },
  ];

  const moreActive = moreMenuContainsPath(activePath, settingsInMore);

  return (
    <>
      <nav className="flex lg:hidden items-stretch bg-default border-t border-subtle fixed bottom-0 left-0 right-0 h-16 z-[100] safe-area-bottom px-1">
        {coreItems.map((item) => {
          const isActive = activePath.startsWith(item.href);
          return (
            <button
              key={item.href}
              type="button"
              onClick={() => onNavigate(item.href)}
              className={`flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 px-0.5 transition-colors ${
                isActive ? "text-emphasis" : "text-subtle hover:text-emphasis"
              }`}
            >
              <Icon name={item.icon} className={`h-5 w-5 shrink-0 ${isActive ? "text-emphasis" : "text-subtle"}`} />
              <span className="text-[9px] sm:text-[10px] font-semibold text-center leading-tight line-clamp-2 max-w-full">
                {item.label}
              </span>
            </button>
          );
        })}

        <button
          type="button"
          onClick={() => onNavigate("/settings/my-account/profile")}
          className={`hidden md:flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 px-0.5 transition-colors ${
            activePath.startsWith("/settings")
              ? "text-emphasis"
              : "text-subtle hover:text-emphasis"
          }`}
        >
          <Icon
            name="settings"
            className={`h-5 w-5 shrink-0 ${activePath.startsWith("/settings") ? "text-emphasis" : "text-subtle"}`}
          />
          <span className="text-[9px] sm:text-[10px] font-semibold text-center leading-tight">Settings</span>
        </button>

        <button
          type="button"
          onClick={() => setMoreOpen(true)}
          className={`flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 px-0.5 transition-colors ${
            moreActive ? "text-emphasis" : "text-subtle hover:text-emphasis"
          }`}
          aria-expanded={moreOpen}
        >
          <Icon name="ellipsis" className={`h-5 w-5 shrink-0 ${moreActive ? "text-emphasis" : "text-subtle"}`} />
          <span className="text-[9px] sm:text-[10px] font-semibold text-center leading-tight">More</span>
        </button>
      </nav>

      <MoreMenuSheet
        open={moreOpen}
        onClose={() => setMoreOpen(false)}
        onNavigate={onNavigate}
        settingsInMore={settingsInMore}
      />
    </>
  );
}
