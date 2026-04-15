import React from "react";

/**
 * Replicates the Cal.com Icon component using the SVG sprite.
 */
export function Icon({ name, size = 16, className, ...props }) {
  return (
    <svg
      height={size}
      width={size}
      className={`fill-transparent ${className || ""}`}
      {...props}
      aria-hidden
    >
      <use href={`#${name}`} />
    </svg>
  );
}

export default Icon;
