import React, { useState } from "react";
import { Icon } from "./Icon";
import { useAutoAnimate } from "@formkit/auto-animate/react";

export function CreateEventTypeModal({ isOpen, onClose, onContinue, profileSlug }) {
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [duration, setDuration] = useState(15);
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
    onContinue({ title, slug, description, duration });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-[2px] transition-opacity" 
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative w-full max-w-[560px] bg-default border border-subtle rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <form onSubmit={handleContinue}>
          {/* Header */}
          <div className="px-6 py-6 border-b border-subtle">
            <h3 className="font-cal text-xl font-semibold text-emphasis">
              Add a new event type
            </h3>
            <p className="text-subtle text-sm mt-1">
              Create a new event type to allow people to book with you.
            </p>
          </div>

          {/* Body */}
          <div ref={parent} className="px-6 py-6 space-y-6">
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
              <div className="flex rounded-md border border-subtle bg-subtle overflow-hidden focus-within:ring-2 focus-within:ring-black/5 focus-within:border-emphasis">
                <span className="px-3 py-2 text-sm text-subtle bg-subtle border-r border-subtle whitespace-nowrap">
                  cal.com/{profileSlug}/
                </span>
                <input
                  type="text"
                  className="flex-1 bg-default px-3 py-2 text-sm outline-none"
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
          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-muted/30 border-t border-subtle flex justify-end gap-3">
            <button
              type="button"
              className="btn-secondary"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
            >
              Continue
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
