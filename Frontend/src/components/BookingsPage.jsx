import React, { useState, useEffect, useCallback, useRef } from "react";
import { Icon } from "./Icon";
import { Skeleton } from "./Skeleton";
import { apiData } from "../api/client.js";
import { MEETING_WHERE_OPTIONS } from "../utils/meetingWhere.js";

const TAB_OPTIONS = [
  { value: "upcoming", label: "Upcoming", apiTab: "upcoming" },
  { value: "unconfirmed", label: "Unconfirmed", apiTab: "unconfirmed" },
  { value: "recurring", label: "Recurring", apiTab: "upcoming" },
  { value: "past", label: "Past", apiTab: "past" },
  { value: "canceled", label: "Canceled", apiTab: "cancelled" },
];

function bookerDisplayName(b) {
  const name = (b.bookerName || "").trim();
  if (name) return name;
  const email = (b.bookerEmail || "").trim();
  if (email) {
    const local = email.split("@")[0];
    if (local) return local;
  }
  return "Guest";
}

function mapBookingRow(b, hostUser) {
  const start = new Date(b.startAt);
  const end = new Date(b.endAt);
  const et = b.eventTypeId && typeof b.eventTypeId === "object" ? b.eventTypeId : {};
  const hostUsername = hostUser?.username || "";
  const hostDisplayName =
    (hostUser?.fullName && String(hostUser.fullName).trim()) ||
    (hostUsername && String(hostUsername).trim()) ||
    "Host";
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
    hostUsername,
    hostDisplayName,
    title: et.title || "Meeting",
    guest: bookerDisplayName(b),
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
    meetingWhereType: b.meetingWhereType || "cal-video",
    meetingWhereDetail: b.meetingWhereDetail || "",
    guestEmails: Array.isArray(b.guestEmails) ? [...b.guestEmails] : [],
    bookerEmail: (b.bookerEmail || "").trim(),
  };
}

export function BookingsPage({ onNavigate }) {
  const [activeTab, setActiveTab] = useState("upcoming");
  const [isLoading, setIsLoading] = useState(true);
  const [bookings, setBookings] = useState([]);
  const [toast, setToast] = useState(null);
  const [menuOpenId, setMenuOpenId] = useState(null);
  const menuRef = useRef(null);
  /** `{ kind, booking }` — booking is mapped row from `mapBookingRow` */
  const [bookingEditModal, setBookingEditModal] = useState(null);
  const [locType, setLocType] = useState("cal-video");
  const [locDetail, setLocDetail] = useState("");
  const [guestsText, setGuestsText] = useState("");
  const [editSaving, setEditSaving] = useState(false);

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
      const mapped = (rows || []).map((r) => mapBookingRow(r, me));
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

  const closeBookingEditModal = () => setBookingEditModal(null);

  const saveLocationEdit = async () => {
    if (!bookingEditModal || bookingEditModal.kind !== "location") return;
    const { booking } = bookingEditModal;
    setEditSaving(true);
    try {
      await apiData(`/api/v1/bookings/${booking.id}`, {
        method: "PATCH",
        json: {
          meetingWhereType: locType,
          meetingWhereDetail: locDetail.trim(),
        },
      });
      showToast("Meeting location updated");
      closeBookingEditModal();
      await load();
    } catch (e) {
      showToast(e.message || "Could not update location");
    } finally {
      setEditSaving(false);
    }
  };

  const saveGuestsEdit = async () => {
    if (!bookingEditModal || bookingEditModal.kind !== "guests") return;
    const { booking } = bookingEditModal;
    const primary = (booking.bookerEmail || "").toLowerCase().trim();
    const parts = guestsText
      .split(/[\s,;]+/)
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean)
      .filter((e) => !primary || e !== primary);
    setEditSaving(true);
    try {
      await apiData(`/api/v1/bookings/${booking.id}`, {
        method: "PATCH",
        json: { guestEmails: parts },
      });
      showToast("Guests updated");
      closeBookingEditModal();
      await load();
    } catch (e) {
      showToast(e.message || "Could not update guests");
    } finally {
      setEditSaving(false);
    }
  };

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

  useEffect(() => {
    if (!bookingEditModal) return;
    const { kind, booking } = bookingEditModal;
    if (kind === "location") {
      setLocType(booking.meetingWhereType || "cal-video");
      setLocDetail(booking.meetingWhereDetail || "");
    } else {
      setGuestsText((booking.guestEmails || []).join(", "));
    }
  }, [bookingEditModal]);

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
        setBookingEditModal({ kind: "location", booking });
      } else if (action === "edit-guests") {
        setBookingEditModal({ kind: "guests", booking });
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
    <div className="flex-1 min-w-0">
      <header className="mb-4 sm:mb-5">
        <h1 className="font-cal text-xl font-bold text-emphasis sm:text-2xl">Bookings</h1>
        <p className="mt-1 max-w-2xl text-sm text-subtle">
          See upcoming and past events booked through your event type links.
        </p>
      </header>

      <div className="mb-3 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0 flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-2">
          <div className="-mx-1 overflow-x-auto px-1 pb-0.5 sm:mx-0 sm:overflow-visible sm:pb-0">
            <div className="inline-flex min-w-max items-center rounded-lg border border-subtle bg-subtle/20 p-0.5">
            {TAB_OPTIONS.map((tab) => (
              <button
                key={tab.value}
                type="button"
                onClick={() => setActiveTab(tab.value)}
                className={`whitespace-nowrap rounded-md px-2.5 py-1.5 text-xs font-medium transition sm:px-3 sm:text-sm ${
                  activeTab === tab.value
                    ? "bg-default text-emphasis"
                    : "text-subtle hover:text-emphasis"
                }`}
              >
                {tab.label}
              </button>
            ))}
            </div>
          </div>
          <button
            type="button"
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg border border-subtle px-3 py-2 text-sm text-emphasis hover:bg-subtle/30 sm:justify-start"
          >
            <Icon name="list-filter" className="h-4 w-4" />
            Filter
          </button>
        </div>

        <button
          type="button"
          className="inline-flex w-full shrink-0 items-center justify-center gap-2 rounded-lg border border-subtle px-3 py-2 text-sm text-subtle hover:text-emphasis lg:w-auto lg:justify-start"
        >
          <Icon name="list-filter" className="h-4 w-4" />
          <span className="truncate">Saved filters</span>
          <Icon name="chevron-down" className="h-3.5 w-3.5 shrink-0" />
        </button>
      </div>

      <section className="overflow-visible rounded-xl border border-subtle bg-default">
        <div className="border-b border-subtle px-3 py-3 text-xs font-bold uppercase tracking-wide text-subtle sm:px-5">
          Today
        </div>

        {bookings.length ? (
          bookings.map((b) => (
            <div
              key={b.id}
              className="relative flex flex-col gap-4 border-b border-subtle px-3 py-5 last:border-b-0 sm:flex-row sm:items-start sm:justify-between sm:gap-4 sm:px-5 sm:py-6"
            >
              <div className="flex w-full flex-col gap-4 sm:flex-row sm:gap-6">
              <div className="w-full shrink-0 text-sm text-emphasis sm:w-[140px] md:w-[150px]">
                <p className="font-medium">{b.dateLabel}</p>
                <p className="mt-1 text-subtle">{b.timeLabel}</p>
                <a
                  href={b.linkHref || "#"}
                  className="mt-2 inline-flex max-w-full items-center gap-1 break-words text-blue-400 hover:underline"
                >
                  <Icon name="video" className="h-3.5 w-3.5 shrink-0" />
                  <span className="min-w-0">{b.linkLabel}</span>
                </a>
              </div>

              <div className="min-w-0 flex-1 text-sm">
                <p className="font-semibold leading-snug text-emphasis">
                  {b.title} between {b.guest} and {b.hostDisplayName}
                </p>
                <p className="mt-1 text-subtle">You and {b.guest}</p>
              </div>
              </div>

              <div className="relative flex shrink-0 justify-end self-end sm:self-start">
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
                    className="fixed inset-x-3 bottom-24 z-50 max-h-[min(70vh,480px)] overflow-y-auto rounded-2xl border border-subtle bg-default shadow-2xl sm:absolute sm:inset-x-auto sm:bottom-auto sm:right-0 sm:top-full sm:mt-2 sm:max-h-none sm:w-[260px]"
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
                  <button onClick={() => void handleMenuAction(b, "edit-guests")} className="flex w-full items-center gap-3 px-4 py-3 text-left text-emphasis hover:bg-subtle/30">
                    <Icon name="users" className="h-4 w-4 text-subtle" />
                    Edit guests
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

        <div className="flex flex-col gap-3 bg-subtle/20 px-3 py-3 text-sm text-subtle sm:flex-row sm:items-center sm:justify-between sm:px-5 sm:py-2.5">
          <div className="inline-flex flex-wrap items-center gap-2">
            <select className="rounded-md border border-subtle bg-default px-2 py-1 text-sm text-emphasis outline-none">
              <option>10</option>
              <option>25</option>
              <option>50</option>
            </select>
            <span>rows per page</span>
          </div>
          <div className="inline-flex items-center justify-between gap-2 sm:justify-end">
            <span className="text-xs sm:text-sm">1-1 of {bookings.length}</span>
            <div className="flex items-center gap-1">
            <button className="inline-flex h-6 w-6 items-center justify-center rounded border border-subtle opacity-50" type="button">
              <Icon name="chevron-left" className="h-3 w-3" />
            </button>
            <button className="inline-flex h-6 w-6 items-center justify-center rounded border border-subtle opacity-50" type="button">
              <Icon name="chevron-right" className="h-3 w-3" />
            </button>
            </div>
          </div>
        </div>
      </section>

      {bookingEditModal?.kind === "location" ? (
        <div className="fixed inset-0 z-[210] flex items-end justify-center p-0 sm:items-center sm:p-4">
          <button
            type="button"
            className="absolute inset-0 bg-black/50 backdrop-blur-[1px]"
            aria-label="Close"
            onClick={closeBookingEditModal}
          />
          <div className="relative z-10 max-h-[90dvh] w-full max-w-lg overflow-y-auto rounded-t-2xl border border-subtle border-b-0 bg-default p-4 shadow-2xl sm:rounded-xl sm:border-b sm:p-6">
            <h3 className="font-cal text-lg font-bold text-emphasis sm:text-xl">
              Edit meeting location
            </h3>
            <p className="mt-1 text-sm text-subtle">
              {bookingEditModal.booking.title} · {bookingEditModal.booking.dateLabel}{" "}
              {bookingEditModal.booking.timeLabel}
            </p>
            <div className="mt-5 space-y-4">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-emphasis">Where</label>
                <select
                  className="w-full rounded-lg border border-subtle bg-default px-3 py-2.5 text-sm text-emphasis outline-none focus:border-emphasis focus:ring-1 focus:ring-emphasis"
                  value={locType}
                  onChange={(e) => setLocType(e.target.value)}
                >
                  {MEETING_WHERE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
              {(() => {
                const opt = MEETING_WHERE_OPTIONS.find((o) => o.value === locType);
                const show =
                  opt &&
                  (opt.needsDetail === true || opt.needsDetail === "optional");
                if (!show) return null;
                return (
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-emphasis">
                      {opt.detailLabel || "Details"}
                    </label>
                    <input
                      type={opt.inputType === "tel" ? "tel" : "text"}
                      className="w-full rounded-lg border border-subtle bg-default px-3 py-2.5 text-sm text-emphasis outline-none focus:border-emphasis focus:ring-1 focus:ring-emphasis"
                      placeholder={opt.detailPlaceholder || ""}
                      value={locDetail}
                      onChange={(e) => setLocDetail(e.target.value)}
                    />
                    {opt.needsDetail === "optional" ? (
                      <p className="text-xs text-subtle">Optional for this location type.</p>
                    ) : null}
                  </div>
                );
              })()}
            </div>
            <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end sm:gap-3">
              <button
                type="button"
                className="btn-secondary w-full sm:w-auto"
                onClick={closeBookingEditModal}
                disabled={editSaving}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn-primary w-full sm:w-auto"
                disabled={editSaving}
                onClick={() => void saveLocationEdit()}
              >
                {editSaving ? "Saving…" : "Save"}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {bookingEditModal?.kind === "guests" ? (
        <div className="fixed inset-0 z-[210] flex items-end justify-center p-0 sm:items-center sm:p-4">
          <button
            type="button"
            className="absolute inset-0 bg-black/50 backdrop-blur-[1px]"
            aria-label="Close"
            onClick={closeBookingEditModal}
          />
          <div className="relative z-10 max-h-[90dvh] w-full max-w-lg overflow-y-auto rounded-t-2xl border border-subtle border-b-0 bg-default p-4 shadow-2xl sm:rounded-xl sm:border-b sm:p-6">
            <h3 className="font-cal text-lg font-bold text-emphasis sm:text-xl">
              Edit guests
            </h3>
            <p className="mt-1 text-sm text-subtle">
              Additional invitees (not the booker). Booker:{" "}
              <span className="font-medium text-emphasis">
                {bookingEditModal.booking.bookerEmail || bookingEditModal.booking.guest}
              </span>
            </p>
            <div className="mt-5 space-y-2">
              <label className="block text-sm font-semibold text-emphasis">
                Guest emails
              </label>
              <textarea
                className="min-h-[120px] w-full rounded-lg border border-subtle bg-default px-3 py-2.5 text-sm text-emphasis outline-none focus:border-emphasis focus:ring-1 focus:ring-emphasis"
                placeholder="one@example.com, other@example.com"
                value={guestsText}
                onChange={(e) => setGuestsText(e.target.value)}
              />
              <p className="text-xs text-subtle">
                Separate with commas, spaces, or new lines. Invalid addresses are ignored.
              </p>
            </div>
            <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end sm:gap-3">
              <button
                type="button"
                className="btn-secondary w-full sm:w-auto"
                onClick={closeBookingEditModal}
                disabled={editSaving}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn-primary w-full sm:w-auto"
                disabled={editSaving}
                onClick={() => void saveGuestsEdit()}
              >
                {editSaving ? "Saving…" : "Save"}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {toast ? (
        <div className="fixed bottom-24 left-1/2 z-[200] max-w-[min(calc(100vw-2rem),24rem)] -translate-x-1/2 rounded-lg bg-emphasis px-4 py-2 text-center text-sm font-semibold text-inverted shadow-2xl lg:bottom-6">
          {toast}
        </div>
      ) : null}
    </div>
  );
}
