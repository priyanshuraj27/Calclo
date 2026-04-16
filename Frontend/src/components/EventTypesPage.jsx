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

  const publicBookingBase = (
    import.meta.env.VITE_PUBLIC_BOOKING_BASE_URL ||
    "https://calclo.bepriyanshu.tech"
  ).replace(/\/$/, "");
  const buildPublicBookingLink = (host, slug) =>
    `${publicBookingBase}/${encodeURIComponent(host)}/${encodeURIComponent(slug)}`;

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
      const url = buildPublicBookingLink(profile.slug, type.slug);
      window.open(url, "_blank", "noopener,noreferrer");
    } else if (action === "copy-link") {
      const url = buildPublicBookingLink(profile.slug, type.slug);
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
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between lg:mb-8">
           <div className="flex flex-col gap-2 min-w-0">
              <Skeleton className="h-7 w-48 max-w-full" />
              <Skeleton className="h-4 w-72 max-w-full" />
           </div>
           <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <Skeleton className="h-9 w-full rounded-md sm:w-64" />
              <Skeleton className="h-9 w-full rounded-md sm:w-20" />
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
      <div className="mb-6 sm:mb-8">
        <header className="flex w-full max-w-full flex-col gap-4 px-1 sm:px-0 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0 flex-1">
            <h1 className="font-cal text-lg font-bold text-emphasis leading-tight sm:text-[20px]">
              Event types
            </h1>
            <p className="mt-0.5 text-[13px] text-subtle">
              Configure different events for people to book on your calendar.
            </p>
          </div>

          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center sm:gap-3">
            <div className="flex w-full items-center rounded-md border border-subtle bg-transparent px-2.5 py-1.5 focus-within:ring-1 focus-within:ring-emphasis sm:max-w-[220px] lg:max-w-none">
              <Icon name="search" className="h-[14px] w-[14px] shrink-0 text-subtle" />
              <input
                type="text"
                placeholder="Search"
                className="min-w-0 flex-1 border-none bg-transparent px-2 text-[13px] text-emphasis outline-none"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="btn-primary inline-flex w-full shrink-0 items-center justify-center gap-2 px-3.5 py-2 text-sm sm:w-auto"
            >
              <Icon name="plus" className="h-4 w-4" />
              <span>New</span>
            </button>
          </div>
        </header>
      </div>

      <div className="overflow-visible rounded-xl border border-[#262626] bg-default -mx-0.5 sm:mx-0">
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
        <div className="fixed bottom-24 left-1/2 z-[200] flex max-w-[min(calc(100vw-2rem),28rem)] -translate-x-1/2 animate-in slide-in-from-bottom-2 items-center gap-2 rounded-lg bg-emphasis px-4 py-2 text-inverted shadow-2xl duration-300 lg:bottom-6">
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
