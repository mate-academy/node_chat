import type { SVGProps } from 'react';

export function LockIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      focusable="false"
      viewBox="0 0 24 24"
      {...props}
    >
      <rect
        height="10"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.75"
        width="14"
        x="5"
        y="11"
      />

      <path
        d="M8 11V7a4 4 0 0 1 8 0v4"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.75"
      />
    </svg>
  );
}
