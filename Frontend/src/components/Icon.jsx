import React from "react";

/**
 * Replicates the Cal.com Icon component using the SVG sprite.
 */
export function Icon({ name, size = 16, className, ...props }) {
  return (
    <svg
      height={size}
      width={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`shrink-0 ${className || ""}`}
      {...props}
      aria-hidden
    >
      <use href={`#${name}`} />
    </svg>
  );
}

export default Icon;
