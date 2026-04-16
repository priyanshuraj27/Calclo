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
import { toAmPmFrom24, fromAmPmTo24 } from "../api/timeFormat.js";

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

const TIME_OPTIONS = Array.from({ length: 24 * 4 }, (_v, idx) => {
  const hours = Math.floor(idx / 4);
  const minutes = (idx % 4) * 15;
  const hm24 = `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
  return {
    value: toAmPmFrom24(hm24),
    label: toAmPmFrom24(hm24),
  };
});

const OVERRIDE_TYPE = {
  CLOSED: "CLOSED",
  CUSTOM_HOURS: "CUSTOM_HOURS",
};

const ymdLocal = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;

const monthLabel = (date) =>
  date.toLocaleDateString("en-US", { month: "long", year: "numeric" });

const formatOverrideDate = (ymd) => {
  const [y, m, d] = String(ymd).split("-").map(Number);
  const dt = new Date(y, (m || 1) - 1, d || 1);
  return dt.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
};

const formatOverrideTime = (intervals) => {
  const first = Array.isArray(intervals) ? intervals[0] : null;
  if (!first?.start || !first?.end) return "";
  return `${toAmPmFrom24(first.start)} - ${toAmPmFrom24(first.end)}`;
};

const monthGridCells = (monthDate) => {
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const first = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0).getDate();
  const startPad = first.getDay();
  const cells = [];
  for (let i = 0; i < startPad; i++) cells.push(null);
  for (let d = 1; d <= lastDay; d++) {
    cells.push(ymdLocal(new Date(year, month, d)));
  }
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
};

/**
 * Pixel-perfect replica of the Cal.com Schedule Editor page based on the provided screenshot.
 */
export function AvailabilityPage({ onNavigate, scheduleId, initialName }) {
  const [parent] = useAutoAnimate();
  const [isSaving, setIsSaving] = useState(false);
  const [title, setTitle] = useState(initialName || "Working hours");
  const [timezone, setTimezone] = useState("Europe/London");
  const [isDefault, setIsDefault] = useState(false);
  const [subtitle, setSubtitle] = useState("Mon - Fri, 9:00 AM - 5:00 PM");
  const [showBulkDefaultModal, setShowBulkDefaultModal] = useState(false);
  const [eventTypeChoices, setEventTypeChoices] = useState([]);
  const [selectedEventTypeIds, setSelectedEventTypeIds] = useState([]);
  const [isBulkUpdating, setIsBulkUpdating] = useState(false);
  const [overrides, setOverrides] = useState([]);
  const [overrideModalOpen, setOverrideModalOpen] = useState(false);
  const [overrideMonth, setOverrideMonth] = useState(() => new Date());
  const [overrideSelectedDates, setOverrideSelectedDates] = useState([]);
  const [overrideFrom, setOverrideFrom] = useState("9:00am");
  const [overrideTo, setOverrideTo] = useState("5:00pm");
  const [overrideUnavailable, setOverrideUnavailable] = useState(false);
  const [editingOverrideId, setEditingOverrideId] = useState(null);
  const [isSavingOverride, setIsSavingOverride] = useState(false);
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

  const loadOverrides = useCallback(async () => {
    if (!isPersistedId(scheduleId)) {
      setOverrides([]);
      return;
    }
    try {
      const rows = await apiData(`/api/v1/schedules/${scheduleId}/overrides`, {
        noCache: true,
      });
      setOverrides(Array.isArray(rows) ? rows : []);
    } catch {
      setOverrides([]);
    }
  }, [scheduleId]);

  useEffect(() => {
    void loadOverrides();
  }, [loadOverrides]);

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

  const redirectToAvailability = useCallback(() => {
    if (typeof window !== "undefined") {
      window.location.replace("/availability");
      return;
    }
    onNavigate("/availability");
  }, [onNavigate]);

  const handleSaveClick = async () => {
    if (isSaving) return;
    setIsSaving(true);
    if (scheduleId === "new") {
      try {
        const weeklyRules = availabilityToWeeklyRules(availability);
        await apiData("/api/v1/schedules", {
          method: "POST",
          json: {
            name: title,
            timezone,
            isDefault,
            weeklyRules,
          },
        });
        redirectToAvailability();
      } catch {
        /* keep UI */
      } finally {
        setIsSaving(false);
      }
      return;
    }
    if (!isPersistedId(scheduleId)) {
      setIsSaving(false);
      return;
    }
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
      redirectToAvailability();
    } catch {
      /* noop */
    } finally {
      setIsSaving(false);
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

  const openAddOverrideModal = () => {
    const today = new Date();
    setEditingOverrideId(null);
    setOverrideSelectedDates([ymdLocal(today)]);
    setOverrideMonth(new Date(today.getFullYear(), today.getMonth(), 1));
    setOverrideUnavailable(false);
    setOverrideFrom("9:00am");
    setOverrideTo("5:00pm");
    setOverrideModalOpen(true);
  };

  const openEditOverrideModal = (ovr) => {
    const date = String(ovr?.date || "");
    const [y, m] = date.split("-").map(Number);
    if (y && m) {
      setOverrideMonth(new Date(y, m - 1, 1));
    }
    setEditingOverrideId(String(ovr?._id || ""));
    setOverrideSelectedDates(date ? [date] : []);
    if (ovr?.type === OVERRIDE_TYPE.CLOSED) {
      setOverrideUnavailable(true);
      setOverrideFrom("9:00am");
      setOverrideTo("5:00pm");
    } else {
      const first = Array.isArray(ovr?.intervals) ? ovr.intervals[0] : null;
      setOverrideUnavailable(false);
      setOverrideFrom(toAmPmFrom24(first?.start || "09:00"));
      setOverrideTo(toAmPmFrom24(first?.end || "17:00"));
    }
    setOverrideModalOpen(true);
  };

  const closeOverrideModal = () => {
    setOverrideModalOpen(false);
    setEditingOverrideId(null);
    setOverrideSelectedDates([]);
  };

  const toggleOverrideDate = (dateStr) => {
    if (!dateStr) return;
    setOverrideSelectedDates((prev) =>
      prev.includes(dateStr) ? prev.filter((d) => d !== dateStr) : [...prev, dateStr]
    );
  };

  const saveOverride = async () => {
    if (!isPersistedId(scheduleId) || !overrideSelectedDates.length) return;
    setIsSavingOverride(true);
    try {
      const payload = overrideUnavailable
        ? { type: OVERRIDE_TYPE.CLOSED, intervals: [] }
        : {
            type: OVERRIDE_TYPE.CUSTOM_HOURS,
            intervals: [{ start: fromAmPmTo24(overrideFrom), end: fromAmPmTo24(overrideTo) }],
          };
      await Promise.all(
        overrideSelectedDates.map((date) =>
          apiData(`/api/v1/schedules/${scheduleId}/overrides`, {
            method: "POST",
            json: { date, ...payload },
          })
        )
      );
      await loadOverrides();
      closeOverrideModal();
    } catch {
      // keep modal open for retry
    } finally {
      setIsSavingOverride(false);
    }
  };

  const deleteOverrideItem = async (overrideId) => {
    if (!isPersistedId(scheduleId) || !overrideId) return;
    try {
      await apiData(`/api/v1/schedules/${scheduleId}/overrides/${overrideId}`, {
        method: "DELETE",
      });
      await loadOverrides();
    } catch {
      // noop
    }
  };

  return (
    <div className="flex flex-col h-full bg-default text-default animate-in fade-in duration-500">
      <div className="sticky top-0 z-50 flex flex-col gap-4 border-b border-subtle bg-default/80 px-3 py-4 backdrop-blur-md sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-6 sm:py-6 lg:border-none lg:px-8">
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <div className="flex min-w-0 items-center gap-2 sm:gap-3">
             <button type="button" onClick={() => onNavigate("/availability")} className="shrink-0 rounded-md p-1 text-subtle hover:bg-subtle">
               <Icon name="arrow-left" className="h-4 w-4" />
             </button>
             <input
               type="text"
               value={title}
               onChange={(e) => setTitle(e.target.value)}
               className="min-w-0 flex-1 border-b border-transparent bg-transparent font-cal text-lg font-bold leading-tight text-emphasis outline-none transition hover:border-subtle focus:border-emphasis sm:text-xl lg:text-2xl"
               aria-label="Schedule name"
             />
          </div>
          <p className="pl-8 text-xs font-medium text-subtle sm:pl-9 sm:text-sm">{subtitle}</p>
        </div>

        <div className="flex w-full flex-wrap items-center justify-between gap-3 sm:w-auto sm:justify-end">
           <div className="flex items-center gap-2 border-r border-subtle pr-3 sm:gap-3 sm:pr-4">
              <button
                type="button"
                className="hidden text-xs font-semibold text-emphasis hover:underline sm:inline sm:text-sm"
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
                className="rounded-lg border border-[#442222] bg-[#291415] p-2.5 text-[#f87171] transition hover:bg-[#3d1a1c] sm:group"
              >
                <Icon name="trash" className="h-4 w-4" />
              </button>
              <div className="mx-1 hidden h-6 w-px bg-subtle sm:block" />
              <button
                type="button"
                onClick={handleSaveClick}
                disabled={isSaving}
                className="btn-primary min-h-[36px] px-4 py-2 sm:px-5"
              >
                {isSaving ? "Saving..." : "Save"}
              </button>
           </div>
        </div>
      </div>

      <main className="flex-1 overflow-y-auto px-3 pb-28 sm:px-6 sm:pb-12 lg:px-8">
        <div className="mx-auto grid max-w-[1200px] grid-cols-1 gap-8 sm:gap-10 lg:grid-cols-[1fr_minmax(260px,320px)] lg:items-start lg:gap-12">
          
          <div className="space-y-10">
            <div className="rounded-xl border border-subtle bg-default p-3 shadow-sm sm:p-4" ref={parent}>
              {days.map(day => {
                const slots = availability[day];
                const isActive = slots && slots.length > 0;
                return (
                  <div key={day} className="group flex flex-col gap-3 border-b border-subtle py-3 last:border-b-0 sm:flex-row sm:items-start sm:gap-4 sm:border-b-0 sm:py-2.5 sm:px-2">
                    <div className="flex w-full shrink-0 items-center gap-3 sm:w-44 lg:w-48">
                       <Switch checked={isActive} onChange={() => toggleDay(day)} />
                       <span className={`text-sm font-bold ${isActive ? 'text-emphasis' : 'text-subtle'}`}>{day}</span>
                    </div>
                    
                    <div className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
                      {isActive ? (
                        <div className="flex min-w-0 flex-1 flex-col gap-2">
                          {(slots || []).map((slot, index) => (
                            <div key={`${day}-${index}`} className="flex flex-wrap items-center gap-2">
                              <div className="flex min-w-0 max-w-full flex-wrap items-center gap-2 rounded-lg border border-subtle bg-muted/30 px-2 py-1.5 text-sm sm:px-3">
                                <div className="relative">
                                  <select
                                    className="w-24 appearance-none bg-transparent pr-5 outline-none font-medium text-emphasis"
                                    style={{ colorScheme: "dark" }}
                                    value={slot?.from || "9:00am"}
                                    onChange={(e) =>
                                      updateSlotAt(day, index, "from", e.target.value)
                                    }
                                    aria-label={`${day} start time`}
                                  >
                                    {TIME_OPTIONS.map((opt) => (
                                      <option
                                        key={`from-${opt.value}`}
                                        value={opt.value}
                                        className="bg-[#141414] text-[#e5e5e5]"
                                      >
                                        {opt.label}
                                      </option>
                                    ))}
                                  </select>
                                  <Icon
                                    name="chevron-down"
                                    className="pointer-events-none absolute right-0.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-subtle"
                                  />
                                </div>
                                <span className="text-subtle">–</span>
                                <div className="relative">
                                  <select
                                    className="w-24 appearance-none bg-transparent pr-5 outline-none font-medium text-emphasis"
                                    style={{ colorScheme: "dark" }}
                                    value={slot?.to || "5:00pm"}
                                    onChange={(e) =>
                                      updateSlotAt(day, index, "to", e.target.value)
                                    }
                                    aria-label={`${day} end time`}
                                  >
                                    {TIME_OPTIONS.map((opt) => (
                                      <option
                                        key={`to-${opt.value}`}
                                        value={opt.value}
                                        className="bg-[#141414] text-[#e5e5e5]"
                                      >
                                        {opt.label}
                                      </option>
                                    ))}
                                  </select>
                                  <Icon
                                    name="chevron-down"
                                    className="pointer-events-none absolute right-0.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-subtle"
                                  />
                                </div>
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

            <div className="space-y-4 rounded-xl border border-subtle bg-default p-4 sm:p-6 lg:p-8">
               <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-emphasis">Date overrides</h3>
                  <Icon name="info" className="h-3.5 w-3.5 text-subtle" />
               </div>
               <p className="text-sm text-subtle leading-relaxed">
                 Add dates when your availability changes from your daily hours.
               </p>
               {overrides.length ? (
                 <div className="overflow-hidden rounded-lg border border-subtle">
                   {overrides.map((ovr) => (
                     <div
                       key={ovr._id}
                       className="flex flex-col gap-3 border-b border-subtle px-3 py-3 last:border-b-0 sm:flex-row sm:items-center sm:justify-between sm:px-4"
                     >
                       <div>
                         <p className="text-sm font-semibold text-emphasis">
                           {formatOverrideDate(ovr.date)}
                         </p>
                         <p className="text-sm text-subtle">
                           {ovr.type === OVERRIDE_TYPE.CLOSED
                             ? "Unavailable"
                             : formatOverrideTime(ovr.intervals)}
                         </p>
                       </div>
                       <div className="flex shrink-0 items-center justify-end gap-2 sm:justify-start">
                         <button
                           type="button"
                           className="p-2 hover:bg-subtle rounded-md text-subtle transition"
                           title="Delete override"
                           onClick={() => deleteOverrideItem(ovr._id)}
                         >
                           <Icon name="trash" className="h-4 w-4" />
                         </button>
                         <button
                           type="button"
                           className="p-2 hover:bg-subtle rounded-md text-subtle transition"
                           title="Edit override"
                           onClick={() => openEditOverrideModal(ovr)}
                         >
                           <Icon name="pencil" className="h-4 w-4" />
                         </button>
                       </div>
                     </div>
                   ))}
                 </div>
               ) : null}
               <button
                 type="button"
                 onClick={openAddOverrideModal}
                 className="flex items-center gap-2 px-4 py-2 border border-subtle rounded-lg text-sm font-bold text-emphasis hover:bg-subtle transition"
               >
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

      <div className="fixed bottom-24 right-4 z-[90] lg:bottom-6 lg:right-6">
         <button type="button" className="rounded-full bg-emphasis p-3.5 text-default shadow-2xl transition hover:scale-105 active:scale-95 sm:p-4">
            <Icon name="message-square" className="h-5 w-5 sm:h-6 sm:w-6" />
         </button>
      </div>

      {overrideModalOpen ? (
        <div className="fixed inset-0 z-[230] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/55 backdrop-blur-[1px]"
            onClick={closeOverrideModal}
          />
          <div className="relative w-full max-w-[880px] overflow-hidden rounded-2xl border border-subtle bg-[#0e0e0f] shadow-2xl">
            <div className="grid grid-cols-1 md:grid-cols-[1.15fr_1fr]">
              <div className="border-b border-subtle p-6 md:border-b-0 md:border-r">
                <h3 className="text-xl font-semibold text-emphasis">Select the dates to override</h3>
                <div className="mt-5 flex items-center justify-between">
                  <p className="text-lg font-semibold text-emphasis">{monthLabel(overrideMonth)}</p>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setOverrideMonth(
                          new Date(overrideMonth.getFullYear(), overrideMonth.getMonth() - 1, 1)
                        )
                      }
                      className="rounded-md p-1.5 text-subtle hover:bg-subtle"
                    >
                      <Icon name="chevron-left" className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setOverrideMonth(
                          new Date(overrideMonth.getFullYear(), overrideMonth.getMonth() + 1, 1)
                        )
                      }
                      className="rounded-md p-1.5 text-subtle hover:bg-subtle"
                    >
                      <Icon name="chevron-right" className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-7 gap-2 text-center text-xs font-bold uppercase text-subtle">
                  {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
                    <div key={d}>{d}</div>
                  ))}
                </div>
                <div className="mt-3 grid grid-cols-7 gap-2">
                  {monthGridCells(overrideMonth).map((cell, idx) =>
                    cell ? (
                      <button
                        key={cell}
                        type="button"
                        onClick={() => toggleOverrideDate(cell)}
                        className={`h-9 rounded-lg text-sm font-medium transition ${
                          overrideSelectedDates.includes(cell)
                            ? "bg-[#6a6a6d] text-white"
                            : "bg-transparent text-emphasis hover:bg-subtle"
                        }`}
                      >
                        {Number(cell.slice(-2))}
                      </button>
                    ) : (
                      <div key={`empty-${idx}`} className="h-9" />
                    )
                  )}
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-emphasis">Which hours are you free?</h3>
                <div className="mt-4 flex items-center gap-2 rounded-lg border border-subtle bg-muted/20 px-3 py-2">
                  <select
                    className="w-24 appearance-none bg-transparent outline-none font-medium text-emphasis"
                    style={{ colorScheme: "dark" }}
                    value={overrideFrom}
                    onChange={(e) => setOverrideFrom(e.target.value)}
                  >
                    {TIME_OPTIONS.map((opt) => (
                      <option key={`override-from-${opt.value}`} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  <span className="text-subtle">-</span>
                  <select
                    className="w-24 appearance-none bg-transparent outline-none font-medium text-emphasis"
                    style={{ colorScheme: "dark" }}
                    value={overrideTo}
                    onChange={(e) => setOverrideTo(e.target.value)}
                    disabled={overrideUnavailable}
                  >
                    {TIME_OPTIONS.map((opt) => (
                      <option key={`override-to-${opt.value}`} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
                <label className="mt-4 flex items-center gap-3 text-sm text-emphasis">
                  <Switch
                    checked={overrideUnavailable}
                    onChange={(next) => setOverrideUnavailable(Boolean(next))}
                  />
                  <span>Mark unavailable (All day)</span>
                </label>
                <div className="mt-16 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={closeOverrideModal}
                  >
                    Close
                  </button>
                  <button
                    type="button"
                    className="btn-primary"
                    onClick={saveOverride}
                    disabled={isSavingOverride || overrideSelectedDates.length === 0}
                  >
                    {isSavingOverride ? "Saving..." : editingOverrideId ? "Save override" : "Save override"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}

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
