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
export function EventTypeCard({ type, profile, onAction }) {
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
    <li className={`group hover:bg-subtle/20 transition-colors ${isDropdownOpen ? 'relative z-40' : ''}`}>
      <div className="flex items-center px-4 py-4 sm:px-6">
        
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
              
              <div className="hidden sm:flex items-center gap-1">
                 <button
                    type="button"
                    className="p-2 hover:bg-subtle/50 rounded-md text-subtle transition group"
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
                    className="p-2 hover:bg-subtle/50 rounded-md text-subtle transition group"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsDropdownOpen(false);
                      onAction("copy-link");
                    }}
                    title="Copy booking link"
                 >
                    <Icon name="link" className="h-4 w-4" />
                 </button>
              </div>

              {/* One menu anchor for mobile + desktop (avoids duplicate dropdown DOM) */}
              <div className="relative z-[60]">
                <button
                  type="button"
                  className="p-2 hover:bg-subtle/50 rounded-md text-subtle transition group sm:hidden"
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
                <button
                  type="button"
                  className="hidden sm:inline-flex p-2 hover:bg-subtle/50 rounded-md text-subtle transition group"
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
