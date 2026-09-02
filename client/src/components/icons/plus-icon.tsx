import type { SVGProps } from 'react';

export function PlusIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      focusable="false"
      viewBox="0 0 24 24"
      {...props}
    >
      <path
        d="M12 5v14M5 12h14"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.75"
      />
    </svg>
  );
}
