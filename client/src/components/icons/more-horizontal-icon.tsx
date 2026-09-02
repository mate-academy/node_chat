import type { SVGProps } from 'react';

export function MoreHorizontalIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      focusable="false"
      viewBox="0 0 24 24"
      {...props}
    >
      <circle cx="5" cy="12" fill="currentColor" r="1.75" />
      <circle cx="12" cy="12" fill="currentColor" r="1.75" />
      <circle cx="19" cy="12" fill="currentColor" r="1.75" />
    </svg>
  );
}
