'use client';

import { useMutation, useQuery } from '@tanstack/react-query';
import { type ChangeEvent, useState } from 'react';

import { createRoomInvitation, searchChatProfiles } from '@/lib/api';

type InviteMembersProps = {
  roomId: string;
  inviterId: string;
  existingMemberIds?: string[];
};

export function InviteMembers({
  roomId,
  inviterId,
  existingMemberIds = [],
}: InviteMembersProps) {
  const [search, setSearch] = useState('');
  const [invitedUsers, setInvitedUsers] = useState(() => new Set<string>());

  const normalizedSearch = search.trim();

  const profilesQuery = useQuery({
    queryKey: ['chat-profiles', normalizedSearch],
    queryFn: () => searchChatProfiles(normalizedSearch),
    enabled: normalizedSearch.length >= 2,
  });

  const invitationMutation = useMutation({
    mutationFn: (recipientId: string) =>
      createRoomInvitation(roomId, inviterId, recipientId),

    onSuccess: (_, recipientId) => {
      setInvitedUsers((currentUsers) => {
        const nextUsers = new Set(currentUsers);

        nextUsers.add(recipientId);

        return nextUsers;
      });
    },
  });

  const profiles = (profilesQuery.data ?? []).filter(
    (profile) =>
      profile.id !== inviterId && !existingMemberIds.includes(profile.id),
  );

  function handleSearchChange(event: ChangeEvent<HTMLInputElement>) {
    setSearch(event.target.value);
  }

  return (
    <section>
      <h3 className="text-sm font-medium sm:text-base">Invite members</h3>

      <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
        Search for a chat profile by username.
      </p>

      <input
        className="mt-3 min-h-10 w-full rounded-xl border bg-input px-3 py-2 text-sm outline-none transition focus:ring-2 focus:ring-ring/30 sm:mt-4 sm:min-h-11 sm:px-4 sm:py-3 sm:text-base"
        onChange={handleSearchChange}
        placeholder="Search users"
        value={search}
      />

      {profilesQuery.isFetching && (
        <p className="mt-3 text-xs text-muted-foreground sm:text-sm">
          Searching...
        </p>
      )}

      <div className="mt-3 max-h-52 space-y-2 overflow-y-auto pr-1 sm:mt-4 sm:max-h-56 sm:pr-2">
        {profiles.map((profile) => {
          const isInvited = invitedUsers.has(profile.id);

          return (
            <article
              className="flex min-h-14 items-center gap-2.5 rounded-xl border p-2.5 sm:min-h-16 sm:gap-3 sm:p-3"
              key={profile.id}
            >
              <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold sm:size-10 sm:text-sm">
                {profile.displayName.slice(0, 2).toUpperCase()}
              </div>

              <span className="min-w-0 flex-1 truncate text-sm sm:text-base">
                {profile.displayName}
              </span>

              <button
                className="shrink-0 rounded-lg bg-primary px-3 py-2 text-xs font-medium text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 sm:px-4 sm:text-sm"
                disabled={isInvited || invitationMutation.isPending}
                onClick={() => invitationMutation.mutate(profile.id)}
                type="button"
              >
                {isInvited ? 'Invited' : 'Invite'}
              </button>
            </article>
          );
        })}
      </div>

      {normalizedSearch.length >= 2 &&
        !profilesQuery.isFetching &&
        profiles.length === 0 && (
          <p className="mt-3 text-xs text-muted-foreground sm:text-sm">
            No available users found
          </p>
        )}

      {invitationMutation.error && (
        <p className="mt-3 text-xs text-destructive sm:text-sm">
          {invitationMutation.error.message}
        </p>
      )}
    </section>
  );
}
