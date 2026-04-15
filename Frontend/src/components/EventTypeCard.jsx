import React, { useState } from "react";
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

  return (
    <li className={`group hover:bg-subtle/20 transition-colors ${isDropdownOpen ? 'relative z-40' : ''}`}>
      <div className="flex items-center px-4 py-4 sm:px-6">
        
        {/* Content */}
        <div className="flex-1 min-w-0">
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
        </div>

        {/* Actions Container */}
        <div className="flex items-center gap-6">
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
                    className="p-2 hover:bg-subtle/50 rounded-md text-subtle transition group" 
                    onClick={() => onAction('preview')}
                 >
                    <Icon name="external-link" className="h-4 w-4" />
                 </button>
                 <button 
                    className="p-2 hover:bg-subtle/50 rounded-md text-subtle transition group" 
                    onClick={() => onAction('copy-link')}
                 >
                    <Icon name="link" className="h-4 w-4" />
                 </button>
                 <div className="relative">
                    <button 
                       className="p-2 hover:bg-subtle/50 rounded-md text-subtle transition group" 
                       onClick={() => setIsDropdownOpen(!isDropdownOpen)}
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

              {/* Mobile Actions (ellipsis only) */}
              <div className="sm:hidden relative">
                 <button 
                    className="p-2 hover:bg-subtle/50 rounded-md text-subtle transition group" 
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
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
