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

const isPersistedId = (id) => {
  const value = String(id || "").trim();
  return value.length > 0 && value !== "new" && value !== "undefined";
};

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
export function AvailabilityPage({ onNavigate, scheduleId, initialName }) {
  const [parent] = useAutoAnimate();
  const [title, setTitle] = useState(initialName || "Working hours");
  const [timezone, setTimezone] = useState("Europe/London");
  const [isDefault, setIsDefault] = useState(false);
  const [subtitle, setSubtitle] = useState("Mon - Fri, 9:00 AM - 5:00 PM");
  const [showBulkDefaultModal, setShowBulkDefaultModal] = useState(false);
  const [eventTypeChoices, setEventTypeChoices] = useState([]);
  const [selectedEventTypeIds, setSelectedEventTypeIds] = useState([]);
  const [isBulkUpdating, setIsBulkUpdating] = useState(false);
  const skipSave = useRef(true);
  const [copyModal, setCopyModal] = useState({
    open: false,
    sourceDay: "",
    sourceIndex: 0,
    selectedDays: [],
  });

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
    if (scheduleId !== "new") return;
    setTitle((initialName || "Working hours").trim() || "Working hours");
  }, [initialName, scheduleId]);

  useEffect(() => {
    if (scheduleId === "new" || !isPersistedId(scheduleId)) {
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
    if (scheduleId === "new" || !isPersistedId(scheduleId)) return;
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

  const updateSlotAt = (day, index, field, value) => {
    setAvailability((prev) => {
      const slots = prev[day] ? [...prev[day]] : [];
      if (!slots[index]) return prev;
      slots[index] = { ...slots[index], [field]: value };
      return { ...prev, [day]: slots };
    });
  };

  const addSlot = (day) => {
    setAvailability((prev) => {
      const slots = prev[day] ? [...prev[day]] : [];
      if (!slots.length) {
        return { ...prev, [day]: [{ from: "9:00am", to: "5:00pm" }] };
      }
      const last = slots[slots.length - 1];
      const nextFrom = last?.to || "5:00pm";
      slots.push({ from: nextFrom, to: "6:00pm" });
      return { ...prev, [day]: slots };
    });
  };

  const removeSlot = (day, index) => {
    setAvailability((prev) => {
      const slots = prev[day] ? [...prev[day]] : [];
      if (slots.length <= 1) return prev;
      slots.splice(index, 1);
      return { ...prev, [day]: slots };
    });
  };

  const openCopyModal = (day, index) => {
    const selected = days.filter((d) => d !== day);
    setCopyModal({
      open: true,
      sourceDay: day,
      sourceIndex: index,
      selectedDays: selected,
    });
  };

  const closeCopyModal = () => {
    setCopyModal({
      open: false,
      sourceDay: "",
      sourceIndex: 0,
      selectedDays: [],
    });
  };

  const toggleCopyDay = (day) => {
    setCopyModal((prev) => ({
      ...prev,
      selectedDays: prev.selectedDays.includes(day)
        ? prev.selectedDays.filter((d) => d !== day)
        : [...prev.selectedDays, day],
    }));
  };

  const toggleCopySelectAll = () => {
    setCopyModal((prev) => {
      const eligible = days.filter((d) => d !== prev.sourceDay);
      const allSelected = eligible.every((d) => prev.selectedDays.includes(d));
      return {
        ...prev,
        selectedDays: allSelected ? [] : eligible,
      };
    });
  };

  const applyCopyTimes = () => {
    const { sourceDay, sourceIndex, selectedDays } = copyModal;
    if (!sourceDay || !selectedDays.length) {
      closeCopyModal();
      return;
    }
    const sourceSlot = availability[sourceDay]?.[sourceIndex];
    if (!sourceSlot) {
      closeCopyModal();
      return;
    }

    setAvailability((prev) => {
      const next = { ...prev };
      for (const day of selectedDays) {
        const current = next[day] ? [...next[day]] : [];
        const exists = current.some(
          (s) => s.from === sourceSlot.from && s.to === sourceSlot.to
        );
        if (!exists) {
          current.push({ ...sourceSlot });
        }
        next[day] = current.length ? current : [{ ...sourceSlot }];
      }
      return next;
    });
    closeCopyModal();
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
    if (!isPersistedId(scheduleId)) return;
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
    if (!isPersistedId(scheduleId)) {
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

  const loadEventTypeChoices = useCallback(async () => {
    try {
      const rows = await apiData("/api/v1/event-types", { noCache: true });
      const items = (rows || []).map((r) => ({
        id: r._id,
        title: r.title || "Untitled event type",
        availabilityScheduleId:
          typeof r.availabilityScheduleId === "object"
            ? r.availabilityScheduleId?._id
            : r.availabilityScheduleId,
      }));
      setEventTypeChoices(items);
      setSelectedEventTypeIds(items.map((i) => i.id));
    } catch {
      setEventTypeChoices([]);
      setSelectedEventTypeIds([]);
    }
  }, []);

  const handleDefaultToggle = async (next) => {
    if (!next) {
      setIsDefault(false);
      return;
    }
    setIsDefault(true);
    if (!isPersistedId(scheduleId)) return;
    await loadEventTypeChoices();
    setShowBulkDefaultModal(true);
  };

  const isAllSelected =
    eventTypeChoices.length > 0 &&
    selectedEventTypeIds.length === eventTypeChoices.length;

  const toggleSelectAll = () => {
    setSelectedEventTypeIds((prev) =>
      prev.length === eventTypeChoices.length
        ? []
        : eventTypeChoices.map((e) => e.id)
    );
  };

  const toggleEventTypeChoice = (id) => {
    setSelectedEventTypeIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const applyBulkDefaultUpdate = async () => {
    if (!isPersistedId(scheduleId)) {
      setShowBulkDefaultModal(false);
      return;
    }
    setIsBulkUpdating(true);
    try {
      await Promise.all(
        selectedEventTypeIds.map((eventTypeId) =>
          apiData(`/api/v1/event-types/${eventTypeId}`, {
            method: "PATCH",
            json: { availabilityScheduleId: scheduleId },
          })
        )
      );
      setShowBulkDefaultModal(false);
    } catch {
      // Keep modal open so user can retry.
    } finally {
      setIsBulkUpdating(false);
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
             <input
               type="text"
               value={title}
               onChange={(e) => setTitle(e.target.value)}
               className="font-cal text-xl sm:text-2xl font-bold text-emphasis leading-none bg-transparent outline-none border-b border-transparent hover:border-subtle focus:border-emphasis transition w-[320px] max-w-[70vw]"
               aria-label="Schedule name"
             />
          </div>
          <p className="text-xs sm:text-sm font-medium text-subtle ml-8">{subtitle}</p>
        </div>

        <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
           <div className="flex items-center gap-3 pr-4 border-r border-subtle">
              <button
                type="button"
                className="text-xs sm:text-sm font-semibold text-emphasis hidden xs:inline hover:underline"
                onClick={() => handleDefaultToggle(!isDefault)}
              >
                {isDefault ? "Reset to default" : "Set as default"}
              </button>
              <Switch checked={isDefault} onChange={handleDefaultToggle} />
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
                        <div className="flex flex-col gap-2">
                          {(slots || []).map((slot, index) => (
                            <div key={`${day}-${index}`} className="flex items-center gap-2">
                              <div className="flex items-center bg-muted/30 border border-subtle rounded-lg px-3 py-1.5 text-sm gap-2">
                                <input
                                  type="text"
                                  className="w-16 bg-transparent outline-none font-medium text-emphasis"
                                  value={slot?.from || "9:00am"}
                                  onChange={(e) =>
                                    updateSlotAt(day, index, "from", e.target.value)
                                  }
                                />
                                <span className="text-subtle">–</span>
                                <input
                                  type="text"
                                  className="w-16 bg-transparent outline-none font-medium text-emphasis"
                                  value={slot?.to || "5:00pm"}
                                  onChange={(e) =>
                                    updateSlotAt(day, index, "to", e.target.value)
                                  }
                                />
                              </div>
                              <button
                                type="button"
                                className="p-2 hover:bg-subtle rounded-md text-subtle transition"
                                onClick={() => addSlot(day)}
                                title="Add time range"
                              >
                                <Icon name="plus" className="h-3.5 w-3.5" />
                              </button>
                              <button
                                type="button"
                                className="p-2 hover:bg-subtle rounded-md text-subtle transition"
                                onClick={() => openCopyModal(day, index)}
                                title="Copy times to"
                              >
                                <Icon name="copy" className="h-3.5 w-3.5" />
                              </button>
                              {slots.length > 1 ? (
                                <button
                                  type="button"
                                  className="p-2 hover:bg-subtle rounded-md text-subtle transition"
                                  onClick={() => removeSlot(day, index)}
                                  title="Delete time range"
                                >
                                  <Icon name="trash" className="h-3.5 w-3.5" />
                                </button>
                              ) : null}
                            </div>
                          ))}
                        </div>
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

      {showBulkDefaultModal ? (
        <div className="fixed inset-0 z-[220] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-[1px]"
            onClick={() => setShowBulkDefaultModal(false)}
          />
          <div className="relative w-full max-w-[560px] overflow-hidden rounded-xl border border-subtle bg-default shadow-2xl">
            <div className="px-6 py-6 border-b border-subtle">
              <h3 className="font-cal text-2xl font-bold text-emphasis">
                Bulk update existing event types
              </h3>
              <p className="mt-1 text-sm text-subtle">
                Update the schedules for the selected event types
              </p>
              <div className="mt-4 space-y-2">
                <label className="flex items-center gap-2 rounded-md px-2 py-1 text-sm text-emphasis hover:bg-subtle/30">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    onChange={toggleSelectAll}
                  />
                  <span>Select all</span>
                </label>
                <div className="max-h-[280px] space-y-2 overflow-y-auto pr-1">
                  {eventTypeChoices.map((item) => (
                    <label
                      key={item.id}
                      className="flex items-center gap-2 rounded-md border border-subtle bg-subtle/20 px-3 py-2 text-sm text-emphasis"
                    >
                      <input
                        type="checkbox"
                        checked={selectedEventTypeIds.includes(item.id)}
                        onChange={() => toggleEventTypeChoice(item.id)}
                      />
                      <span className="truncate">{item.title}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 bg-muted/20 px-6 py-4">
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setShowBulkDefaultModal(false)}
              >
                Close
              </button>
              <button
                type="button"
                className="btn-primary"
                disabled={isBulkUpdating}
                onClick={applyBulkDefaultUpdate}
              >
                {isBulkUpdating ? "Updating..." : "Update"}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {copyModal.open ? (
        <div className="fixed inset-0 z-[240] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-[1px]"
            onClick={closeCopyModal}
          />
          <div className="relative w-full max-w-[420px] overflow-hidden rounded-xl border border-subtle bg-default shadow-2xl">
            <div className="border-b border-subtle px-5 py-4">
              <h3 className="text-xs font-bold uppercase tracking-wide text-subtle">
                Copy times to
              </h3>
              <div className="mt-4 space-y-2">
                <label className="flex items-center gap-2 rounded-md px-2 py-1 text-sm text-emphasis hover:bg-subtle/30">
                  <input
                    type="checkbox"
                    checked={days
                      .filter((d) => d !== copyModal.sourceDay)
                      .every((d) => copyModal.selectedDays.includes(d))}
                    onChange={toggleCopySelectAll}
                  />
                  <span>Select all</span>
                </label>
                {days
                  .filter((d) => d !== copyModal.sourceDay)
                  .map((day) => (
                    <label
                      key={day}
                      className="flex items-center gap-2 rounded-md px-2 py-1 text-sm text-emphasis hover:bg-subtle/30"
                    >
                      <input
                        type="checkbox"
                        checked={copyModal.selectedDays.includes(day)}
                        onChange={() => toggleCopyDay(day)}
                      />
                      <span>{day}</span>
                    </label>
                  ))}
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 bg-muted/20 px-5 py-4">
              <button type="button" className="btn-secondary" onClick={closeCopyModal}>
                Cancel
              </button>
              <button type="button" className="btn-primary" onClick={applyCopyTimes}>
                Apply
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
