import React, { useState, useEffect, useCallback, useRef } from "react";
import { Icon } from "./Icon";
import { Skeleton } from "./Skeleton";
import { apiData } from "../api/client.js";

const TAB_OPTIONS = [
  { value: "upcoming", label: "Upcoming", apiTab: "upcoming" },
  { value: "unconfirmed", label: "Unconfirmed", apiTab: "unconfirmed" },
  { value: "recurring", label: "Recurring", apiTab: "upcoming" },
  { value: "past", label: "Past", apiTab: "past" },
  { value: "canceled", label: "Canceled", apiTab: "cancelled" },
];

function mapBookingRow(b, hostUsername) {
  const start = new Date(b.startAt);
  const end = new Date(b.endAt);
  const et = b.eventTypeId && typeof b.eventTypeId === "object" ? b.eventTypeId : {};
  const tf = (d) =>
    d.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  return {
    id: b._id,
    eventTypeId: et._id ? String(et._id) : "",
    eventSlug: et.slug ? String(et.slug) : "",
    hostUsername: hostUsername || "",
    title: et.title || "Meeting",
    guest: b.bookerName || "Guest",
    dateLabel: start.toLocaleDateString("en-GB", {
      weekday: "short",
      day: "numeric",
      month: "short",
    }),
    timeLabel: `${tf(start)} - ${tf(end)}`.replace(" - ", " - "),
    linkLabel: "Join Cal Video",
    linkHref:
      et.slug && hostUsername
        ? `${window.location.origin}/book/${encodeURIComponent(hostUsername)}/${encodeURIComponent(et.slug)}`
        : "",
  };
}

export function BookingsPage({ onNavigate }) {
  const [activeTab, setActiveTab] = useState("upcoming");
  const [isLoading, setIsLoading] = useState(true);
  const [bookings, setBookings] = useState([]);
  const [toast, setToast] = useState(null);
  const [menuOpenId, setMenuOpenId] = useState(null);
  const menuRef = useRef(null);

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const tabCfg = TAB_OPTIONS.find((t) => t.value === activeTab) || TAB_OPTIONS[0];
      const [me, rows] = await Promise.all([
        apiData("/api/v1/users/current-user"),
        apiData(`/api/v1/bookings?tab=${tabCfg.apiTab}`),
      ]);
      const mapped = (rows || []).map((r) => mapBookingRow(r, me?.username || ""));
      setBookings(activeTab === "recurring" ? [] : mapped);
    } catch (e) {
      setBookings([]);
      showToast(e.message || "Failed to load bookings");
    } finally {
      setIsLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!menuOpenId) return;
    const onPointerDown = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpenId(null);
      }
    };
    document.addEventListener("pointerdown", onPointerDown, true);
    return () => document.removeEventListener("pointerdown", onPointerDown, true);
  }, [menuOpenId]);

  const handleMenuAction = async (booking, action) => {
    setMenuOpenId(null);
    try {
      if (action === "edit-event") {
        if (booking.eventTypeId) {
          window.history.pushState(
            {},
            "",
            `/event-types/${booking.eventTypeId}?title=${encodeURIComponent(booking.title)}`
          );
          window.dispatchEvent(new PopStateEvent("popstate"));
        } else {
          showToast("Event details are unavailable for this booking");
        }
      } else if (action === "reschedule") {
        if (!booking.hostUsername || !booking.eventSlug) {
          showToast("Missing booking route info for reschedule");
          return;
        }
        const payload = await apiData(`/api/v1/bookings/${booking.id}/manage-token`, {
          method: "POST",
        });
        const token = payload?.token;
        if (!token) {
          showToast("Could not open reschedule flow");
          return;
        }
        const path = `/book/${encodeURIComponent(
          booking.hostUsername
        )}/${encodeURIComponent(
          booking.eventSlug
        )}?reschedule=1&bookingId=${encodeURIComponent(
          booking.id
        )}&token=${encodeURIComponent(token)}`;
        if (typeof onNavigate === "function") {
          onNavigate(path);
        } else {
          window.history.pushState({}, "", path);
          window.dispatchEvent(new PopStateEvent("popstate"));
        }
      } else if (action === "edit-location") {
        showToast("Edit location from the booking page flow.");
      } else if (action === "add-guests") {
        showToast("Additional guests can be added when booking.");
      } else if (action === "view-recordings") {
        showToast("Recordings are not available in this build.");
      } else if (action === "view-session") {
        showToast("Session details are not available in this build.");
      } else if (action === "mark-no-show") {
        showToast("No-show tracking is not available in this build.");
      } else if (action === "report-booking") {
        showToast("Thanks. Booking reported.");
      } else if (action === "cancel-event") {
        if (!window.confirm("Cancel this booking?")) return;
        await apiData(`/api/v1/bookings/${booking.id}/cancel`, {
          method: "POST",
          json: { cancellationReason: "Cancelled from bookings menu" },
        });
        showToast("Cancelled");
        await load();
      }
    } catch (e) {
      showToast(e.message || "Action failed");
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 space-y-5 animate-pulse">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-10 w-[460px] max-w-full rounded-lg" />
        <Skeleton className="h-[220px] w-full rounded-xl" />
      </div>
    );
  }

  return (
    <div className="flex-1">
      <header className="mb-5">
        <h1 className="font-cal text-2xl font-bold text-emphasis">Bookings</h1>
        <p className="mt-1 text-sm text-subtle">
          See upcoming and past events booked through your event type links.
        </p>
      </header>

      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex items-center rounded-lg border border-subtle bg-subtle/20 p-0.5">
            {TAB_OPTIONS.map((tab) => (
              <button
                key={tab.value}
                type="button"
                onClick={() => setActiveTab(tab.value)}
                className={`rounded-md px-3 py-1.5 text-sm font-medium transition ${
                  activeTab === tab.value
                    ? "bg-default text-emphasis"
                    : "text-subtle hover:text-emphasis"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-lg border border-subtle px-3 py-2 text-sm text-emphasis hover:bg-subtle/30"
          >
            <Icon name="list-filter" className="h-4 w-4" />
            Filter
          </button>
        </div>

        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-lg border border-subtle px-3 py-2 text-sm text-subtle hover:text-emphasis"
        >
          <Icon name="list-filter" className="h-4 w-4" />
          Saved filters
          <Icon name="chevron-down" className="h-3.5 w-3.5" />
        </button>
      </div>

      <section className="overflow-visible rounded-xl border border-subtle bg-default">
        <div className="border-b border-subtle px-5 py-3 text-xs font-bold uppercase tracking-wide text-subtle">
          Today
        </div>

        {bookings.length ? (
          bookings.map((b) => (
            <div
              key={b.id}
              className="relative flex items-start justify-between gap-4 border-b border-subtle px-5 py-6 last:border-b-0"
            >
              <div className="w-[150px] shrink-0 text-sm text-emphasis">
                <p className="font-medium">{b.dateLabel}</p>
                <p className="mt-1 text-subtle">{b.timeLabel}</p>
                <a
                  href={b.linkHref || "#"}
                  className="mt-1 inline-flex items-center gap-1 text-blue-400 hover:underline"
                >
                  <Icon name="video" className="h-3.5 w-3.5" />
                  {b.linkLabel}
                </a>
              </div>

              <div className="min-w-0 flex-1 text-sm">
                <p className="font-semibold text-emphasis">
                  {b.title} between {b.guest} and {b.guest}
                </p>
                <p className="mt-1 text-subtle">You and Priyanshu</p>
              </div>

              <div className="relative">
                <button
                  type="button"
                  className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-subtle text-subtle hover:bg-subtle/40"
                  title="Booking actions"
                  onClick={() =>
                    setMenuOpenId((prev) => (prev === b.id ? null : b.id))
                  }
                >
                  <Icon name="ellipsis" className="h-4 w-4" />
                </button>

                {menuOpenId === b.id ? (
                  <div
                    ref={menuRef}
                    className="absolute right-0 top-full mt-2 z-50 w-[260px] overflow-hidden rounded-2xl border border-subtle bg-default shadow-2xl"
                  >
                  <button onClick={() => void handleMenuAction(b, "edit-event")} className="flex w-full items-center gap-3 px-4 py-3 text-left text-emphasis hover:bg-subtle/30">
                    <Icon name="pencil" className="h-4 w-4 text-subtle" />
                    Edit event
                  </button>
                  <button onClick={() => void handleMenuAction(b, "reschedule")} className="flex w-full items-center gap-3 px-4 py-3 text-left text-emphasis hover:bg-subtle/30">
                    <Icon name="refresh-cw" className="h-4 w-4 text-subtle" />
                    Reschedule booking
                  </button>
                  <button onClick={() => void handleMenuAction(b, "edit-location")} className="flex w-full items-center gap-3 px-4 py-3 text-left text-emphasis hover:bg-subtle/30">
                    <Icon name="globe" className="h-4 w-4 text-subtle" />
                    Edit location
                  </button>
                  <button onClick={() => void handleMenuAction(b, "add-guests")} className="flex w-full items-center gap-3 px-4 py-3 text-left text-emphasis hover:bg-subtle/30">
                    <Icon name="users" className="h-4 w-4 text-subtle" />
                    Add guests
                  </button>
                  <div className="border-t border-subtle px-4 py-2 text-xs font-semibold uppercase tracking-wide text-subtle">
                    After event
                  </div>
                  <button onClick={() => void handleMenuAction(b, "view-recordings")} className="flex w-full items-center gap-3 px-4 py-3 text-left text-subtle hover:bg-subtle/30">
                    <Icon name="video" className="h-4 w-4 text-subtle" />
                    View recordings
                  </button>
                  <button onClick={() => void handleMenuAction(b, "view-session")} className="flex w-full items-center gap-3 px-4 py-3 text-left text-subtle hover:bg-subtle/30">
                    <Icon name="info" className="h-4 w-4 text-subtle" />
                    View session details
                  </button>
                  <button onClick={() => void handleMenuAction(b, "mark-no-show")} className="flex w-full items-center gap-3 px-4 py-3 text-left text-subtle hover:bg-subtle/30">
                    <Icon name="calendar-off" className="h-4 w-4 text-subtle" />
                    Mark as no-show
                  </button>
                  <div className="border-t border-subtle" />
                  <button onClick={() => void handleMenuAction(b, "report-booking")} className="flex w-full items-center gap-3 px-4 py-3 text-left text-emphasis hover:bg-subtle/30">
                    <Icon name="message-square" className="h-4 w-4 text-subtle" />
                    Report booking
                  </button>
                  <div className="border-t border-subtle" />
                  <button onClick={() => void handleMenuAction(b, "cancel-event")} className="flex w-full items-center gap-3 px-4 py-3 text-left text-emphasis hover:bg-subtle/30">
                    <Icon name="trash" className="h-4 w-4 text-subtle" />
                    Cancel event
                  </button>
                  </div>
                ) : null}
              </div>
            </div>
          ))
        ) : (
          <div className="px-5 py-16 text-center text-sm text-subtle">
            No bookings for this tab.
          </div>
        )}

        <div className="flex items-center justify-between bg-subtle/20 px-5 py-2.5 text-sm text-subtle">
          <div className="inline-flex items-center gap-2">
            <select className="rounded-md border border-subtle bg-default px-2 py-1 text-sm text-emphasis outline-none">
              <option>10</option>
              <option>25</option>
              <option>50</option>
            </select>
            rows per page
          </div>
          <div className="inline-flex items-center gap-2">
            <span>1-1 of {bookings.length}</span>
            <button className="inline-flex h-6 w-6 items-center justify-center rounded border border-subtle opacity-50" type="button">
              <Icon name="chevron-left" className="h-3 w-3" />
            </button>
            <button className="inline-flex h-6 w-6 items-center justify-center rounded border border-subtle opacity-50" type="button">
              <Icon name="chevron-right" className="h-3 w-3" />
            </button>
          </div>
        </div>
      </section>

      {toast ? (
        <div className="fixed bottom-6 left-1/2 z-[200] -translate-x-1/2 rounded-lg bg-emphasis px-4 py-2 text-sm font-semibold text-inverted shadow-2xl">
          {toast}
        </div>
      ) : null}
    </div>
  );
}
