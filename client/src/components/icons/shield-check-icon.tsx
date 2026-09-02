import type { SVGProps } from 'react';

export function ShieldCheckIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      focusable="false"
      viewBox="0 0 24 24"
      {...props}
    >
      <path
        d="M12 3 5 6v5c0 4.6 2.9 8.6 7 10 4.1-1.4 7-5.4 7-10V6l-7-3Z"
        stroke="currentColor"
        strokeLinejoin="round"
        strokeWidth="1.75"
      />

      <path
        d="m9.5 12 1.7 1.7 3.6-3.9"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.75"
      />
    </svg>
  );
}
