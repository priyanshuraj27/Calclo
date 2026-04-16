import React, { useState, useEffect, useCallback } from "react";
import { Icon } from "./Icon";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import { apiData } from "../api/client.js";
import { summarizeDays, summarizeTime } from "../api/scheduleMappers.js";

export function SchedulesListingPage({ onNavigate }) {
  const [parent] = useAutoAnimate();
  const [schedules, setSchedules] = useState([]);
  const [toast, setToast] = useState(null);
  const [menuOpenId, setMenuOpenId] = useState(null);
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [newScheduleName, setNewScheduleName] = useState("Working hours");
  const [isLoading, setIsLoading] = useState(true);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const rows = await apiData("/api/v1/schedules");
      setSchedules(
        (rows || []).map((s) => ({
          id: s._id,
          name: s.name,
          isDefault: s.isDefault,
          timezone: s.timezone,
          weeklyRules: s.weeklyRules || {},
          days: summarizeDays(s.weeklyRules),
          time: summarizeTime(s.weeklyRules),
        }))
      );
    } catch (e) {
      showToast(e.message || "Failed to load schedules");
      setSchedules([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!menuOpenId) return;
    const onDocClick = () => setMenuOpenId(null);
    const onEsc = (e) => {
      if (e.key === "Escape") setMenuOpenId(null);
    };
    document.addEventListener("click", onDocClick);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("click", onDocClick);
      document.removeEventListener("keydown", onEsc);
    };
  }, [menuOpenId]);

  const duplicateSchedule = async (schedule) => {
    try {
      const baseName = `${schedule.name} (Copy)`;
      const name = baseName.length > 80 ? baseName.slice(0, 80) : baseName;
      await apiData("/api/v1/schedules", {
        method: "POST",
        json: {
          name,
          timezone: schedule.timezone || "UTC",
          isDefault: false,
          weeklyRules: schedule.weeklyRules || {},
        },
      });
      showToast("Schedule duplicated");
      await load();
    } catch (e) {
      showToast(e.message || "Failed to duplicate schedule");
    }
  };

  const deleteSchedule = async (schedule) => {
    if (!window.confirm(`Delete "${schedule.name}"?`)) return;
    try {
      await apiData(`/api/v1/schedules/${schedule.id}`, { method: "DELETE" });
      showToast("Schedule deleted");
      setSchedules((prev) => prev.filter((s) => s.id !== schedule.id));
    } catch (e) {
      showToast(e.message || "Failed to delete schedule");
    }
  };

  return (
    <div className="flex-1 animate-in fade-in duration-500">
      <header className="mb-6 flex flex-col gap-4 px-1 sm:mb-8 sm:px-0 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <h1 className="font-cal text-lg font-bold leading-tight text-emphasis sm:text-[20px]">
            Availability
          </h1>
          <p className="mt-0.5 max-w-xl text-[13px] text-subtle">
            Configure times when you are available for bookings.
          </p>
        </div>
        <div className="flex flex-wrap items-stretch gap-2 pt-0 sm:items-center lg:shrink-0 lg:justify-end lg:pt-1">
          <button
            type="button"
            className="rounded-md border border-subtle px-2.5 py-1.5 text-xs font-medium text-emphasis sm:px-3 sm:text-sm"
          >
            My availability
          </button>
          <button
            type="button"
            className="rounded-md border border-subtle px-2.5 py-1.5 text-xs font-medium text-subtle sm:px-3 sm:text-sm"
          >
            <span className="sm:hidden">Team</span>
            <span className="hidden sm:inline">Team availability</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setNewScheduleName("Working hours");
              setIsNewModalOpen(true);
            }}
            className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-md bg-white px-3 py-1.5 text-sm font-semibold text-black sm:flex-initial"
          >
            <Icon name="plus" className="h-3.5 w-3.5" />
            New
          </button>
        </div>
      </header>

      <div className="overflow-visible rounded-xl border border-subtle bg-default -mx-0.5 sm:mx-0" ref={parent}>
        <ul className="divide-y divide-subtle">
          {isLoading
            ? [1, 2, 3].map((i) => (
                <li
                  key={`sk-${i}`}
                  className="flex items-start justify-between px-4 py-5"
                >
                  <div className="min-w-0 flex-1 space-y-2">
                    <div className="h-5 w-44 rounded bg-subtle/40 animate-pulse" />
                    <div className="h-4 w-64 rounded bg-subtle/30 animate-pulse" />
                    <div className="h-4 w-40 rounded bg-subtle/30 animate-pulse" />
                    </div>
                  <div className="ml-3 h-9 w-9 shrink-0 rounded-lg border border-subtle bg-subtle/30 animate-pulse" />
                </li>
              ))
            : schedules.map((schedule) => (
                <li
                  key={schedule.id}
                  onClick={() => onNavigate(`/availability/${schedule.id}`)}
                  className="group relative flex cursor-pointer flex-col gap-3 px-3 py-4 transition-colors hover:bg-muted/10 sm:flex-row sm:items-start sm:justify-between sm:px-4 sm:py-3"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="min-w-0 flex-1 truncate text-sm font-semibold leading-tight text-emphasis sm:flex-none">
                        {schedule.name}
                      </h2>
                      {schedule.isDefault && (
                        <span className="rounded-md bg-subtle px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-subtle">
                          Default
                        </span>
                      )}
                    </div>
                    <p className="mt-1 flex flex-wrap items-center gap-x-1 gap-y-0.5 text-[12px] text-subtle">
                      <span>{schedule.days},</span>
                      <span>{schedule.time}</span>
                    </p>
                    <p className="mt-0.5 flex min-w-0 items-center gap-1 text-[12px] text-subtle">
                      <Icon name="globe" className="h-3.5 w-3.5 shrink-0 opacity-90" />
                      <span className="truncate">{schedule.timezone}</span>
                    </p>
                  </div>

                  <div className="relative flex shrink-0 items-center justify-end gap-2 sm:ml-3 sm:mt-1">
                    <button
                      type="button"
                      className="flex h-9 w-9 items-center justify-center rounded-lg border border-subtle bg-default text-subtle hover:bg-subtle/40"
                      onClick={(e) => {
                        e.stopPropagation();
                        setMenuOpenId((prev) =>
                          prev === schedule.id ? null : schedule.id
                        );
                      }}
                    >
                      <Icon name="ellipsis" className="h-4 w-4" />
                    </button>
                    {menuOpenId === schedule.id ? (
                      <div
                        className="absolute right-0 top-full z-30 mt-1 w-[min(16rem,calc(100vw-2rem))] rounded-lg border border-subtle bg-default p-1 shadow-xl"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          type="button"
                          className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-emphasis hover:bg-subtle/40"
                          onClick={() => {
                            setMenuOpenId(null);
                            duplicateSchedule(schedule);
                          }}
                        >
                          <Icon name="copy" className="h-4 w-4" />
                          Duplicate
                        </button>
                        <button
                          type="button"
                          className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-red-500 hover:bg-subtle/40"
                          onClick={() => {
                            setMenuOpenId(null);
                            deleteSchedule(schedule);
                          }}
                        >
                          <Icon name="trash" className="h-4 w-4" />
                          Delete
                        </button>
                      </div>
                    ) : null}
                  </div>
                </li>
              ))}
        </ul>
      </div>

      <div className="py-4 text-center text-sm text-subtle">
        Temporarily out-of-office?{" "}
        <button
          type="button"
          className="font-semibold text-emphasis underline underline-offset-2 hover:opacity-80"
        >
          Add a redirect
        </button>
      </div>

      {toast && (
        <div className="fixed bottom-24 left-1/2 z-[200] max-w-[min(calc(100vw-2rem),24rem)] -translate-x-1/2 rounded-lg bg-emphasis px-4 py-2 text-center text-sm font-semibold text-inverted shadow-2xl lg:bottom-6">
          {toast}
        </div>
      )}

      {isNewModalOpen ? (
        <div className="fixed inset-0 z-[220] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-[1px]"
            onClick={() => setIsNewModalOpen(false)}
          />
          <div className="relative w-full max-w-[560px] overflow-hidden rounded-xl border border-subtle bg-default shadow-2xl">
            <div className="px-6 py-6 border-b border-subtle">
              <h3 className="font-cal text-2xl font-bold text-emphasis">
                Add a new schedule
              </h3>
              <div className="mt-4 space-y-2">
                <label className="text-sm font-semibold text-emphasis block">
                  Name
                </label>
                <input
                  type="text"
                  value={newScheduleName}
                  onChange={(e) => setNewScheduleName(e.target.value)}
                  className="w-full rounded-lg border border-subtle bg-transparent px-3 py-2 text-sm text-emphasis outline-none focus:border-emphasis focus:ring-1 focus:ring-emphasis"
                  placeholder="Working hours"
                  autoFocus
                />
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 bg-muted/20 px-6 py-4">
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setIsNewModalOpen(false)}
              >
                Close
              </button>
              <button
                type="button"
                className="btn-primary"
                onClick={() => {
                  const name = (newScheduleName || "").trim() || "Working hours";
                  setIsNewModalOpen(false);
                  onNavigate(`/availability/new?name=${encodeURIComponent(name)}`);
                }}
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
