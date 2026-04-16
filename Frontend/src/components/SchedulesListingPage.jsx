import React, { useState, useEffect, useCallback } from 'react';
import { Icon } from './Icon';
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

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const load = useCallback(async () => {
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
    <div className="flex-1 lg:pr-6 animate-in fade-in duration-500">
      <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between px-2 sm:px-0">
        <div>
          <h1 className="font-cal text-2xl font-bold text-emphasis">Availability</h1>
          <p className="text-sm text-subtle">Manage your availability schedules.</p>
        </div>
        <button 
          onClick={() => {
            setNewScheduleName("Working hours");
            setIsNewModalOpen(true);
          }}
          className="btn-primary flex items-center gap-2 px-4 py-2 text-sm font-medium shadow-sm transition-all active:scale-95"
        >
          <Icon name="plus" className="h-4 w-4" />
          <span>New</span>
        </button>
      </header>

      <div className="bg-default border border-subtle rounded-xl shadow-sm" ref={parent}>
        <ul className="divide-y divide-subtle">
          {schedules.map((schedule) => (
            <li 
              key={schedule.id}
              onClick={() => onNavigate(`/availability/${schedule.id}`)}
              className="group relative flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 sm:px-6 hover:bg-muted/10 cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-4 min-w-0">
                <div className="p-2.5 bg-subtle rounded-lg border border-subtle group-hover:border-emphasis transition-colors">
                  <Icon name="calendar" className="h-5 w-5 text-emphasis" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h2 className="text-sm font-bold text-emphasis truncate">{schedule.name}</h2>
                    {schedule.isDefault && (
                      <span className="px-1.5 py-0.5 rounded-md bg-subtle text-[10px] font-bold text-subtle uppercase tracking-wider">Default</span>
                    )}
                  </div>
                  <p className="text-xs text-subtle mt-1 flex items-center gap-3">
                    <span className="flex items-center gap-1"><Icon name="clock" className="h-3 w-3" /> {schedule.days}, {schedule.time}</span>
                    <span className="flex items-center gap-1"><Icon name="globe" className="h-3 w-3" /> {schedule.timezone}</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 mt-4 sm:mt-0 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                   className="btn-icon-secondary"
                   onClick={(e) => {
                     e.stopPropagation();
                     setMenuOpenId((prev) => (prev === schedule.id ? null : schedule.id));
                   }}
                >
                  <Icon name="ellipsis" className="h-4 w-4" />
                </button>
                {menuOpenId === schedule.id ? (
                  <div
                    className="absolute right-4 top-12 z-20 w-40 rounded-lg border border-subtle bg-default p-1 shadow-xl"
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

      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[200] bg-emphasis text-inverted px-4 py-2 rounded-lg shadow-2xl text-sm font-semibold">
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
