import React, { useState, useRef, useEffect } from "react";
import { Icon } from "./Icon";
import { Switch } from "./Switch";
import { ActionsDropdown } from "./ActionsDropdown";

/**
 * Pixel-perfect replica of a single event-type row from Cal.com.
 *
 * Layout per the reference screenshot:
 *  <li>
 *    <div hover:bg-cal-muted> (row wrapper with hover state)
 *      <div group px-4 py-4 sm:px-6> (inner content)
 *        ArrowButton up   (invisible, appears on group hover)
 *        ArrowButton down (invisible, appears on group hover)
 *        <Item>           (title + slug on line 1, badge row below)
 *        <Actions>        (Hidden label + switch + button group)
 *      </div>
 *    </div>
 *  </li>
 */
export function EventTypeCard({ type, profile, onAction, isFirst, isLast }) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [enabled, setEnabled] = useState(!type.hidden);
  const actionsRef = useRef(null);

  useEffect(() => {
    if (!isDropdownOpen) return;
    let cleanup = () => {};
    const timer = window.setTimeout(() => {
      const onPointerDown = (e) => {
        if (actionsRef.current && !actionsRef.current.contains(e.target)) {
          setIsDropdownOpen(false);
        }
      };
      document.addEventListener("pointerdown", onPointerDown, true);
      cleanup = () =>
        document.removeEventListener("pointerdown", onPointerDown, true);
    }, 0);
    return () => {
      window.clearTimeout(timer);
      cleanup();
    };
  }, [isDropdownOpen]);

  return (
    <li
      className={`group hover:bg-subtle/20 transition-colors ${isDropdownOpen ? 'relative z-40' : ''}`}
    >
      <div className="relative flex items-center px-4 py-4 sm:px-6">
        <div className="hidden sm:flex absolute -left-4 top-1/2 -translate-y-1/2 flex-col gap-1 opacity-0 pointer-events-none transition-opacity duration-150 group-hover:opacity-100 group-hover:pointer-events-auto">
          <button
            type="button"
            disabled={isFirst}
            className="inline-flex h-6 w-6 items-center justify-center rounded border border-subtle text-subtle hover:bg-subtle/40 disabled:opacity-35 disabled:cursor-not-allowed"
            onClick={(e) => {
              e.stopPropagation();
              onAction("move-up");
            }}
            title="Move up"
            aria-label="Move event type up"
          >
            <Icon name="chevron-up" className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            disabled={isLast}
            className="inline-flex h-6 w-6 items-center justify-center rounded border border-subtle text-subtle hover:bg-subtle/40 disabled:opacity-35 disabled:cursor-not-allowed"
            onClick={(e) => {
              e.stopPropagation();
              onAction("move-down");
            }}
            title="Move down"
            aria-label="Move event type down"
          >
            <Icon name="chevron-down" className="h-3.5 w-3.5" />
          </button>
        </div>
        
        {/* Content — row click opens edit (same as Cal.com) */}
        <button
          type="button"
          className="flex-1 min-w-0 text-left rounded-lg -my-1 py-1 pr-2 -ml-1 pl-1 hover:bg-subtle/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-emphasis/40"
          onClick={() => onAction("edit")}
        >
          <div className="flex flex-col sm:flex-row sm:items-baseline sm:gap-2">
            <span className="text-sm font-semibold text-emphasis truncate leading-tight">{type.title}</span>
            <span className="text-xs text-subtle truncate">/{profile?.slug || "host"}/{type.slug}</span>
          </div>
          <div className="flex items-center gap-2 mt-2">
             <div className="flex items-center gap-1.5 bg-subtle px-1.5 py-0.5 rounded-md">
                <Icon name="clock" className="h-3 w-3 text-subtle" />
                <span className="text-[11px] font-bold text-subtle">{type.length}m</span>
             </div>
             {type.schedulingType && type.schedulingType !== "MANAGED" && (
                <div className="flex items-center gap-1.5 bg-subtle px-1.5 py-0.5 rounded-md">
                   <Icon name="users" className="h-3 w-3 text-subtle" />
                   <span className="text-[11px] font-bold text-subtle uppercase tracking-wider">
                      {type.schedulingType === "ROUND_ROBIN" ? "Round Robin" : "Collective"}
                   </span>
                </div>
             )}
          </div>
        </button>

        {/* Actions Container — ref for dropdown dismiss (must not clip menu: parent uses overflow-visible) */}
        <div ref={actionsRef} className="flex items-center gap-6 shrink-0">
           {/* Hidden Label */}
           {!enabled && (
              <span className="hidden sm:block text-[11px] font-extrabold text-[#666] uppercase tracking-widest mr-[-8px]">
                Hidden
              </span>
           )}

           {/* Desktop Actions */}
           <div className="flex items-center gap-3">
              <Switch 
                checked={enabled} 
                onChange={(val) => { setEnabled(val); onAction('update', val); }} 
              />
              
              <div className="hidden sm:flex items-center rounded-lg border border-subtle overflow-hidden divide-x divide-subtle">
                 <button
                    type="button"
                    className="p-2 bg-transparent hover:bg-subtle/50 text-subtle transition group"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsDropdownOpen(false);
                      onAction("preview");
                    }}
                    title="Open booking page"
                 >
                    <Icon name="external-link" className="h-4 w-4" />
                 </button>
                 <button
                    type="button"
                    className="p-2 bg-transparent hover:bg-subtle/50 text-subtle transition group"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsDropdownOpen(false);
                      onAction("copy-link");
                    }}
                    title="Copy booking link"
                 >
                    <Icon name="link" className="h-4 w-4" />
                 </button>
                 <div className="relative z-[60]">
                   <button
                     type="button"
                     className="inline-flex p-2 bg-transparent hover:bg-subtle/50 text-subtle transition group"
                     onClick={(e) => {
                       e.stopPropagation();
                       setIsDropdownOpen((o) => !o);
                     }}
                     aria-expanded={isDropdownOpen}
                     aria-haspopup="menu"
                     title="More options"
                   >
                     <Icon name="ellipsis" className="h-4 w-4" />
                   </button>
                   <ActionsDropdown
                     isOpen={isDropdownOpen}
                     onClose={() => setIsDropdownOpen(false)}
                     onAction={onAction}
                   />
                 </div>
              </div>

              {/* Mobile-only menu anchor */}
              <div className="relative z-[60] sm:hidden">
                <button
                  type="button"
                  className="p-2 !border-0 !shadow-none !bg-transparent hover:bg-subtle/50 rounded-md text-subtle transition group sm:hidden"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsDropdownOpen((o) => !o);
                  }}
                  aria-expanded={isDropdownOpen}
                  aria-haspopup="menu"
                  title="More options"
                >
                  <Icon name="ellipsis" className="h-4 w-4" />
                </button>
                <ActionsDropdown
                  isOpen={isDropdownOpen}
                  onClose={() => setIsDropdownOpen(false)}
                  onAction={onAction}
                />
              </div>
           </div>
        </div>
      </div>
    </li>
  );
}
