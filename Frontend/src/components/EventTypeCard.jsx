import React, { useState } from "react";
import { Icon } from "./Icon";

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
export function EventTypeCard({ type, profile, isFirst, isLast }) {
  const [hidden, setHidden] = useState(type.hidden);

  return (
    <li>
      <div className="hover:bg-cal-muted flex w-full items-center justify-between transition">
        <div className="group relative flex w-full max-w-full items-center justify-between px-4 py-4 sm:px-6">
          {/* ── ArrowButton UP ─────────────────────────── */}
          {!isFirst && (
            <button
              className="bg-default text-muted hover:text-emphasis border-default hover:border-emphasis invisible absolute -left-3 -mt-4 mb-4 hidden h-6 w-6 scale-0 items-center justify-center rounded-md border p-1 transition-all group-hover:visible group-hover:scale-100 sm:flex"
              onClick={() => {}}
            >
              <Icon name="arrow-up" className="h-5 w-5" />
            </button>
          )}

          {/* ── ArrowButton DOWN ───────────────────────── */}
          {!isLast && (
            <button
              className="bg-default text-muted border-default hover:text-emphasis hover:border-emphasis invisible absolute -left-3 mt-8 hidden h-6 w-6 scale-0 items-center justify-center rounded-md border p-1 transition-all group-hover:visible group-hover:scale-100 sm:flex"
              onClick={() => {}}
            >
              <Icon name="arrow-down" className="h-5 w-5" />
            </button>
          )}

          {/* ── Item: title + slug + badge ────────────── */}
          <div className="relative flex-1 overflow-hidden pr-4 text-sm">
            <div>
              {/* Line 1: title + slug */}
              <span
                className="text-default break-words font-semibold ltr:mr-1 rtl:ml-1"
                data-testid={`event-type-title-${type.id}`}
              >
                {type.title}
              </span>
              {profile.slug && (
                <small
                  className="text-subtle hidden font-normal leading-4 sm:inline"
                  data-testid={`event-type-slug-${type.id}`}
                >
                  /{profile.slug}/{type.slug}
                </small>
              )}

              {/* Line 2: description badges */}
              <div className="text-subtle">
                <ul className="mt-2 flex flex-wrap gap-x-2 gap-y-1">
                  {/* Duration badge */}
                  <li>
                    <Badge startIcon="clock">{type.length}m</Badge>
                  </li>
                  {/* Scheduling type badge */}
                  {type.schedulingType &&
                    type.schedulingType !== "MANAGED" && (
                      <li>
                        <Badge startIcon="users">
                          {type.schedulingType === "ROUND_ROBIN" && "Round Robin"}
                          {type.schedulingType === "COLLECTIVE" && "Collective"}
                        </Badge>
                      </li>
                    )}
                </ul>
              </div>
            </div>
          </div>

          {/* ── Actions (desktop) ────────────────────────── */}
          <div className="mt-4 hidden sm:mt-0 sm:flex">
            <div className="flex justify-between space-x-2 rtl:space-x-reverse">
              <div className="flex items-center justify-between space-x-2 rtl:space-x-reverse">
                {/* Hidden label + Switch */}
                <>
                  {hidden && (
                    <span className="text-sm text-gray-400">Hidden</span>
                  )}
                  <div className="self-center rounded-md p-2">
                    <SwitchToggle
                      checked={!hidden}
                      onChange={() => setHidden(!hidden)}
                    />
                  </div>
                </>

                {/* ButtonGroup combined */}
                <div className="flex btn-group-combined">
                  {/* Preview (external-link) */}
                  <button
                    data-testid="preview-link-button"
                    className="btn-icon-secondary btn-group-first"
                  >
                    <Icon name="external-link" className="h-4 w-4" />
                  </button>
                  {/* Copy link */}
                  <button className="btn-icon-secondary btn-group-middle">
                    <Icon name="link" className="h-4 w-4" />
                  </button>
                  {/* More (ellipsis) */}
                  <button
                    data-testid={`event-type-options-${type.id}`}
                    className="btn-icon-secondary btn-group-last"
                  >
                    <Icon name="ellipsis" className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* ── Mobile ellipsis ───────────────────────────── */}
          <div className="min-w-9 mx-5 flex sm:hidden">
            <button className="btn-icon-secondary">
              <Icon name="ellipsis" className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </li>
  );
}

/**
 * Badge – gray variant matching Cal.com Badge component.
 * variant="gray": bg-emphasis text-emphasis
 * size="md": py-1 px-1.5 text-xs leading-none
 */
function Badge({ startIcon, children }) {
  return (
    <div className="font-medium inline-flex items-center justify-center rounded-[4px] gap-x-1 bg-emphasis text-emphasis py-1 px-1.5 text-xs leading-none">
      {startIcon && (
        <Icon name={startIcon} size={12} className="stroke-[3px]" />
      )}
      {children}
    </div>
  );
}

/**
 * SwitchToggle – pixel-perfect replica of Cal.com's Radix Switch.
 *
 * ON  state: dark bg (brand), white thumb translated right
 * OFF state: muted bg, white thumb at start
 */
function SwitchToggle({ checked, onChange }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={onChange}
      className={`relative inline-flex h-5 w-[34px] shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${
        checked
          ? "bg-inverted"
          : "bg-emphasis"
      }`}
    >
      <span
        className={`pointer-events-none block h-[14px] w-[14px] rounded-full shadow-lg ring-0 transition-transform ${
          checked ? "translate-x-[14px] bg-default" : "translate-x-0 bg-default"
        }`}
      />
    </button>
  );
}
