import Link from 'next/link';

import { BoltIcon, ChevronRightIcon } from '@/components/icons';
import type { ChatProfile } from '@/types/chat';

import { InvitationsMenu } from './invitations-menu';

type SidebarHeaderProps = {
  profile: ChatProfile;
};

function getInitials(name: string) {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

export function SidebarHeader({ profile }: SidebarHeaderProps) {
  return (
    <header>
      <div className="flex items-center justify-between">
        <Link
          aria-label="Chat home"
          className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm transition hover:opacity-90 sm:size-12"
          href="/chat"
        >
          <BoltIcon className="size-4 sm:size-5" />
        </Link>

        <InvitationsMenu profileId={profile.id} />
      </div>

      <Link
        className="mt-6 flex min-h-14 items-center gap-2.5 rounded-xl p-2 transition hover:bg-muted sm:mt-10 sm:gap-3"
        href="/profile"
      >
        <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary sm:size-11 sm:text-base">
          {getInitials(profile.displayName)}
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold sm:text-base">
            {profile.displayName}
          </p>

          <p className="text-xs text-accent sm:text-sm">Online</p>
        </div>

        <ChevronRightIcon className="size-4 shrink-0 text-muted-foreground sm:size-5" />
      </Link>
    </header>
  );
}
