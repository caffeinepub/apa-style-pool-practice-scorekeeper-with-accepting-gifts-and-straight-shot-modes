import React from 'react';

interface ModePillProps {
  label: string;
  className?: string;
}

/**
 * Styled pill/badge for mode names in match history views.
 * Renders a rounded-border outlined pill matching the design in image-121.png.
 */
export default function ModePill({ label, className = '' }: ModePillProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full border border-foreground/30 px-2.5 py-0.5 text-xs font-medium whitespace-nowrap ${className}`}
    >
      {label}
    </span>
  );
}
