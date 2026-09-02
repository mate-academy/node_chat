'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useMemo, useState, useSyncExternalStore } from 'react';

import { ArrowLeftIcon } from '@/components/icons';
import { InviteMembers } from '@/features/chat/invite-members';
import { deleteRoom, getRoomDetails, leaveRoom, updateRoom } from '@/lib/api';
import {
  getProfileSnapshot,
  getServerProfileSnapshot,
  parseChatProfile,
  subscribeToProfile,
} from '@/lib/profile-storage';
import type { ChatProfile } from '@/types/chat';

import { RoomDangerZone } from './components/room-danger-zone';
import {
  RoomDetailsSection,
  type UpdateRoomSettingsInput,
} from './components/room-details-section';
import { RoomMembersSection } from './components/room-members-section';

type RoomSettingsContentProps = {
  profile: ChatProfile;
  roomId: string;
};

function RoomSettingsContent({ profile, roomId }: RoomSettingsContentProps) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [isSaved, setIsSaved] = useState(false);

  const roomQuery = useQuery({
    queryKey: ['room', roomId, profile.id],
    queryFn: () => getRoomDetails(roomId, profile.id),
  });

  async function refreshRoomData() {
    await Promise.all([
      queryClient.invalidateQueries({
        queryKey: ['rooms', profile.id],
      }),
      queryClient.invalidateQueries({
        queryKey: ['room', roomId, profile.id],
      }),
    ]);
  }

  const updateMutation = useMutation({
    mutationFn: (input: UpdateRoomSettingsInput) =>
      updateRoom(roomId, {
        requesterId: profile.id,
        ...input,
      }),

    onSuccess: async () => {
      await refreshRoomData();
      setIsSaved(true);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteRoom(roomId, profile.id),

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['rooms', profile.id],
      });

      router.replace('/chat');
    },
  });

  const leaveMutation = useMutation({
    mutationFn: () => leaveRoom(roomId, profile.id),

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['rooms', profile.id],
      });

      router.replace('/chat');
    },
  });

  function handleSettingsChange() {
    setIsSaved(false);
    updateMutation.reset();
  }

  function handleSave(input: UpdateRoomSettingsInput) {
    setIsSaved(false);
    updateMutation.mutate(input);
  }

  function handleDeleteRoom() {
    const roomName = roomQuery.data?.name ?? 'this room';

    if (window.confirm(`Delete #${roomName} permanently?`)) {
      deleteMutation.mutate();
    }
  }

  function handleLeaveRoom() {
    const roomName = roomQuery.data?.name ?? 'this room';

    if (window.confirm(`Leave #${roomName}?`)) {
      leaveMutation.mutate();
    }
  }

  if (roomQuery.isPending) {
    return (
      <div className="flex min-h-0 flex-1 items-center justify-center px-4 text-center text-sm text-muted-foreground">
        Loading room settings...
      </div>
    );
  }

  if (roomQuery.error || !roomQuery.data) {
    return (
      <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-4 px-4 text-center">
        <p className="text-sm text-destructive sm:text-base">
          {roomQuery.error?.message ?? 'Room not found'}
        </p>

        <Link
          className="rounded-xl border px-4 py-2 text-sm font-medium transition hover:bg-muted sm:py-2.5 sm:text-base"
          href="/chat"
        >
          Back to chat
        </Link>
      </div>
    );
  }

  const room = roomQuery.data;
  const isOwner = room.ownerId === profile.id;

  const memberIds = room.members.map((member) => member.userId);

  const dangerError = deleteMutation.error ?? leaveMutation.error;

  const isDangerMutationPending =
    deleteMutation.isPending || leaveMutation.isPending;

  return (
    <>
      <header className="relative flex min-h-14 shrink-0 items-center justify-center border-b px-14 lg:min-h-16 lg:justify-start lg:gap-3 lg:px-8">
        <Link
          aria-label="Back to room"
          className="absolute left-14 flex size-9 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-muted hover:text-foreground lg:static"
          href={`/chat?roomId=${room.id}`}
        >
          <ArrowLeftIcon className="size-5" />
        </Link>

        <h1 className="truncate text-base font-semibold sm:text-lg">
          Room settings
        </h1>
      </header>

      <section className="min-h-0 flex-1 overflow-y-auto px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
        <div className="mx-auto w-full max-w-3xl">
          <div className="text-center lg:text-left">
            <p className="truncate text-xs font-medium text-primary sm:text-sm">
              #{room.slug}
            </p>

            <h2 className="mt-1 text-xl font-semibold sm:text-2xl">
              Manage this room
            </h2>

            <p className="mt-1 text-sm text-muted-foreground sm:text-base">
              Update details, members, invitations and access.
            </p>
          </div>

          <RoomDetailsSection
            errorMessage={updateMutation.error?.message}
            isOwner={isOwner}
            isPending={updateMutation.isPending}
            isSaved={isSaved}
            onChange={handleSettingsChange}
            onSave={handleSave}
            room={room}
          />

          {isOwner && (
            <section className="mt-4 rounded-2xl border bg-card p-4 text-card-foreground sm:mt-5 sm:p-6">
              <InviteMembers
                existingMemberIds={memberIds}
                inviterId={profile.id}
                roomId={room.id}
              />
            </section>
          )}

          <RoomMembersSection
            currentUserId={profile.id}
            members={room.members}
          />

          <RoomDangerZone
            errorMessage={dangerError?.message}
            isOwner={isOwner}
            isPending={isDangerMutationPending}
            onDelete={handleDeleteRoom}
            onLeave={handleLeaveRoom}
          />
        </div>
      </section>
    </>
  );
}

export default function RoomSettingsPage() {
  const params = useParams<{ roomId: string }>();

  const storedProfile = useSyncExternalStore(
    subscribeToProfile,
    getProfileSnapshot,
    getServerProfileSnapshot,
  );

  const profile = useMemo(
    () => parseChatProfile(storedProfile),
    [storedProfile],
  );

  if (!profile) {
    return null;
  }

  return <RoomSettingsContent profile={profile} roomId={params.roomId} />;
}
