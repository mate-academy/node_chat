import type { SVGProps } from 'react';

export function PanelLeftIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      focusable="false"
      viewBox="0 0 24 24"
      {...props}
    >
      <rect
        height="18"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.75"
        width="18"
        x="3"
        y="3"
      />

      <path d="M9 3v18" stroke="currentColor" strokeWidth="1.75" />

      <path
        d="m14 9 3 3-3 3"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.75"
      />
    </svg>
  );
}
