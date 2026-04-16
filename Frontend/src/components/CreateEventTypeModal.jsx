import React, { useState } from "react";
import { Icon } from "./Icon";
import { useAutoAnimate } from "@formkit/auto-animate/react";

export function CreateEventTypeModal({ isOpen, onClose, onContinue, profileSlug }) {
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [duration, setDuration] = useState(15);
  const [durationExtras, setDurationExtras] = useState("");
  const [parent] = useAutoAnimate();

  if (!isOpen) return null;

  const handleTitleChange = (e) => {
    const val = e.target.value;
    setTitle(val);
    // Auto-generate slug if it hasn't been manually edited
    const suggestedSlug = val
      .toLowerCase()
      .replace(/ /g, "-")
      .replace(/[^\w/-]/g, "");
    setSlug(suggestedSlug);
  };

  const handleContinue = (e) => {
    e.preventDefault();
    onContinue({ title, slug, description, duration, durationExtras });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-[2px] transition-opacity" 
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative max-h-[90dvh] w-full max-w-[560px] overflow-y-auto rounded-t-2xl border border-subtle border-b-0 bg-default shadow-2xl animate-in fade-in zoom-in duration-200 sm:rounded-xl sm:border-b">
        <form onSubmit={handleContinue}>
          {/* Header */}
          <div className="border-b border-subtle px-4 py-5 sm:px-6 sm:py-6">
            <h3 className="font-cal text-lg font-semibold text-emphasis sm:text-xl">
              Add a new event type
            </h3>
            <p className="mt-1 text-sm text-subtle">
              Create a new event type to allow people to book with you.
            </p>
          </div>

          {/* Body */}
          <div ref={parent} className="space-y-5 px-4 py-5 sm:space-y-6 sm:px-6 sm:py-6">
            {/* Title */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-emphasis block">
                Title
              </label>
              <input
                type="text"
                placeholder="Quick Chat"
                className="w-full bg-default border border-subtle rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-black/5 focus:border-emphasis outline-none transition-all placeholder:text-muted"
                value={title}
                onChange={handleTitleChange}
                required
                autoFocus
              />
            </div>

            {/* URL / Slug */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-emphasis block">
                URL
              </label>
              <div className="flex flex-col overflow-hidden rounded-md border border-subtle bg-subtle focus-within:border-emphasis focus-within:ring-2 focus-within:ring-black/5 sm:flex-row">
                <span className="whitespace-nowrap border-b border-subtle bg-subtle px-3 py-2 text-xs text-subtle sm:border-b-0 sm:border-r sm:text-sm">
                  cal.com/{profileSlug}/
                </span>
                <input
                  type="text"
                  className="min-w-0 flex-1 bg-default px-3 py-2 text-sm outline-none"
                  value={slug}
                  onChange={(e) =>
                    setSlug(
                      e.target.value
                        .toLowerCase()
                        .replace(/[^\w/-]/g, "")
                    )
                  }
                  required
                />
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-emphasis block">
                Description
              </label>
              <textarea
                placeholder="Provide a short description"
                rows={3}
                className="w-full bg-default border border-subtle rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-black/5 focus:border-emphasis outline-none transition-all placeholder:text-muted resize-none"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            {/* Duration */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-emphasis block">
                Duration
              </label>
              <div className="relative">
                <input
                  type="number"
                  className="w-full bg-default border border-subtle rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-black/5 focus:border-emphasis outline-none transition-all pr-20"
                  value={duration}
                  onChange={(e) => setDuration(parseInt(e.target.value))}
                  min={1}
                  required
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-sm text-subtle">
                  minutes
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-emphasis block">
                Extra lengths (optional)
              </label>
              <input
                type="text"
                placeholder="e.g. 30, 45"
                className="w-full bg-default border border-subtle rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-black/5 focus:border-emphasis outline-none transition-all placeholder:text-muted"
                value={durationExtras}
                onChange={(e) => setDurationExtras(e.target.value)}
                aria-describedby="duration-extras-hint"
              />
              <p
                id="duration-extras-hint"
                className="text-xs text-subtle leading-relaxed"
              >
                Comma-separated minutes in addition to the duration above (1–720).
                When set, bookers can choose among these lengths when booking.
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="flex flex-col-reverse gap-2 border-t border-subtle bg-muted/30 px-4 py-4 sm:flex-row sm:justify-end sm:gap-3 sm:px-6">
            <button
              type="button"
              className="btn-secondary w-full sm:w-auto"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary w-full sm:w-auto"
            >
              Continue
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
