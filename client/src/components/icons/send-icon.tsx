import type { SVGProps } from 'react';

export function SendIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      focusable="false"
      viewBox="0 0 24 24"
      {...props}
    >
      <path
        d="M22 2 9.6 14.4M22 2l-7.9 20-4.5-7.6L2 9.9 22 2Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.75"
      />
    </svg>
  );
}
