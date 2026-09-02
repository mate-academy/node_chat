'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useMemo, useState, useSyncExternalStore } from 'react';

import { MoreHorizontalIcon } from '@/components/icons';
import { getRooms } from '@/lib/api';
import {
  getProfileSnapshot,
  getServerProfileSnapshot,
  parseChatProfile,
  subscribeToProfile,
} from '@/lib/profile-storage';

import { MembersModal } from './members-modal';
import { RoomConversation } from './room-conversation';
import { RoomMembersBar } from './room-members-bar';

export function ChatShell() {
  const searchParams = useSearchParams();
  const [isMembersOpen, setIsMembersOpen] = useState(false);

  const storedProfile = useSyncExternalStore(
    subscribeToProfile,
    getProfileSnapshot,
    getServerProfileSnapshot,
  );

  const profile = useMemo(
    () => parseChatProfile(storedProfile),
    [storedProfile],
  );

  const roomsQuery = useQuery({
    queryKey: ['rooms', profile?.id],
    queryFn: () => {
      if (!profile) {
        throw new Error('Chat profile is missing');
      }

      return getRooms(profile.id);
    },
    enabled: Boolean(profile),
  });

  function openMembersModal() {
    setIsMembersOpen(true);
  }

  function closeMembersModal() {
    setIsMembersOpen(false);
  }

  if (!profile) {
    return null;
  }

  const rooms = roomsQuery.data ?? [];
  const requestedRoomId = searchParams.get('roomId');

  const selectedRoom =
    rooms.find((room) => room.id === requestedRoomId) ?? rooms[0];

  if (roomsQuery.isPending) {
    return (
      <div className="flex min-h-0 flex-1 items-center justify-center overflow-hidden px-4 text-center text-sm text-muted-foreground">
        Loading rooms...
      </div>
    );
  }

  if (roomsQuery.error) {
    return (
      <div className="flex min-h-0 flex-1 items-center justify-center overflow-hidden px-4 text-center text-sm text-destructive sm:px-6">
        {roomsQuery.error.message}
      </div>
    );
  }

  if (!selectedRoom) {
    return (
      <div className="flex min-h-0 flex-1 items-center justify-center overflow-hidden px-4 text-center text-sm text-muted-foreground">
        No rooms available
      </div>
    );
  }

  const hasMembers = selectedRoom.members.length > 0;

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <header className="relative shrink-0 border-b px-14 py-3 lg:px-8 lg:py-5">
        <div className="flex min-w-0 items-center justify-center lg:justify-between lg:gap-6">
          <div className="flex min-w-0 items-center justify-center gap-2.5 text-center lg:justify-start lg:gap-4 lg:text-left">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-lg text-primary lg:size-12 lg:text-xl">
              #
            </div>

            <div className="min-w-0">
              <h1 className="truncate text-base font-semibold lg:text-xl">
                {selectedRoom.name}
              </h1>

              <p className="mt-0.5 truncate text-xs text-muted-foreground lg:text-sm">
                {selectedRoom.description ?? 'No room description'}
              </p>
            </div>
          </div>

          {hasMembers && (
            <Link
              aria-label="Room settings"
              className="absolute right-2 flex size-10 items-center justify-center rounded-xl text-muted-foreground transition hover:bg-muted hover:text-foreground lg:static lg:size-11 lg:shrink-0"
              href={`/rooms/${selectedRoom.id}/settings`}
            >
              <MoreHorizontalIcon className="size-5" />
            </Link>
          )}
        </div>
      </header>

      <div className="shrink-0">
        <RoomMembersBar
          memberCount={selectedRoom._count.members}
          onViewMembers={openMembersModal}
        />
      </div>

      <RoomConversation
        key={selectedRoom.id}
        profile={profile}
        room={selectedRoom}
      />

      {isMembersOpen && (
        <MembersModal
          onClose={closeMembersModal}
          profile={profile}
          room={selectedRoom}
        />
      )}
    </div>
  );
}
