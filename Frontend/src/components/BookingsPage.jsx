import React, { useState, useEffect, useCallback } from "react";
import { Icon } from "./Icon";
import { Skeleton } from "./Skeleton";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import { apiData } from "../api/client.js";
import { mergeAllowedDurations } from "../utils/eventTypeDuration.js";

const TAB_OPTIONS = [
  { value: "upcoming", label: "Upcoming" },
  { value: "unconfirmed", label: "Unconfirmed" },
  { value: "past", label: "Past" },
  { value: "cancelled", label: "Cancelled" },
];

function toDatetimeLocalValue(isoOrDate) {
  const d = new Date(isoOrDate);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function mapBookingRow(b) {
  const start = new Date(b.startAt);
  const end = new Date(b.endAt);
  const et =
    typeof b.eventTypeId === "object" && b.eventTypeId ? b.eventTypeId : {};
  const baseDm = Number(et.durationMinutes) || 15;
  const allowedDurations = mergeAllowedDurations(
    baseDm,
    Array.isArray(et.durationOptions) ? et.durationOptions : []
  );
  const title = et.title || "Meeting";
  const durationMinutes = Math.max(
    1,
    Math.round((end.getTime() - start.getTime()) / 60000)
  );
  const durationSelectOptions = [...new Set([...allowedDurations, durationMinutes])].sort(
    (a, b) => a - b
  );
  const tf = (d) =>
    d
      .toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      })
      .toLowerCase();
  return {
    id: b._id,
    title,
    user: b.bookerName,
    email: b.bookerEmail,
    month: start.toLocaleString("en-US", { month: "short" }),
    date: String(start.getDate()),
    day: start.toLocaleString("en-US", { weekday: "short" }),
    time: `${tf(start)} - ${tf(end)}`,
    durationMinutes,
    startAtIso: start.toISOString(),
    durationSelectOptions,
    statusRaw: b.status,
  };
}

export function BookingsPage() {
  const [activeTab, setActiveTab] = useState("upcoming");
  const [isLoading, setIsLoading] = useState(true);
  const [bookings, setBookings] = useState([]);
  const [toast, setToast] = useState(null);
  const [parent] = useAutoAnimate();
  const [rescheduleOpen, setRescheduleOpen] = useState(null);
  const [rescheduleFormStart, setRescheduleFormStart] = useState("");
  const [rescheduleBusy, setRescheduleBusy] = useState(false);
  const [durationDraft, setDurationDraft] = useState({});
  const [durationBusyId, setDurationBusyId] = useState(null);

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const rows = await apiData(`/api/v1/bookings?tab=${activeTab}`);
      setBookings((rows || []).map(mapBookingRow));
      setDurationDraft({});
    } catch (e) {
      showToast(e.message || "Failed to load bookings");
      setBookings([]);
    } finally {
      setIsLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    load();
  }, [load]);

  const filteredBookings = bookings;

  const badgeFor = (row) => {
    const s = (row.statusRaw || "").toUpperCase();
    if (s === "TENTATIVE")
      return {
        label: "Unconfirmed",
        className:
          "px-1.5 py-0.5 rounded-md bg-amber-500/10 text-amber-500 text-[10px] font-bold uppercase tracking-wider",
      };
    if (s === "CANCELLED")
      return {
        label: "Cancelled",
        className:
          "px-1.5 py-0.5 rounded-md bg-red-500/10 text-red-500 text-[10px] font-bold uppercase tracking-wider",
      };
    return {
      label: "Confirmed",
      className:
        "px-1.5 py-0.5 rounded-md bg-green-500/10 text-green-500 text-[10px] font-bold uppercase tracking-wider",
    };
  };

  const openReschedule = (booking) => {
    setRescheduleFormStart(toDatetimeLocalValue(booking.startAtIso));
    setRescheduleOpen(booking);
  };

  const submitReschedule = async () => {
    if (!rescheduleOpen) return;
    const start = new Date(rescheduleFormStart);
    if (Number.isNaN(start.getTime())) {
      showToast("Enter a valid start date and time");
      return;
    }
    setRescheduleBusy(true);
    try {
      await apiData(`/api/v1/bookings/${rescheduleOpen.id}/reschedule`, {
        method: "POST",
        json: { newStartAt: start.toISOString() },
      });
      showToast("Rescheduled");
      setRescheduleOpen(null);
      await load();
    } catch (e) {
      showToast(e.message || "Reschedule failed");
    } finally {
      setRescheduleBusy(false);
    }
  };

  const isCancelled = (row) =>
    (row.statusRaw || "").toUpperCase() === "CANCELLED";

  const updateDurationForBooking = async (booking) => {
    const next = durationDraft[booking.id] ?? booking.durationMinutes;
    if (next === booking.durationMinutes) {
      showToast("Already at this duration");
      return;
    }
    setDurationBusyId(booking.id);
    try {
      await apiData(`/api/v1/bookings/${booking.id}`, {
        method: "PATCH",
        json: { durationMinutes: next },
      });
      showToast("Duration updated");
      await load();
    } catch (e) {
      showToast(e.message || "Update failed");
    } finally {
      setDurationBusyId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 space-y-6">
        <div className="flex flex-col gap-2">
           <Skeleton className="h-8 w-48" />
           <Skeleton className="h-4 w-72" />
        </div>
        <div className="flex gap-2">
           <Skeleton className="h-10 w-64 rounded-xl" />
           <Skeleton className="h-10 w-24 rounded-xl" />
        </div>
        <div className="border border-subtle rounded-xl divide-y divide-subtle overflow-hidden">
           {[1, 2].map(i => (
             <div key={i} className="p-6 flex items-center justify-between">
                <div className="flex items-center gap-6">
                   <div className="flex flex-col items-center gap-1">
                      <Skeleton className="h-4 w-8" />
                      <Skeleton className="h-6 w-10" />
                   </div>
                   <div className="h-12 w-[1px] bg-subtle" />
                   <div className="space-y-2">
                      <Skeleton className="h-4 w-40" />
                      <Skeleton className="h-3 w-60" />
                   </div>
                </div>
                <Skeleton className="h-9 w-28 rounded-lg" />
             </div>
           ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 lg:pr-6 animate-in fade-in duration-500">
      <header className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-2 sm:px-0">
        <div>
          <h1 className="font-cal text-2xl font-bold text-emphasis">Bookings</h1>
          <p className="text-sm text-subtle">See upcoming and past events booked through your links.</p>
        </div>
      </header>

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-6 px-2 sm:px-0">
        <div className="bg-subtle p-0.5 rounded-lg flex items-center">
           {TAB_OPTIONS.map(tab => (
             <button
               key={tab.value}
               onClick={() => setActiveTab(tab.value)}
               className={`px-4 py-1.5 text-sm font-semibold rounded-md transition-all ${
                 activeTab === tab.value 
                   ? "bg-default text-emphasis shadow-sm" 
                   : "text-subtle hover:text-emphasis"
               }`}
             >
               {tab.label}
             </button>
           ))}
        </div>
        <div className="flex items-center gap-2">
           <button className="flex items-center gap-2 px-3 py-1.5 border border-subtle rounded-lg text-sm font-semibold text-emphasis hover:bg-subtle transition">
              <Icon name="list-filter" className="h-4 w-4" />
              <span>Filter</span>
           </button>
        </div>
      </div>

      <div ref={parent} className="space-y-4">
        {filteredBookings.length > 0 ? (
          <div className="bg-default border border-subtle rounded-xl overflow-hidden divide-y divide-subtle shadow-sm">
            {filteredBookings.map(booking => {
              const badge = badgeFor(booking);
              return (
              <div key={booking.id} className="group p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between hover:bg-subtle/30 transition-colors gap-4">
                <div className="flex items-center gap-6">
                  <div className="flex flex-col items-center min-w-[52px]">
                    <span className="text-[11px] font-bold text-subtle uppercase tracking-widest">{booking.month}</span>
                    <span className="text-xl font-cal font-bold text-emphasis leading-none">{booking.date}</span>
                    <span className="text-[11px] font-bold text-subtle uppercase mt-0.5">{booking.day}</span>
                    <span
                      className="mt-1.5 rounded-md bg-subtle px-1.5 py-0.5 text-[10px] font-bold tabular-nums text-emphasis"
                      title="Length of this booking"
                    >
                      {booking.durationMinutes} min
                    </span>
                  </div>
                  
                  <div className="h-10 w-[1px] bg-subtle" />

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                       <h3 className="text-sm font-bold text-emphasis truncate">{booking.time}</h3>
                       <span className={badge.className}>{badge.label}</span>
                    </div>
                    <div className="flex flex-col gap-1 mt-1">
                       <p className="text-sm text-subtle flex items-center gap-1.5 flex-wrap">
                         <span className="font-bold text-emphasis">{booking.title}</span>
                         <span>between {booking.user} and me</span>
                       </p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-3 w-full sm:items-end sm:w-auto min-w-0">
                  {!isCancelled(booking) ? (
                    <div className="flex flex-wrap items-center gap-2 w-full sm:justify-end">
                      <label
                        htmlFor={`duration-${booking.id}`}
                        className="text-xs font-bold uppercase tracking-wide text-subtle whitespace-nowrap"
                      >
                        Duration
                      </label>
                      <select
                        id={`duration-${booking.id}`}
                        className="rounded-lg border border-subtle bg-default px-2.5 py-2 text-sm text-emphasis outline-none focus:border-emphasis min-w-[100px]"
                        value={durationDraft[booking.id] ?? booking.durationMinutes}
                        onChange={(e) =>
                          setDurationDraft((d) => ({
                            ...d,
                            [booking.id]: Number(e.target.value),
                          }))
                        }
                        disabled={durationBusyId === booking.id}
                      >
                        {booking.durationSelectOptions.map((m) => (
                          <option key={m} value={m}>
                            {m} min
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        className="px-3 py-2 rounded-lg border border-subtle text-sm font-bold text-emphasis hover:bg-subtle transition disabled:opacity-45 disabled:pointer-events-none"
                        disabled={
                          durationBusyId === booking.id ||
                          (durationDraft[booking.id] ?? booking.durationMinutes) ===
                            booking.durationMinutes
                        }
                        onClick={() => void updateDurationForBooking(booking)}
                      >
                        {durationBusyId === booking.id ? "Saving…" : "Update"}
                      </button>
                    </div>
                  ) : null}
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <button
                      type="button"
                      className="flex-1 sm:flex-none px-4 py-2 border border-subtle rounded-lg text-sm font-bold text-emphasis hover:bg-subtle transition disabled:opacity-45"
                      disabled={isCancelled(booking)}
                      onClick={() => openReschedule(booking)}
                    >
                      Reschedule
                    </button>
                    <button
                      type="button"
                      className="p-2 border border-subtle rounded-lg text-subtle hover:bg-subtle transition disabled:opacity-45"
                      disabled={isCancelled(booking)}
                      onClick={async () => {
                        if (!window.confirm("Cancel this booking?")) return;
                        try {
                          await apiData(`/api/v1/bookings/${booking.id}/cancel`, {
                            method: "POST",
                            json: { cancellationReason: "Cancelled from dashboard" },
                          });
                          showToast("Cancelled");
                          await load();
                        } catch (e) {
                          showToast(e.message || "Cancel failed");
                        }
                      }}
                    >
                      <Icon name="ellipsis" className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-12 sm:p-24 border border-dashed border-subtle rounded-xl bg-default text-center">
            <div className="h-16 w-16 bg-subtle rounded-full flex items-center justify-center mb-6">
               <Icon name="calendar" className="h-8 w-8 text-subtle" />
            </div>
            <h2 className="text-xl font-cal font-bold text-emphasis mb-2">You have no {activeTab} bookings</h2>
            <p className="text-subtle text-sm max-w-xs leading-relaxed">
               As soon as someone books a time with you it will show up here.
            </p>
          </div>
        )}
      </div>

      {rescheduleOpen ? (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-[2px] animate-in fade-in duration-200"
          role="dialog"
          aria-modal="true"
          aria-labelledby="reschedule-title"
          onClick={() => !rescheduleBusy && setRescheduleOpen(null)}
        >
          <div
            className="w-full max-w-md bg-default border border-subtle rounded-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-5 border-b border-subtle">
              <h3 id="reschedule-title" className="font-cal text-lg font-bold text-emphasis">
                Reschedule
              </h3>
              <p className="text-sm text-subtle mt-1">
                {rescheduleOpen.title} · {rescheduleOpen.user}
              </p>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wide text-subtle block">
                  New start (your local time)
                </label>
                <input
                  type="datetime-local"
                  className="w-full rounded-lg border border-subtle bg-default px-3 py-2.5 text-sm text-emphasis outline-none focus:border-emphasis"
                  value={rescheduleFormStart}
                  onChange={(e) => setRescheduleFormStart(e.target.value)}
                />
              </div>
              <p className="text-xs text-subtle leading-relaxed">
                To change how long the meeting runs, use{" "}
                <span className="font-semibold text-emphasis">Duration</span> on
                the booking row and click Update.
              </p>
            </div>
            <div className="px-6 py-4 bg-muted/20 border-t border-subtle flex justify-end gap-3">
              <button
                type="button"
                className="btn-secondary"
                disabled={rescheduleBusy}
                onClick={() => setRescheduleOpen(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn-primary"
                disabled={rescheduleBusy}
                onClick={() => void submitReschedule()}
              >
                {rescheduleBusy ? "Saving…" : "Save"}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[200] bg-emphasis text-inverted px-4 py-2 rounded-lg shadow-2xl text-sm font-semibold">
          {toast}
        </div>
      )}
    </div>
  );
}
