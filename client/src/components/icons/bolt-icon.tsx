import type { SVGProps } from 'react';

export function BoltIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      focusable="false"
      viewBox="0 0 24 24"
      {...props}
    >
      <path
        d="m13.5 2-7 11H12l-1.5 9 7-12H12l1.5-8Z"
        fill="currentColor"
        stroke="currentColor"
        strokeLinejoin="round"
      />
    </svg>
  );
}
