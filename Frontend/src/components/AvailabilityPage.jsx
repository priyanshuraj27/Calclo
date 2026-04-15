import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { Icon } from "./Icon";
import { Switch } from "./Switch";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import { apiData } from "../api/client.js";
import {
  weeklyRulesToAvailability,
  availabilityToWeeklyRules,
  summarizeAvailabilitySubtitle,
} from "../api/scheduleMappers.js";

const isMongoId = (id) => /^[a-f\d]{24}$/i.test(id || "");

/** IANA zones for schedule timezone (booking engine uses this with weekly hours). */
const SCHEDULE_TIMEZONES = [
  "UTC",
  "Europe/London",
  "Europe/Paris",
  "Europe/Berlin",
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "America/Sao_Paulo",
  "Asia/Kolkata",
  "Asia/Dubai",
  "Asia/Singapore",
  "Asia/Hong_Kong",
  "Asia/Tokyo",
  "Asia/Seoul",
  "Australia/Sydney",
  "Pacific/Auckland",
];

/**
 * Pixel-perfect replica of the Cal.com Schedule Editor page based on the provided screenshot.
 */
export function AvailabilityPage({ onNavigate, scheduleId }) {
  const [parent] = useAutoAnimate();
  const [title, setTitle] = useState("9-5");
  const [timezone, setTimezone] = useState("Europe/London");
  const [isDefault, setIsDefault] = useState(false);
  const [subtitle, setSubtitle] = useState("Mon - Fri, 9:00 AM - 5:00 PM");
  const skipSave = useRef(true);

  const days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  const [availability, setAvailability] = useState(() => {
    const row = [{ from: "9:00am", to: "5:00pm" }];
    return {
      Sunday: null,
      Monday: [...row],
      Tuesday: [...row],
      Wednesday: [...row],
      Thursday: [...row],
      Friday: [...row],
      Saturday: null,
    };
  });

  const recomputeSubtitle = useCallback((av) => {
    try {
      setSubtitle(summarizeAvailabilitySubtitle(av));
    } catch {
      setSubtitle("Mon - Fri, 9:00 AM - 5:00 PM");
    }
  }, []);

  const timezoneOptions = useMemo(() => {
    if (!timezone || SCHEDULE_TIMEZONES.includes(timezone)) {
      return SCHEDULE_TIMEZONES;
    }
    return [timezone, ...SCHEDULE_TIMEZONES];
  }, [timezone]);

  useEffect(() => {
    recomputeSubtitle(availability);
  }, [availability, recomputeSubtitle]);

  useEffect(() => {
    if (scheduleId === "new" || !isMongoId(scheduleId)) {
      skipSave.current = false;
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const s = await apiData(`/api/v1/schedules/${scheduleId}`);
        if (cancelled) return;
        setTitle(s.name || "Schedule");
        setTimezone(s.timezone || "UTC");
        setIsDefault(Boolean(s.isDefault));
        const av = weeklyRulesToAvailability(s.weeklyRules);
        setAvailability(av);
        queueMicrotask(() => {
          skipSave.current = false;
        });
      } catch {
        skipSave.current = false;
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [scheduleId]);

  useEffect(() => {
    if (scheduleId === "new" || !isMongoId(scheduleId)) return;
    if (skipSave.current) return;
    const t = setTimeout(() => {
      const weeklyRules = availabilityToWeeklyRules(availability);
      apiData(`/api/v1/schedules/${scheduleId}`, {
        method: "PATCH",
        json: {
          name: title,
          timezone,
          isDefault,
          weeklyRules,
        },
      }).catch(() => {});
    }, 800);
    return () => clearTimeout(t);
  }, [title, timezone, isDefault, availability, scheduleId]);

  const toggleDay = (day) => {
    setAvailability((prev) => ({
      ...prev,
      [day]: prev[day] ? null : [{ from: "9:00am", to: "5:00pm" }],
    }));
  };

  const updateSlot = (day, field, value) => {
    setAvailability((prev) => {
      const slots = prev[day] ? [...prev[day]] : [{ from: "9:00am", to: "5:00pm" }];
      const row = { ...(slots[0] || { from: "9:00am", to: "5:00pm" }), [field]: value };
      slots[0] = row;
      return { ...prev, [day]: slots };
    });
  };

  const handleSaveClick = async () => {
    if (scheduleId === "new") {
      try {
        const weeklyRules = availabilityToWeeklyRules(availability);
        const created = await apiData("/api/v1/schedules", {
          method: "POST",
          json: {
            name: title,
            timezone,
            isDefault,
            weeklyRules,
          },
        });
        onNavigate(`/availability/${created._id}`);
      } catch {
        /* keep UI */
      }
      return;
    }
    if (!isMongoId(scheduleId)) return;
    try {
      await apiData(`/api/v1/schedules/${scheduleId}`, {
        method: "PATCH",
        json: {
          name: title,
          timezone,
          isDefault,
          weeklyRules: availabilityToWeeklyRules(availability),
        },
      });
    } catch {
      /* noop */
    }
  };

  const handleDelete = async () => {
    if (!isMongoId(scheduleId)) {
      onNavigate("/availability");
      return;
    }
    if (!window.confirm("Delete this schedule?")) return;
    try {
      await apiData(`/api/v1/schedules/${scheduleId}`, { method: "DELETE" });
      onNavigate("/availability");
    } catch {
      /* noop */
    }
  };

  return (
    <div className="flex flex-col h-full bg-default text-default animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between px-4 sm:px-8 py-4 sm:py-6 sticky top-0 bg-default/80 backdrop-blur-md z-50 border-b border-subtle sm:border-none gap-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-3">
             <button onClick={() => onNavigate("/availability")} className="p-1 hover:bg-subtle rounded-md text-subtle">
               <Icon name="arrow-left" className="h-4 w-4" />
             </button>
             <div className="flex items-center gap-2 group cursor-pointer">
                <h1 className="font-cal text-xl sm:text-2xl font-bold text-emphasis leading-none">{title}</h1>
                <Icon name="edit-2" className="h-4 w-4 text-subtle opacity-0 group-hover:opacity-100 transition" />
             </div>
          </div>
          <p className="text-xs sm:text-sm font-medium text-subtle ml-8">{subtitle}</p>
        </div>

        <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
           <div className="flex items-center gap-3 pr-4 border-r border-subtle">
              <span className="text-xs sm:text-sm font-semibold text-emphasis hidden xs:inline">Set as default</span>
              <Switch checked={isDefault} onChange={setIsDefault} />
           </div>
           <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleDelete}
                className="p-2.5 bg-[#291415] border border-[#442222] rounded-lg text-[#f87171] hover:bg-[#3d1a1c] transition shadow-sm group"
              >
                <Icon name="trash" className="h-4 w-4" />
              </button>
              <div className="w-[1px] h-6 bg-subtle mx-1" />
              <button
                type="button"
                onClick={handleSaveClick}
                className="btn-primary min-h-[36px] px-5 py-2"
              >
                Save
              </button>
           </div>
        </div>
      </div>

      <main className="flex-1 overflow-y-auto px-4 sm:px-8 pb-12">
        <div className="max-w-[1200px] mx-auto grid grid-cols-1 lg:grid-cols-[1fr_minmax(260px,320px)] gap-12 lg:items-start">
          
          <div className="space-y-10">
            <div className="bg-default border border-subtle rounded-xl p-4 shadow-sm" ref={parent}>
              {days.map(day => {
                const slots = availability[day];
                const isActive = slots && slots.length > 0;
                return (
                  <div key={day} className="flex items-center py-2.5 px-4 group">
                    <div className="flex items-center gap-4 w-48">
                       <Switch checked={isActive} onChange={() => toggleDay(day)} />
                       <span className={`text-sm font-bold ${isActive ? 'text-emphasis' : 'text-subtle'}`}>{day}</span>
                    </div>
                    
                    <div className="flex-1 flex items-center gap-3">
                      {isActive ? (
                        <>
                          <div className="flex items-center gap-2">
                            <div className="flex items-center bg-muted/30 border border-subtle rounded-lg px-3 py-1.5 text-sm gap-2">
                               <input
                                 type="text"
                                 className="w-16 bg-transparent outline-none font-medium text-emphasis"
                                 value={slots[0]?.from || "9:00am"}
                                 onChange={(e) => updateSlot(day, "from", e.target.value)}
                               />
                               <span className="text-subtle">–</span>
                               <input
                                 type="text"
                                 className="w-16 bg-transparent outline-none font-medium text-emphasis"
                                 value={slots[0]?.to || "5:00pm"}
                                 onChange={(e) => updateSlot(day, "to", e.target.value)}
                               />
                            </div>
                            <button type="button" className="p-2 hover:bg-subtle rounded-md text-subtle transition">
                               <Icon name="plus" className="h-3.5 w-3.5" />
                            </button>
                            <button type="button" className="p-2 hover:bg-subtle rounded-md text-subtle transition">
                               <Icon name="copy" className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </>
                      ) : (
                        <div className="h-9" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="bg-default border border-subtle rounded-xl p-8 space-y-4">
               <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-emphasis">Date overrides</h3>
                  <Icon name="info" className="h-3.5 w-3.5 text-subtle" />
               </div>
               <p className="text-sm text-subtle leading-relaxed">
                 Add dates when your availability changes from your daily hours.
               </p>
               <button type="button" className="flex items-center gap-2 px-4 py-2 border border-subtle rounded-lg text-sm font-bold text-emphasis hover:bg-subtle transition">
                  <Icon name="plus" className="h-4 w-4" />
                  Add an override
               </button>
            </div>
          </div>

          <div className="space-y-10 lg:sticky lg:top-28 lg:self-start">
            <div className="space-y-4 rounded-xl border border-subtle bg-default p-5 shadow-sm">
              <h3 className="text-sm font-bold text-emphasis">Schedule timezone</h3>
              <p className="text-xs text-subtle leading-relaxed">
                Your weekly hours are interpreted in this timezone. It stays visible here while you
                edit days and times.
              </p>
              <div className="relative group">
                <select
                  className="w-full appearance-none bg-default border border-subtle rounded-lg px-4 py-2.5 text-sm font-medium text-emphasis focus:ring-1 focus:ring-emphasis outline-none cursor-pointer transition"
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                >
                  {timezoneOptions.map((tz) => (
                    <option key={tz} value={tz}>
                      {tz}
                    </option>
                  ))}
                </select>
                <Icon
                  name="chevron-down"
                  className="absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-subtle pointer-events-none"
                />
              </div>
            </div>

            <div className="bg-default border border-subtle rounded-xl p-6 space-y-4">
               <h3 className="text-sm font-bold text-emphasis">Something doesn&apos;t look right?</h3>
               <button type="button" className="w-full px-4 py-2 border border-subtle rounded-lg text-sm font-bold text-emphasis hover:bg-subtle transition">
                  Launch troubleshooter
               </button>
            </div>
          </div>

        </div>
      </main>

      <div className="fixed bottom-6 right-6">
         <button type="button" className="p-4 bg-emphasis text-default rounded-full shadow-2xl hover:scale-110 transition active:scale-95">
            <Icon name="message-square" className="h-6 w-6" />
         </button>
      </div>
    </div>
  );
}
