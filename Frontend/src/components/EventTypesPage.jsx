import React, { useState, useEffect, useCallback } from "react";
import { EventTypeCard } from "./EventTypeCard";
import { Icon } from "./Icon";
import { Skeleton, SkeletonText, SkeletonButton, SkeletonAvatar } from "./Skeleton";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import { CreateEventTypeModal } from "./CreateEventTypeModal";
import { ConfirmationModal } from "./ConfirmationModal";
import { apiData } from "../api/client.js";
import { buildDurationOptionsPayload } from "../utils/eventTypeDuration.js";

function mapEventTypeForCard(doc) {
  return {
    id: doc._id,
    title: doc.title,
    slug: doc.slug,
    length: doc.durationMinutes,
    durationOptions: Array.isArray(doc.durationOptions)
      ? doc.durationOptions
      : [],
    description: doc.description || "",
    hidden: Boolean(doc.hidden),
    color: doc.color,
    schedulingType: doc.schedulingType,
    recurringEvent: null,
    requiresConfirmation: doc.requiresConfirmation,
    metadata: doc.metadata,
    seatsPerTimeSlot: doc.seatsPerTimeSlot,
    sortOrder: Number(doc.sortOrder) || 0,
  };
}

export function EventTypesPage({ onNavigate }) {
  const [eventTypes, setEventTypes] = useState([]);
  const [profile, setProfile] = useState({
    slug: "priyanshu",
    name: "",
    image: null,
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [parent] = useAutoAnimate();

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [user, types] = await Promise.all([
        apiData("/api/v1/users/current-user"),
        apiData("/api/v1/event-types"),
      ]);
      setProfile({
        slug: user.username,
        name: user.fullName,
        image: user.avatar || null,
      });
      setEventTypes((types || []).map(mapEventTypeForCard));
    } catch (e) {
      showToast(e.message || "Failed to load");
      setEventTypes([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filtered = eventTypes.filter((t) =>
    t.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const patchEventType = async (id, body) => {
    await apiData(`/api/v1/event-types/${id}`, {
      method: "PATCH",
      json: body,
    });
  };

  const swapEventTypes = async (sourceIndex, targetIndex) => {
    if (
      sourceIndex < 0 ||
      targetIndex < 0 ||
      sourceIndex >= eventTypes.length ||
      targetIndex >= eventTypes.length
    ) {
      return;
    }
    const source = eventTypes[sourceIndex];
    const target = eventTypes[targetIndex];
    if (!source || !target) return;

    const sourceOrder = Number(source.sortOrder) || sourceIndex + 1;
    const targetOrder = Number(target.sortOrder) || targetIndex + 1;

    const next = [...eventTypes];
    next[sourceIndex] = { ...target, sortOrder: sourceOrder };
    next[targetIndex] = { ...source, sortOrder: targetOrder };
    setEventTypes(next);

    try {
      await Promise.all([
        patchEventType(source.id, { sortOrder: targetOrder }),
        patchEventType(target.id, { sortOrder: sourceOrder }),
      ]);
    } catch (e) {
      showToast(e.message || "Reorder failed");
      await loadData();
    }
  };

  const handleAction = async (id, action, extra) => {
    const type = eventTypes.find((t) => t.id === id);
    if (!type) return;

    if (action === "delete") {
      setDeleteId(id);
    } else if (action === "duplicate") {
      try {
        const base = `${type.slug}-copy`.slice(0, 80);
        const slug = `${base}-${Date.now().toString(36)}`;
        await apiData("/api/v1/event-types", {
          method: "POST",
          json: {
            title: `${type.title} (Copy)`,
            slug,
            description: type.description || "",
            durationMinutes: type.length,
            ...(Array.isArray(type.durationOptions) &&
            type.durationOptions.length
              ? { durationOptions: type.durationOptions }
              : {}),
            hidden: type.hidden,
            active: true,
            color: type.color,
            schedulingType: type.schedulingType,
            requiresConfirmation: type.requiresConfirmation,
            seatsPerTimeSlot: type.seatsPerTimeSlot,
            metadata: type.metadata,
          },
        });
        showToast(`${type.title} duplicated successfully`);
        await loadData();
      } catch (e) {
        showToast(e.message || "Duplicate failed");
      }
    } else if (action === "preview") {
      const url = `${window.location.origin}/book/${encodeURIComponent(profile.slug)}/${encodeURIComponent(type.slug)}`;
      window.open(url, "_blank", "noopener,noreferrer");
    } else if (action === "copy-link") {
      const url = `${window.location.origin}/book/${encodeURIComponent(profile.slug)}/${encodeURIComponent(type.slug)}`;
      try {
        await navigator.clipboard.writeText(url);
        showToast("Booking link copied");
      } catch {
        try {
          window.prompt("Copy this link:", url);
        } catch {
          showToast(url);
        }
      }
    } else if (action === "update") {
      try {
        const hidden = !extra;
        await patchEventType(id, { hidden });
        setEventTypes((prev) =>
          prev.map((t) => (t.id === id ? { ...t, hidden } : t))
        );
        showToast("Event type updated");
      } catch (e) {
        showToast(e.message || "Update failed");
      }
    } else if (action === "move-up") {
      const index = eventTypes.findIndex((t) => t.id === id);
      if (index > 0) await swapEventTypes(index, index - 1);
    } else if (action === "move-down") {
      const index = eventTypes.findIndex((t) => t.id === id);
      if (index >= 0 && index < eventTypes.length - 1) {
        await swapEventTypes(index, index + 1);
      }
    } else if (action === "edit") {
      onNavigate(
        `/event-types/${id}?title=${encodeURIComponent(type.title)}`
      );
    } else if (action === "embed") {
      showToast("Embed snippet is not available in this build yet.");
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1">
        <div className="flex items-center md:mb-6 md:mt-0 lg:mb-8 justify-between">
           <div className="flex flex-col gap-2">
              <Skeleton className="h-7 w-48" />
              <Skeleton className="h-4 w-72" />
           </div>
           <div className="flex gap-4">
              <Skeleton className="h-9 w-64 rounded-md" />
              <Skeleton className="h-9 w-20 rounded-md" />
           </div>
        </div>
        <div className="border border-subtle rounded-md bg-default divide-y divide-subtle">
           {[1, 2, 3].map(i => (
              <div key={i} className="p-4 flex items-center justify-between">
                 <div className="flex items-center gap-3">
                    <SkeletonAvatar className="h-10 w-10" />
                    <div className="flex flex-col gap-2">
                       <Skeleton className="h-4 w-32" />
                       <Skeleton className="h-3 w-48" />
                    </div>
                 </div>
                 <div className="flex gap-2">
                    <Skeleton className="h-8 w-16" />
                    <Skeleton className="h-8 w-8 rounded-full" />
                 </div>
              </div>
           ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1">
      <div className="flex items-center mb-8">
        <header className="flex w-full max-w-full items-center justify-between gap-4 px-2 sm:px-0">
          <div className="min-w-0 flex-1">
            <h1 className="font-cal text-[20px] font-bold text-emphasis leading-tight">
              Event types
            </h1>
            <p className="text-subtle text-[13px] mt-0.5">
              Configure different events for people to book on your calendar.
            </p>
          </div>
          
          <div className="flex items-center gap-3">
             <div className="hidden sm:flex items-center bg-transparent border border-subtle rounded-md px-2.5 py-1.5 focus-within:ring-1 focus-within:ring-emphasis transition-all">
                <Icon name="search" className="h-[14px] w-[14px] text-subtle" />
                <input 
                  type="text" 
                  placeholder="Search" 
                  className="bg-transparent border-none outline-none text-[13px] px-2 text-emphasis w-32 md:w-36"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
             </div>
             <button 
               onClick={() => setIsModalOpen(true)}
               className="btn-primary flex items-center gap-2 px-3.5 py-2 text-sm"
             >
                <Icon name="plus" className="h-4 w-4" />
                <span>New</span>
             </button>
          </div>
        </header>
      </div>

      <div className="bg-default border border-[#262626] rounded-xl overflow-visible">
        <ul ref={parent} className="divide-y divide-[#1a1a1a] w-full" data-testid="event-types">
          {filtered.length > 0 ? (
            filtered.map((type) => {
              const fullIndex = eventTypes.findIndex((t) => t.id === type.id);
              return (
                <EventTypeCard
                  key={type.id}
                  type={type}
                  profile={profile}
                  isFirst={fullIndex <= 0}
                  isLast={fullIndex === eventTypes.length - 1}
                  onAction={(action, val) => handleAction(type.id, action, val)}
                />
              );
            })
          ) : (
            <li className="flex flex-col items-center justify-center py-20 text-emphasis">
              <Icon name="link" className="text-subtle h-10 w-10 mb-4 opacity-50" />
              <h3 className="text-lg font-semibold">
                No results found
              </h3>
              <p className="text-subtle text-sm mt-1">
                Try adjusting your search to find what you&apos;re looking for.
              </p>
            </li>
          )}
        </ul>
      </div>

      <CreateEventTypeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        profileSlug={profile.slug}
        onContinue={async (values) => {
          try {
            const durationMinutes = Number(values.duration) || 15;
            const durationOptions = buildDurationOptionsPayload(
              durationMinutes,
              values.durationExtras || ""
            );
            const created = await apiData("/api/v1/event-types", {
              method: "POST",
              json: {
                title: values.title,
                slug: values.slug,
                description: values.description || "",
                durationMinutes,
                durationOptions,
                hidden: false,
                active: true,
              },
            });
            setIsModalOpen(false);
            const extrasText = Array.isArray(durationOptions)
              ? durationOptions
                  .filter((n) => Number(n) !== durationMinutes)
                  .join(", ")
              : "";
            onNavigate(
              `/event-types/${created._id}?title=${encodeURIComponent(values.title)}&slug=${encodeURIComponent(values.slug || "")}&description=${encodeURIComponent(values.description || "")}&duration=${encodeURIComponent(String(durationMinutes))}&durationExtras=${encodeURIComponent(extrasText)}`
            );
          } catch (e) {
            showToast(e.message || "Create failed");
          }
        }}
      />

      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[200] bg-emphasis text-inverted px-4 py-2 rounded-lg shadow-2xl animate-in slide-in-from-bottom-2 duration-300 flex items-center gap-2">
           <Icon name="check" className="h-4 w-4 bg-green-500 rounded-full p-0.5" />
           <span className="text-sm font-semibold">{toast}</span>
        </div>
      )}

      <ConfirmationModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        title="Delete Event Type"
        description="Are you sure you want to delete this event type? This action cannot be undone."
        onConfirm={async () => {
          try {
            await apiData(`/api/v1/event-types/${deleteId}`, { method: "DELETE" });
            setEventTypes((prev) => prev.filter((t) => t.id !== deleteId));
            setDeleteId(null);
            showToast("Event type deleted");
          } catch (e) {
            showToast(e.message || "Delete failed");
            setDeleteId(null);
          }
        }}
      />
    </div>
  );
}
