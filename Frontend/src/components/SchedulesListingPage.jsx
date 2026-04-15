import React, { useState, useEffect, useCallback } from 'react';
import { Icon } from './Icon';
import { useAutoAnimate } from "@formkit/auto-animate/react";
import { apiData } from "../api/client.js";
import { summarizeDays, summarizeTime } from "../api/scheduleMappers.js";

export function SchedulesListingPage({ onNavigate }) {
  const [parent] = useAutoAnimate();
  const [schedules, setSchedules] = useState([]);
  const [toast, setToast] = useState(null);

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

  return (
    <div className="flex-1 lg:pr-6 animate-in fade-in duration-500">
      <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between px-2 sm:px-0">
        <div>
          <h1 className="font-cal text-2xl font-bold text-emphasis">Availability</h1>
          <p className="text-sm text-subtle">Manage your availability schedules.</p>
        </div>
        <button 
          onClick={() => onNavigate('/availability/new')}
          className="btn-primary flex items-center gap-2 px-4 py-2 text-sm font-medium shadow-sm transition-all active:scale-95"
        >
          <Icon name="plus" className="h-4 w-4" />
          <span>New</span>
        </button>
      </header>

      <div className="bg-default border border-subtle rounded-xl overflow-hidden shadow-sm" ref={parent}>
        <ul className="divide-y divide-subtle">
          {schedules.map((schedule) => (
            <li 
              key={schedule.id}
              onClick={() => onNavigate(`/availability/${schedule.id}`)}
              className="group flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 sm:px-6 hover:bg-muted/10 cursor-pointer transition-colors"
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
                   }}
                >
                  <Icon name="ellipsis" className="h-4 w-4" />
                </button>
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
    </div>
  );
}
