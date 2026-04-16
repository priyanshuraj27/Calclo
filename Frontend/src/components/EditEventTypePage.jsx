import React, { useState, useEffect, useRef, useMemo } from "react";
import { Icon } from "./Icon";
import { Switch } from "./Switch";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import { apiData } from "../api/client.js";
import { summarizeDays, summarizeTime } from "../api/scheduleMappers.js";
import { buildDurationOptionsPayload } from "../utils/eventTypeDuration.js";

// ─── Sub-Components ─────────────────────────────────────────────────────────


const SidebarItem = ({ active, icon, label, sublabel, onClick }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center justify-between p-3 rounded-lg text-left transition-all duration-150 group mb-0.5 ${
      active 
        ? "bg-subtle/50 text-emphasis shadow-sm" 
        : "text-subtle hover:bg-subtle/20 hover:text-emphasis"
    }`}
  >
    <div className="flex items-center gap-3 pr-2 min-w-0">
      <Icon name={icon} className={`h-4 w-4 shrink-0 ${active ? "text-emphasis" : "text-subtle group-hover:text-emphasis"}`} />
      <div className="min-w-0">
        <p className={`text-[13px] font-semibold leading-tight truncate ${active ? "text-emphasis" : "text-default"}`}>{label}</p>
        <p className={`text-[11px] mt-1.5 truncate ${active ? "text-subtle" : "text-muted"}`}>{sublabel}</p>
      </div>
    </div>
    <Icon name="chevron-right" className={`h-3.5 w-3.5 transition-opacity duration-200 ${active ? "opacity-100 text-subtle" : "opacity-0 group-hover:opacity-40"}`} />
  </button>
);

const SectionHeader = ({ title }) => (
  <h2 className="text-sm font-semibold text-emphasis mb-4">{title}</h2>
);

const InputField = ({ label, value, onChange, placeholder, suffix }) => (
  <div className="space-y-2">
    <label className="text-sm font-semibold text-emphasis block">{label}</label>
    <div className="relative">
      <input 
        type="text" 
        value={value} 
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-transparent border border-subtle rounded-lg px-4 py-2 text-sm focus:ring-1 focus:ring-emphasis focus:border-emphasis outline-none transition-all placeholder:text-muted"
        placeholder={placeholder}
      />
      {suffix && (
        <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none text-sm text-subtle">
          {suffix}
        </div>
      )}
    </div>
  </div>
);

const SettingsToggle = ({ title, description, checked, onChange }) => (
  <div className="flex items-start justify-between py-1">
    <div className="space-y-0.5">
       <p className="text-sm font-semibold text-emphasis">{title}</p>
       <p className="text-xs text-subtle leading-normal max-w-[440px]">{description}</p>
    </div>
    <Switch checked={checked} onChange={onChange} />
  </div>
);

/** Location options (UI only — not persisted to the API). */
const LOCATION_TYPES = [
  { value: "cal-video", label: "Cal Video (Default)", icon: "video" },
  { value: "google-meet", label: "Google Meet", icon: "video" },
  { value: "zoom", label: "Zoom", icon: "video" },
  { value: "phone", label: "Phone call", icon: "phone" },
  { value: "in-person", label: "In-person meeting", icon: "users" },
  { value: "custom-link", label: "Custom link", icon: "link" },
];

function locationTypeIcon(value) {
  return LOCATION_TYPES.find((t) => t.value === value)?.icon || "video";
}

function newExtraLocation() {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    type: "google-meet",
    phone: "",
    address: "",
    link: "",
    notes: "",
  };
}

/**
 * Custom location picker — native <select> option menus ignore dark theme
 * on many browsers; this uses theme tokens so light/dark both read well.
 */
function LocationTypeSelect({ value, onChange, instanceId, ariaLabel }) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);
  const listId = `${instanceId}-listbox`;

  useEffect(() => {
    if (!open) return;
    const onDocMouseDown = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    const onKey = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDocMouseDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocMouseDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const selected =
    LOCATION_TYPES.find((t) => t.value === value) || LOCATION_TYPES[0];

  return (
    <div className="relative min-w-0 flex-1" ref={wrapRef}>
      <button
        type="button"
        aria-label={ariaLabel || "Location type"}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        className="flex w-full min-w-0 items-center justify-between gap-2 rounded-md px-1 py-0.5 text-left text-sm font-medium text-emphasis outline-none transition hover:bg-subtle/40 focus-visible:ring-2 focus-visible:ring-emphasis/50"
        onClick={() => setOpen((o) => !o)}
      >
        <span className="truncate">{selected.label}</span>
        <Icon
          name="chevron-down"
          className={`h-4 w-4 shrink-0 text-subtle transition-transform duration-150 ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open ? (
        <ul
          id={listId}
          role="listbox"
          className="absolute left-0 right-0 top-full z-[60] mt-1 max-h-[min(280px,50vh)] overflow-y-auto rounded-lg border py-1 shadow-xl"
          style={{
            backgroundColor: "var(--cal-bg)",
            borderColor: "var(--cal-border)",
            color: "var(--cal-text-emphasis)",
          }}
        >
          {LOCATION_TYPES.map((opt) => {
            const isActive = opt.value === value;
            return (
              <li key={opt.value} role="none">
                <button
                  type="button"
                  role="option"
                  aria-selected={isActive}
                  className={`flex w-full items-center gap-2.5 px-3 py-2.5 text-left text-sm transition-colors ${
                    isActive
                      ? "bg-[var(--cal-bg-subtle)] font-semibold text-[var(--cal-text-emphasis)]"
                      : "text-[var(--cal-text)] hover:bg-[var(--cal-bg-muted)]"
                  }`}
                  onClick={() => {
                    onChange(opt.value);
                    setOpen(false);
                  }}
                >
                  <Icon
                    name={opt.icon}
                    className="h-4 w-4 shrink-0 text-[var(--cal-text-subtle)]"
                  />
                  <span className="min-w-0 flex-1 truncate">{opt.label}</span>
                  {isActive ? (
                    <Icon name="check" className="h-4 w-4 shrink-0 text-emphasis" />
                  ) : null}
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

const isPersistedId = (id) => {
  const value = String(id || "").trim();
  return value.length > 0 && value !== "new" && value !== "undefined";
};

export function EditEventTypePage({
  onNavigate,
  title: initialTitle,
  initialSlug,
  initialDescription,
  initialDuration,
  initialDurationOptionsText,
  eventTypeId,
}) {
  const [title, setTitle] = useState(initialTitle || "15 Min Meeting");
  const [slug, setSlug] = useState(
    initialSlug || (initialTitle || "15 Min Meeting").toLowerCase().replace(/ /g, "-")
  );
  const [duration, setDuration] = useState(Number(initialDuration) || 15);
  const [durationOptionsText, setDurationOptionsText] = useState(
    initialDurationOptionsText || ""
  );
  const [description, setDescription] = useState(initialDescription || "");
  const [activeTab, setActiveTab] = useState("basics");
  const [enabled, setEnabled] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hostSlug, setHostSlug] = useState(
    import.meta.env.VITE_DEFAULT_HOST_USERNAME || "priyanshu"
  );
  const skipPersist = useRef(true);

  const [locationType, setLocationType] = useState("cal-video");
  const [locationPhone, setLocationPhone] = useState("");
  const [locationAddress, setLocationAddress] = useState("");
  const [locationLink, setLocationLink] = useState("");
  const [locationNotes, setLocationNotes] = useState("");
  const [locationPasscode, setLocationPasscode] = useState("");
  const [locationAdvancedOpen, setLocationAdvancedOpen] = useState(false);
  const [extraLocations, setExtraLocations] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [availabilityScheduleId, setAvailabilityScheduleId] = useState("");
  const [scheduleMenuOpen, setScheduleMenuOpen] = useState(false);
  const scheduleMenuRef = useRef(null);

  const [parent] = useAutoAnimate();

  const resetPrimaryLocation = () => {
    setLocationType("cal-video");
    setLocationPhone("");
    setLocationAddress("");
    setLocationLink("");
    setLocationNotes("");
    setLocationPasscode("");
  };

  useEffect(() => {
    apiData("/api/v1/users/current-user")
      .then((u) => setHostSlug(u.username))
      .catch(() => {});
  }, []);

  useEffect(() => {
    let cancelled = false;
    apiData("/api/v1/schedules")
      .then((rows) => {
        if (!cancelled) setSchedules(Array.isArray(rows) ? rows : []);
      })
      .catch(() => {
        if (!cancelled) setSchedules([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!schedules.length || isPersistedId(eventTypeId)) return;
    setAvailabilityScheduleId((prev) => {
      if (prev) return prev;
      const def = schedules.find((s) => s.isDefault) || schedules[0];
      return def?._id ? String(def._id) : "";
    });
  }, [schedules, eventTypeId]);

  useEffect(() => {
    if (!schedules.length || !availabilityScheduleId) return;
    const ok = schedules.some(
      (s) => String(s._id) === String(availabilityScheduleId)
    );
    if (ok) return;
    const def = schedules.find((s) => s.isDefault) || schedules[0];
    if (def?._id) setAvailabilityScheduleId(String(def._id));
  }, [schedules, availabilityScheduleId]);

  useEffect(() => {
    if (!scheduleMenuOpen) return;
    const onDocMouseDown = (e) => {
      if (scheduleMenuRef.current && !scheduleMenuRef.current.contains(e.target)) {
        setScheduleMenuOpen(false);
      }
    };
    const onKey = (e) => {
      if (e.key === "Escape") setScheduleMenuOpen(false);
    };
    document.addEventListener("mousedown", onDocMouseDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocMouseDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [scheduleMenuOpen]);

  useEffect(() => {
    if (!isPersistedId(eventTypeId)) {
      skipPersist.current = false;
      return;
    }
    skipPersist.current = true;
    let cancelled = false;
    (async () => {
      try {
        const doc = await apiData(`/api/v1/event-types/${eventTypeId}`);
        if (cancelled) return;
        setTitle(doc.title || "");
        setSlug(doc.slug || "");
        setDuration(Number(doc.durationMinutes) || 15);
        const baseM = Number(doc.durationMinutes) || 15;
        const opts = Array.isArray(doc.durationOptions)
          ? doc.durationOptions.map(Number).filter((n) => Number.isFinite(n))
          : [];
        const extras = opts.filter((n) => n !== baseM);
        setDurationOptionsText(extras.join(", "));
        setDescription(doc.description || "");
        setEnabled(!doc.hidden);
        const schedRef = doc.availabilityScheduleId;
        const sid =
          schedRef && typeof schedRef === "object"
            ? schedRef._id
            : doc.availabilityScheduleId;
        if (sid) setAvailabilityScheduleId(String(sid));
        queueMicrotask(() => {
          skipPersist.current = false;
        });
      } catch {
        skipPersist.current = false;
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [eventTypeId]);

  useEffect(() => {
    if (!isPersistedId(eventTypeId)) return;
    if (skipPersist.current) return;
    const t = setTimeout(() => {
      const patch = {
        title,
        slug,
        durationMinutes: Number(duration) || 15,
        description,
        hidden: !enabled,
        durationOptions: buildDurationOptionsPayload(duration, durationOptionsText),
      };
      if (isPersistedId(availabilityScheduleId)) {
        patch.availabilityScheduleId = availabilityScheduleId;
      }
      apiData(`/api/v1/event-types/${eventTypeId}`, {
        method: "PATCH",
        json: patch,
      }).catch(() => {});
    }, 700);
    return () => clearTimeout(t);
  }, [
    title,
    slug,
    duration,
    description,
    enabled,
    eventTypeId,
    availabilityScheduleId,
    durationOptionsText,
  ]);

  const persistEventType = async () => {
    const payload = {
      title: (title || "").trim(),
      slug: (slug || "").trim(),
      durationMinutes: Number(duration) || 15,
      description,
      hidden: !enabled,
      durationOptions: buildDurationOptionsPayload(duration, durationOptionsText),
    };

    if (!payload.title || !payload.slug) {
      throw new Error("Title and slug are required");
    }

    let scheduleId = availabilityScheduleId;
    if (!isPersistedId(scheduleId)) {
      const def = schedules.find((s) => s.isDefault) || schedules[0];
      scheduleId = def?._id ? String(def._id) : "";
    }
    if (!isPersistedId(scheduleId)) {
      throw new Error(
        "Add an availability schedule first (sidebar → Availability), then try again."
      );
    }

    if (isPersistedId(eventTypeId)) {
      await apiData(`/api/v1/event-types/${eventTypeId}`, {
        method: "PATCH",
        json: { ...payload, availabilityScheduleId: scheduleId },
      });
      return { id: eventTypeId, created: false };
    }

    const created = await apiData("/api/v1/event-types", {
      method: "POST",
      json: {
        ...payload,
        active: true,
        availabilityScheduleId: scheduleId,
      },
    });
    return { id: created?._id, created: true };
  };

  const handleSave = async () => {
    if (isSaving) return;
    setIsSaving(true);
    try {
      await persistEventType();
      onNavigate("/event-types");
    } catch (error) {
      console.error("[EditEventTypePage] Save failed:", error);
      window.alert(error?.message || "Failed to save event type");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!isPersistedId(eventTypeId)) {
      onNavigate("/event-types");
      return;
    }
    if (!window.confirm("Delete this event type?")) return;
    try {
      await apiData(`/api/v1/event-types/${eventTypeId}`, { method: "DELETE" });
      onNavigate("/event-types");
    } catch (error) {
      console.error("[EditEventTypePage] Delete failed:", error);
      window.alert(error?.message || "Failed to delete event type");
    }
  };

  const selectedSchedule = useMemo(
    () => schedules.find((s) => String(s._id) === String(availabilityScheduleId)),
    [schedules, availabilityScheduleId]
  );

  const sortedSchedules = useMemo(
    () =>
      [...schedules].sort((a, b) => {
        if (Boolean(a.isDefault) !== Boolean(b.isDefault)) {
          return a.isDefault ? -1 : 1;
        }
        return String(a.name || "").localeCompare(String(b.name || ""));
      }),
    [schedules]
  );

  const getScheduleSummaryLine = (schedule) => {
    if (!schedule?.weeklyRules) return "No hours set";
    const days = summarizeDays(schedule.weeklyRules);
    const time = summarizeTime(schedule.weeklyRules);
    return time ? `${days} · ${time}` : days;
  };

  const scheduleSummaryLine = useMemo(
    () => getScheduleSummaryLine(selectedSchedule),
    [selectedSchedule]
  );

  const sidebarItems = [
    { id: "basics", label: "Basics", sublabel: `${duration} mins`, icon: "link" },
    {
      id: "availability",
      label: "Availability",
      sublabel: selectedSchedule?.name || "Weekly hours",
      icon: "calendar",
    },
    { id: "limits", label: "Limits", sublabel: "How often you can be booked", icon: "clock" },
    { id: "advanced", label: "Advanced", sublabel: "Calendar settings & more...", icon: "layers" },
    { id: "recurring", label: "Recurring", sublabel: "Set up a repeating schedule", icon: "refresh-cw" },
    { id: "apps", label: "Apps", sublabel: "0 apps, 0 active", icon: "grid-3x3" },
    { id: "workflows", label: "Workflows", sublabel: "0 active", icon: "zap" },
    { id: "webhooks", label: "Webhooks", sublabel: "0 active", icon: "webhook" },
  ];

  return (
    <div className="flex flex-col h-full -m-2 sm:-m-4 lg:-m-6 bg-default text-default overflow-hidden">
      {/* ── Top Header ──────────────────────────────────────── */}
      <div className="bg-default border-b border-subtle px-4 py-3 flex items-center justify-between z-40 transition-all duration-200 sticky top-0">
        <div className="flex items-center gap-3 sm:gap-4 min-w-0">
          <button 
            onClick={() => onNavigate("/event-types")}
            className="p-1.5 sm:p-2 hover:bg-subtle rounded-md text-subtle transition-colors"
          >
            <Icon name="arrow-left" className="h-4 w-4" />
          </button>
          <div className="min-w-0">
            <h1 className="text-sm sm:text-lg font-bold text-emphasis truncate">{title}</h1>
            <p className="text-[10px] sm:text-xs text-subtle font-medium truncate">cal.com/{hostSlug}/{slug}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          <div className="flex items-center gap-1 sm:gap-4 pr-2 sm:pr-3 mr-0 sm:mr-1 border-r border-subtle">
             <div className="hidden xs:flex items-center border-r border-subtle pr-2 sm:pr-4 mr-1 sm:mr-2">
                <Switch checked={enabled} onChange={setEnabled} />
             </div>
             <button
               type="button"
               onClick={() => onNavigate(`/book/${hostSlug}/${encodeURIComponent(slug)}`)}
               className="p-2 hover:bg-subtle rounded-md text-subtle hover:text-emphasis transition group"
               title="Preview"
             >
               <Icon name="external-link" className="h-[18px] w-[18px]" />
             </button>
             <button
               type="button"
               onClick={() => {
                 const url = `${window.location.origin}/book/${hostSlug}/${encodeURIComponent(slug)}`;
                 navigator.clipboard?.writeText(url);
               }}
               className="hidden sm:block p-2 hover:bg-subtle rounded-md text-subtle hover:text-emphasis transition"
               title="Copy link"
             >
               <Icon name="link" className="h-[18px] w-[18px]" />
             </button>
             <button
               type="button"
               onClick={handleDelete}
               className="p-2 hover:bg-subtle rounded-md text-subtle hover:text-red-500 transition"
               title="Delete"
             >
               <Icon name="trash" className="h-[18px] w-[18px]" />
             </button>
          </div>
          <button
            type="button"
            onClick={handleSave}
            className={`btn-primary px-4 py-1.5 h-9 ${isSaving ? "opacity-70" : ""}`}
          >
            {isSaving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>

      <div className="flex border-b border-subtle overflow-x-auto lg:hidden no-scrollbar bg-default sticky top-[57px] z-30">
        <div className="flex px-2 py-2">
          {sidebarItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex-shrink-0 px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${
                activeTab === item.id 
                  ? "bg-subtle/50 text-emphasis" 
                  : "text-subtle hover:bg-subtle/20"
              }`}
            >
              <div className="flex items-center gap-2">
                <Icon name={item.icon} className="h-4 w-4" />
                <span>{item.label}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* ── Vertical Sidebar ────────────────────────────────── */}
        <aside className="w-[300px] border-r border-subtle p-4 overflow-y-auto hidden lg:block bg-default">
          <div className="space-y-1">
            {sidebarItems.map((item) => (
              <SidebarItem
                key={item.id}
                icon={item.icon}
                label={item.label}
                sublabel={item.sublabel}
                active={activeTab === item.id}
                onClick={() => setActiveTab(item.id)}
              />
            ))}
          </div>
        </aside>

        {/* ── Main Content Area ───────────────────────────────── */}
        <main className="flex-1 overflow-y-auto bg-muted/20 p-6 sm:p-8 lg:p-12 scroll-smooth">
          <div className="max-w-4xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-500" ref={parent}>
            
            {/* ── Basics Tab ──────────────────────────────────── */}
            {activeTab === "basics" && (
              <div className="space-y-8">
                <InputField 
                    label="Title" 
                    value={title} 
                    onChange={setTitle} 
                    placeholder="e.g. Quick Chat" 
                />

                <div className="space-y-2">
                   <label className="text-sm font-semibold text-emphasis block">Description</label>
                   <div className="border border-subtle rounded-lg overflow-hidden bg-default shadow-sm">
                      <div className="flex items-center gap-1 p-2 border-b border-subtle bg-muted/10">
                         <div className="px-2 py-1 flex items-center gap-1.5 text-xs font-medium text-subtle hover:bg-subtle rounded cursor-pointer">
                            Normal <Icon name="chevron-down" className="h-3 w-3" />
                         </div>
                         <div className="h-4 w-[1px] bg-subtle mx-1" />
                         <button className="p-1.5 hover:bg-subtle rounded text-subtle transition"><Icon name="bold" className="h-3.5 w-3.5" /></button>
                         <button className="p-1.5 hover:bg-subtle rounded text-subtle transition"><Icon name="italic" className="h-3.5 w-3.5" /></button>
                         <button className="p-1.5 hover:bg-subtle rounded text-subtle transition"><Icon name="link" className="h-3.5 w-3.5" /></button>
                      </div>
                      <textarea 
                        className="w-full bg-transparent p-4 min-h-[120px] text-sm outline-none resize-none"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                      />
                   </div>
                </div>

                <div className="space-y-2">
                   <label className="text-sm font-semibold text-emphasis block">URL</label>
                   <div className="flex rounded-lg border border-subtle bg-subtle overflow-hidden focus-within:ring-1 focus-within:ring-emphasis group transition-all shadow-sm">
                      <span className="px-4 py-2.5 text-sm text-subtle bg-muted/20 border-r border-subtle whitespace-nowrap">
                        cal.com/{hostSlug}/
                      </span>
                      <input 
                        type="text" 
                        className="flex-1 bg-transparent px-4 py-2.5 text-sm outline-none font-medium" 
                        value={slug}
                        onChange={(e) => setSlug(e.target.value)}
                      />
                   </div>
                </div>

                <div className="pt-6 border-t border-subtle space-y-6">
                  <InputField
                    label="Duration"
                    value={String(duration)}
                    onChange={(v) => setDuration(Number(v) || 0)}
                    suffix="Minutes"
                  />
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-emphasis block">
                      Extra lengths bookers can choose (minutes)
                    </label>
                    <input
                      type="text"
                      value={durationOptionsText}
                      onChange={(e) => setDurationOptionsText(e.target.value)}
                      placeholder="e.g. 30, 45, 60"
                      className="w-full bg-transparent border border-subtle rounded-lg px-4 py-2 text-sm focus:ring-1 focus:ring-emphasis focus:border-emphasis outline-none transition-all placeholder:text-muted"
                    />
                    <p className="text-xs text-subtle leading-relaxed">
                      Optional. The default length is the field above; add comma-separated values so
                      guests can pick a different meeting length when booking. Leave empty for a
                      single fixed length.
                    </p>
                  </div>
                </div>

                <div className="pt-6 border-t border-subtle space-y-6">
                   <SectionHeader title="Location" />
                   <p className="text-xs text-subtle -mt-2">
                     Where this event takes place. (Shown in the editor only — not saved to the server yet.)
                   </p>

                   <div className="flex items-center gap-3 p-3 bg-default border border-subtle rounded-lg focus-within:border-emphasis transition shadow-sm">
                      <div className="p-1.5 bg-subtle rounded border border-subtle shrink-0">
                         <Icon name={locationTypeIcon(locationType)} className="h-4 w-4 text-subtle" />
                      </div>
                      <LocationTypeSelect
                        instanceId="location-primary"
                        ariaLabel="Primary meeting location"
                        value={locationType}
                        onChange={setLocationType}
                      />
                      <button
                        type="button"
                        title="Reset primary location"
                        className="p-1.5 rounded-md text-subtle hover:text-red-500 hover:bg-subtle/50 transition shrink-0"
                        onClick={resetPrimaryLocation}
                      >
                         <Icon name="trash" className="h-4 w-4" />
                      </button>
                   </div>

                   <div className="space-y-3">
                      {locationType === "phone" && (
                        <InputField
                          label="Phone number"
                          value={locationPhone}
                          onChange={setLocationPhone}
                          placeholder="e.g. +1 555 0100"
                        />
                      )}
                      {locationType === "in-person" && (
                        <div className="space-y-2">
                          <label className="text-sm font-semibold text-emphasis block">
                            Address or venue
                          </label>
                          <textarea
                            className="w-full bg-transparent border border-subtle rounded-lg px-4 py-2 text-sm min-h-[88px] outline-none focus:ring-1 focus:ring-emphasis resize-none placeholder:text-muted"
                            value={locationAddress}
                            onChange={(e) => setLocationAddress(e.target.value)}
                            placeholder="Building name, room, floor, city…"
                          />
                        </div>
                      )}
                      {locationType === "custom-link" && (
                        <InputField
                          label="Meeting link"
                          value={locationLink}
                          onChange={setLocationLink}
                          placeholder="https://…"
                        />
                      )}
                      {(locationType === "cal-video" ||
                        locationType === "google-meet" ||
                        locationType === "zoom") && (
                        <p className="text-xs text-subtle leading-relaxed">
                          {locationType === "google-meet" &&
                            "Guests typically get a Google Meet link on the calendar invite once scheduling apps are connected."}
                          {locationType === "zoom" &&
                            "Use Zoom for this event; meeting URLs can be created automatically when Zoom is installed."}
                          {locationType === "cal-video" &&
                            "Built-in Cal Video for this event type."}
                        </p>
                      )}
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-emphasis block">
                          Instructions for guests (optional)
                        </label>
                        <textarea
                          className="w-full bg-transparent border border-subtle rounded-lg px-4 py-2 text-sm min-h-[72px] outline-none focus:ring-1 focus:ring-emphasis resize-none placeholder:text-muted"
                          value={locationNotes}
                          onChange={(e) => setLocationNotes(e.target.value)}
                          placeholder="Dial-in, parking, what to bring…"
                        />
                      </div>
                   </div>

                   <button
                      type="button"
                      className={`flex items-center justify-between w-full text-left py-2 rounded-lg px-1 -mx-1 hover:bg-subtle/20 transition ${locationAdvancedOpen ? "text-emphasis" : ""}`}
                      onClick={() => setLocationAdvancedOpen((o) => !o)}
                   >
                      <span className="text-sm font-medium text-emphasis">Show advanced settings</span>
                      <Icon
                        name={locationAdvancedOpen ? "chevron-up" : "chevron-down"}
                        className="h-4 w-4 text-subtle shrink-0"
                      />
                   </button>
                   {locationAdvancedOpen && (
                      <div className="space-y-2 pl-0.5 animate-in fade-in duration-150">
                        <InputField
                          label="Meeting ID / passcode (optional)"
                          value={locationPasscode}
                          onChange={setLocationPasscode}
                          placeholder="Shown to guests in the booking details"
                        />
                      </div>
                   )}

                   {extraLocations.map((loc) => (
                      <div
                        key={loc.id}
                        className="rounded-xl border border-subtle bg-muted/5 p-4 space-y-3 shadow-sm"
                      >
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 bg-subtle rounded border border-subtle shrink-0">
                            <Icon name={locationTypeIcon(loc.type)} className="h-4 w-4 text-subtle" />
                          </div>
                          <LocationTypeSelect
                            instanceId={`location-extra-${loc.id}`}
                            ariaLabel="Additional meeting location"
                            value={loc.type}
                            onChange={(next) =>
                              setExtraLocations((prev) =>
                                prev.map((x) =>
                                  x.id === loc.id ? { ...x, type: next } : x
                                )
                              )
                            }
                          />
                          <button
                            type="button"
                            title="Remove this location"
                            className="p-1.5 rounded-md text-subtle hover:text-red-500 hover:bg-subtle/50 transition shrink-0"
                            onClick={() =>
                              setExtraLocations((prev) => prev.filter((x) => x.id !== loc.id))
                            }
                          >
                            <Icon name="trash" className="h-4 w-4" />
                          </button>
                        </div>
                        {loc.type === "phone" && (
                          <InputField
                            label="Phone number"
                            value={loc.phone}
                            onChange={(v) =>
                              setExtraLocations((prev) =>
                                prev.map((x) => (x.id === loc.id ? { ...x, phone: v } : x))
                              )
                            }
                            placeholder="e.g. +1 555 0100"
                          />
                        )}
                        {loc.type === "in-person" && (
                          <div className="space-y-2">
                            <label className="text-sm font-semibold text-emphasis block">
                              Address or venue
                            </label>
                            <textarea
                              className="w-full bg-transparent border border-subtle rounded-lg px-4 py-2 text-sm min-h-[72px] outline-none resize-none"
                              value={loc.address}
                              onChange={(e) =>
                                setExtraLocations((prev) =>
                                  prev.map((x) =>
                                    x.id === loc.id ? { ...x, address: e.target.value } : x
                                  )
                                )
                              }
                              placeholder="Building, room, city…"
                            />
                          </div>
                        )}
                        {loc.type === "custom-link" && (
                          <InputField
                            label="Meeting link"
                            value={loc.link}
                            onChange={(v) =>
                              setExtraLocations((prev) =>
                                prev.map((x) => (x.id === loc.id ? { ...x, link: v } : x))
                              )
                            }
                            placeholder="https://…"
                          />
                        )}
                        <div className="space-y-2">
                          <label className="text-sm font-semibold text-emphasis block">
                            Notes (optional)
                          </label>
                          <textarea
                            className="w-full bg-transparent border border-subtle rounded-lg px-4 py-2 text-sm min-h-[56px] outline-none resize-none"
                            value={loc.notes}
                            onChange={(e) =>
                              setExtraLocations((prev) =>
                                prev.map((x) =>
                                  x.id === loc.id ? { ...x, notes: e.target.value } : x
                                )
                              )
                            }
                            placeholder="Extra details for this option…"
                          />
                        </div>
                      </div>
                   ))}

                   <button
                      type="button"
                      className="flex items-center gap-2 text-sm font-bold text-emphasis py-1 hover:underline group"
                      onClick={() => setExtraLocations((prev) => [...prev, newExtraLocation()])}
                   >
                      <div className="p-1 bg-subtle border border-subtle rounded group-hover:border-emphasis transition">
                        <Icon name="plus" className="h-3 w-3" />
                      </div>
                      Add a location
                   </button>

                   <div className="text-xs text-subtle pt-2 border-t border-subtle/50">
                      Can&apos;t find the right conferencing app? Visit our{" "}
                      <span className="text-emphasis font-semibold hover:underline cursor-pointer">
                        App Store
                      </span>
                      .
                   </div>
                </div>
              </div>
            )}

            {/* ── Availability Tab ────────────────────────────── */}
            {activeTab === "availability" && (
              <div className="space-y-8 animate-in fade-in slide-in-from-right-1">
                <div className="space-y-3">
                  <SectionHeader title="Availability" />
                  <p className="text-sm text-subtle leading-relaxed max-w-xl">
                    Public booking slots use the <strong className="text-emphasis">weekly days and hours</strong>{" "}
                    from the schedule you attach here, in that schedule&apos;s{" "}
                    <strong className="text-emphasis">timezone</strong>. Edit the schedule itself from{" "}
                    <strong className="text-emphasis">Availability</strong> in the sidebar.
                  </p>
                </div>

                <div className="space-y-4">
                  <label className="text-sm font-semibold text-emphasis block">
                    Schedule for this event type
                  </label>
                  {schedules.length === 0 ? (
                    <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-emphasis">
                      No schedules yet. Create one under{" "}
                      <button
                        type="button"
                        className="font-bold underline underline-offset-2"
                        onClick={() => onNavigate("/availability/new")}
                      >
                        Availability → New
                      </button>
                      .
                    </div>
                  ) : (
                    <div className="space-y-3" ref={scheduleMenuRef}>
                      <button
                        type="button"
                        className="flex w-full items-center justify-between gap-3 rounded-lg border border-subtle bg-default p-3 shadow-sm transition hover:border-emphasis"
                        onClick={() => setScheduleMenuOpen((o) => !o)}
                        aria-haspopup="listbox"
                        aria-expanded={scheduleMenuOpen}
                        aria-label="Availability schedule"
                      >
                        <div className="min-w-0 flex items-center gap-3">
                          <Icon name="calendar" className="h-4 w-4 shrink-0 text-subtle" />
                          <div className="min-w-0 text-left">
                            <p className="truncate text-sm font-semibold text-emphasis">
                              {selectedSchedule?.name || "Choose schedule"}
                              {selectedSchedule?.isDefault ? " (default)" : ""}
                            </p>
                            <p className="truncate text-xs text-subtle">
                              {selectedSchedule?.timezone || "Timezone unavailable"}
                            </p>
                          </div>
                        </div>
                        <Icon
                          name="chevron-down"
                          className={`h-4 w-4 shrink-0 text-subtle transition-transform ${scheduleMenuOpen ? "rotate-180" : ""}`}
                        />
                      </button>

                      {scheduleMenuOpen ? (
                        <div
                          role="listbox"
                          className="z-20 max-h-72 overflow-y-auto rounded-xl border border-subtle bg-default p-1 shadow-xl"
                        >
                          {sortedSchedules.map((s) => {
                            const isActive =
                              String(s._id) === String(availabilityScheduleId);
                            return (
                              <button
                                key={s._id}
                                type="button"
                                role="option"
                                aria-selected={isActive}
                                className={`mb-1 w-full rounded-lg px-3 py-2 text-left transition last:mb-0 ${
                                  isActive
                                    ? "bg-subtle/60"
                                    : "hover:bg-subtle/30"
                                }`}
                                onClick={() => {
                                  setAvailabilityScheduleId(String(s._id));
                                  setScheduleMenuOpen(false);
                                }}
                              >
                                <div className="flex items-center justify-between gap-2">
                                  <p className="truncate text-sm font-semibold text-emphasis">
                                    {s.name}
                                    {s.isDefault ? " (default)" : ""}
                                  </p>
                                  {isActive ? (
                                    <Icon name="check" className="h-4 w-4 shrink-0 text-emphasis" />
                                  ) : null}
                                </div>
                                <p className="mt-0.5 truncate text-xs text-subtle">
                                  {getScheduleSummaryLine(s)} · {s.timezone || "UTC"}
                                </p>
                              </button>
                            );
                          })}
                        </div>
                      ) : null}
                    </div>
                  )}
                </div>

                {selectedSchedule ? (
                  <div className="rounded-xl border border-subtle bg-default p-6 space-y-3 shadow-sm">
                    <div className="flex flex-wrap items-center gap-2 text-sm">
                      <span className="font-bold text-emphasis">{selectedSchedule.name}</span>
                      {selectedSchedule.isDefault ? (
                        <span className="rounded-md bg-subtle px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-subtle">
                          Default schedule
                        </span>
                      ) : null}
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-sm text-subtle">
                      <span className="inline-flex items-center gap-1.5">
                        <Icon name="clock" className="h-4 w-4" />
                        {scheduleSummaryLine || "No hours set"}
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <Icon name="globe" className="h-4 w-4" />
                        {selectedSchedule.timezone || "UTC"}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2 pt-2">
                      <button
                        type="button"
                        className="btn-primary px-4 py-2 text-sm"
                        onClick={() =>
                          onNavigate(`/availability/${selectedSchedule._id}`)
                        }
                      >
                        Edit days &amp; hours
                      </button>
                      <button
                        type="button"
                        className="btn-secondary px-4 py-2 text-sm"
                        onClick={() => onNavigate("/availability")}
                      >
                        All schedules
                      </button>
                    </div>
                  </div>
                ) : null}
              </div>
            )}

            {/* ── Limits Tab ──────────────────────────────────── */}
            {activeTab === "limits" && (
              <div className="space-y-8 animate-in fade-in slide-in-from-right-1">
                 <div className="bg-default border border-subtle rounded-xl p-8 space-y-8 shadow-sm">
                    <SectionHeader title="Booking Limits" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                       <InputField label="Max bookings per day" suffix="Bookings" placeholder="No limit" />
                       <InputField label="Max bookings per week" suffix="Bookings" placeholder="No limit" />
                    </div>

                    <div className="pt-8 border-t border-subtle">
                       <SectionHeader title="Notice Period" />
                       <InputField label="Minimum notice period" suffix="Minutes" placeholder="e.g. 120" />
                    </div>

                    <div className="pt-8 border-t border-subtle">
                       <SectionHeader title="Buffer Time" />
                       <div className="space-y-6">
                          <InputField label="Buffer before event" suffix="Minutes" placeholder="0" />
                          <InputField label="Buffer after event" suffix="Minutes" placeholder="0" />
                       </div>
                    </div>
                 </div>
              </div>
            )}

            {/* ── Advanced Tab ────────────────────────────────── */}
            {activeTab === "advanced" && (
              <div className="space-y-8 animate-in fade-in slide-in-from-right-1">
                 <div className="bg-default border border-subtle rounded-xl p-8 space-y-8 shadow-sm">
                    <div className="space-y-6">
                       <SettingsToggle 
                         title="Requires confirmation" 
                         description="Events will only be added to your calendar once you have confirmed them."
                         checked={false}
                         onChange={() => {}}
                       />
                       <SettingsToggle 
                         title="Hide branding" 
                         description="Hide 'Powered by Cal.com' branding on the booking page."
                         checked={false}
                         onChange={() => {}}
                       />
                       <SettingsToggle 
                         title="Private event" 
                         description="Hide this event type from your public profile page."
                         checked={false}
                         onChange={() => {}}
                       />
                    </div>

                    <div className="pt-8 border-t border-subtle">
                       <InputField label="Redirect on completion" placeholder="https://example.com/thanks" />
                    </div>
                 </div>
              </div>
            )}

            {/* ── Recurring Tab ───────────────────────────────── */}
            {activeTab === "recurring" && (
              <div className="space-y-8 animate-in fade-in slide-in-from-right-1">
                 <div className="bg-default border border-subtle rounded-xl p-8 shadow-sm text-center py-16">
                    <div className="mx-auto w-16 h-16 bg-muted/20 rounded-full flex items-center justify-center mb-6">
                       <Icon name="refresh-cw" className="h-8 w-8 text-subtle" />
                    </div>
                    <h3 className="text-base font-bold text-emphasis mb-2">Recurring events</h3>
                    <p className="text-sm text-subtle max-w-sm mx-auto mb-8 leading-relaxed">
                       Allow people to book multiple occurrences of this event type at once.
                    </p>
                    <button className="btn-primary px-6 opacity-100 cursor-pointer h-10 transition-transform active:scale-95">
                       Enable recurring events
                    </button>
                 </div>
              </div>
            )}

            {/* ── Apps Tab ────────────────────────────────────── */}
            {activeTab === "apps" && (
              <div className="space-y-8 animate-in fade-in slide-in-from-right-1">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      { name: "Google Calendar", category: "Calendar", icon: "calendar", active: true },
                      { name: "Zoom", category: "Conferencing", icon: "video", active: true },
                      { name: "Daily Video", category: "Conferencing", icon: "video", active: true },
                      { name: "Stripe", category: "Payments", icon: "credit-card", active: false },
                    ].map(app => (
                      <div key={app.name} className="p-4 bg-default border border-subtle rounded-xl flex items-center justify-between hover:border-emphasis transition cursor-pointer shadow-sm">
                         <div className="flex items-center gap-3">
                            <div className="p-2 bg-subtle rounded-lg border border-subtle">
                               <Icon name={app.icon} className="h-5 w-5 text-emphasis" />
                            </div>
                            <div>
                               <p className="text-sm font-bold text-emphasis">{app.name}</p>
                               <p className="text-[11px] text-subtle">{app.category}</p>
                            </div>
                         </div>
                         <div className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${app.active ? 'bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400' : 'bg-subtle text-subtle'}`}>
                            {app.active ? 'Active' : 'Not installed'}
                         </div>
                      </div>
                    ))}
                 </div>
                 <div className="text-center py-6">
                    <button className="text-sm font-bold text-emphasis hover:underline flex items-center justify-center gap-2 mx-auto">
                       Visit App Store
                       <Icon name="external-link" className="h-4 w-4" />
                    </button>
                 </div>
              </div>
            )}

            {/* ── Workflows Tab ───────────────────────────────── */}
            {activeTab === "workflows" && (
              <div className="space-y-8 animate-in fade-in slide-in-from-right-1 text-center py-20 bg-default border border-subtle rounded-xl shadow-sm border-dashed">
                  <div className="mx-auto w-16 h-16 bg-muted/20 rounded-full flex items-center justify-center mb-6">
                    <Icon name="zap" className="h-8 w-8 text-subtle" />
                  </div>
                  <h3 className="text-base font-bold text-emphasis mb-2">Automate your scheduling</h3>
                  <p className="text-sm text-subtle max-w-sm mx-auto mb-8 leading-relaxed">
                    Set up triggers and actions to automatically send notifications, reminders, or follow-ups.
                  </p>
                  <button className="btn-primary px-8 opacity-100 cursor-pointer h-10 transition-transform active:scale-95">
                    Create your first workflow
                  </button>
              </div>
            )}

            {/* ── Webhooks Tab ────────────────────────────────── */}
            {activeTab === "webhooks" && (
              <div className="space-y-8 animate-in fade-in slide-in-from-right-1">
                 <div className="flex items-center justify-between px-2">
                    <SectionHeader title="Webhooks" />
                    <button className="text-sm font-bold text-emphasis flex items-center gap-2 hover:underline">
                       <div className="p-1 bg-subtle border border-subtle rounded">
                          <Icon name="plus" className="h-3 w-3" />
                       </div>
                       Add webhook
                    </button>
                 </div>
                 <div className="p-12 text-center bg-default border border-subtle rounded-xl shadow-sm italic text-subtle text-sm">
                    No webhooks configured for this event type.
                 </div>
              </div>
            )}
            
          </div>
        </main>
      </div>

      {/* Floating help button simulator */}
      <div className="fixed bottom-6 right-6">
         <div className="bg-emphasis text-inverted w-12 h-12 rounded-full shadow-2xl flex items-center justify-center cursor-pointer hover:scale-110 active:scale-95 transition-all group">
            <Icon name="message-square" className="h-6 w-6 group-hover:rotate-12 transition-transform" />
            <div className="absolute right-0 bottom-full mb-3 px-3 py-1 bg-emphasis text-inverted text-xs font-bold rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-xl border border-white/10">
               Need help?
            </div>
         </div>
      </div>
    </div>
  );
}
