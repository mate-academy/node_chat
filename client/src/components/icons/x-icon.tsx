import type { SVGProps } from 'react';

export function XIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg aria-hidden="true" fill="none" viewBox="0 0 24 24" {...props}>
      <path
        d="M18 6 6 18M6 6l12 12"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
    </svg>
  );
}
