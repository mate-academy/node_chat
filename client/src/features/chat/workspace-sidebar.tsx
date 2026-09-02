'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  type ChangeEvent,
  type MouseEvent as ReactMouseEvent,
  useState,
} from 'react';

import { LockIcon, PanelLeftIcon, PlusIcon } from '@/components/icons';
import { getRooms } from '@/lib/api';
import { cn } from '@/lib/utils';
import type { ChatProfile, ChatRoom } from '@/types/chat';

import { CreateRoomModal } from './create-room-modal';
import { SidebarHeader } from './sidebar-header';

type WorkspaceSidebarProps = {
  profile: ChatProfile;
  isOpen: boolean;
  onClose: () => void;
  onToggle: () => void;
};

type RoomLinkProps = {
  room: ChatRoom;
  selected: boolean;
  onNavigate: () => void;
};

function RoomLink({ room, selected, onNavigate }: RoomLinkProps) {
  const roomLinkClassName = cn(
    'flex min-h-11 w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition sm:px-4 sm:py-3 sm:text-base',
    selected
      ? 'bg-primary/10 text-primary'
      : 'text-muted-foreground hover:bg-muted hover:text-foreground',
  );

  return (
    <Link
      className={roomLinkClassName}
      href={`/chat?roomId=${room.id}`}
      onClick={onNavigate}
    >
      <span className="flex size-5 shrink-0 items-center justify-center text-lg">
        {room.visibility === 'PRIVATE' ? <LockIcon className="size-4" /> : '#'}
      </span>

      <span className="min-w-0 flex-1 truncate">{room.name}</span>

      <span className="shrink-0 text-xs">{room._count.members}</span>
    </Link>
  );
}

export function WorkspaceSidebar({
  profile,
  isOpen,
  onClose,
  onToggle,
}: WorkspaceSidebarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [search, setSearch] = useState('');
  const [isCreateRoomOpen, setIsCreateRoomOpen] = useState(false);

  const roomsQuery = useQuery({
    queryKey: ['rooms', profile.id],
    queryFn: () => getRooms(profile.id),
  });

  const rooms = roomsQuery.data ?? [];
  const normalizedSearch = search.trim().toLowerCase();

  const filteredRooms = rooms.filter((room) =>
    room.name.toLowerCase().includes(normalizedSearch),
  );

  const joinedRooms = filteredRooms.filter((room) => room.members.length > 0);

  const discoverRooms = filteredRooms.filter(
    (room) => room.members.length === 0,
  );

  const selectedRoomId = searchParams.get('roomId') ?? rooms[0]?.id;

  const sidebarClassName =
    'pointer-events-none fixed inset-y-0 left-0 z-50 flex h-dvh w-[calc(100%_-_3rem)] max-w-80 shrink-0 -translate-x-full flex-col border-r bg-sidebar p-4 shadow-2xl transition-transform duration-300 ease-out data-[open=true]:pointer-events-auto data-[open=true]:translate-x-0 sm:p-6 lg:static lg:z-30 lg:w-80 lg:max-w-none lg:translate-x-0 lg:pointer-events-auto lg:shadow-none';

  const toggleIconClassName = cn(
    'size-5 transition-transform duration-300',
    isOpen ? 'rotate-180' : 'rotate-0',
  );

  function handleSearchChange(event: ChangeEvent<HTMLInputElement>) {
    setSearch(event.target.value);
  }

  function handleSidebarClick(event: ReactMouseEvent<HTMLElement>) {
    const target = event.target;

    if (target instanceof Element && target.closest('a')) {
      onClose();
    }
  }

  function openCreateRoomModal() {
    setIsCreateRoomOpen(true);
  }

  function closeCreateRoomModal() {
    setIsCreateRoomOpen(false);
  }

  function handleRoomCreated(roomId: string) {
    setIsCreateRoomOpen(false);
    onClose();
    router.push(`/chat?roomId=${roomId}`);
  }

  return (
    <>
      <aside
        aria-label="Workspace navigation"
        className={sidebarClassName}
        data-open={isOpen}
        id="workspace-sidebar"
        onClickCapture={handleSidebarClick}
      >
        <button
          aria-controls="workspace-sidebar"
          aria-expanded={isOpen}
          aria-label={isOpen ? 'Close navigation' : 'Open navigation'}
          className="pointer-events-auto absolute top-4 -right-11 flex size-11 items-center justify-center rounded-r-xl border border-l-0 bg-sidebar text-muted-foreground shadow-md transition hover:text-foreground sm:top-6 lg:hidden"
          onClick={onToggle}
          type="button"
        >
          <PanelLeftIcon className={toggleIconClassName} />
        </button>

        <SidebarHeader profile={profile} />

        <input
          aria-label="Search rooms"
          className="mt-6 min-h-10 w-full rounded-xl border bg-input px-3.5 py-2 text-base outline-none transition placeholder:text-muted-foreground focus:ring-2 focus:ring-ring/30 sm:mt-8 sm:min-h-11 sm:px-4 sm:text-sm"
          onChange={handleSearchChange}
          placeholder="Search rooms"
          value={search}
        />

        <div className="mt-6 min-h-0 flex-1 overflow-y-auto overscroll-contain pr-1 sm:mt-8">
          <section>
            <div className="flex items-center justify-between px-3 sm:px-4">
              <h2 className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
                Your rooms
              </h2>

              <button
                aria-label="Create room"
                className="flex size-9 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-muted hover:text-foreground"
                onClick={openCreateRoomModal}
                type="button"
              >
                <PlusIcon className="size-5" />
              </button>
            </div>

            <div className="mt-2 space-y-1 sm:mt-3">
              {joinedRooms.map((room) => (
                <RoomLink
                  key={room.id}
                  onNavigate={onClose}
                  room={room}
                  selected={selectedRoomId === room.id}
                />
              ))}
            </div>
          </section>

          <section className="mt-6 sm:mt-8">
            <h2 className="px-3 text-xs font-semibold tracking-widest text-muted-foreground uppercase sm:px-4">
              Discover
            </h2>

            <div className="mt-2 space-y-1 sm:mt-3">
              {discoverRooms.map((room) => (
                <RoomLink
                  key={room.id}
                  onNavigate={onClose}
                  room={room}
                  selected={selectedRoomId === room.id}
                />
              ))}
            </div>
          </section>

          {roomsQuery.isPending && (
            <p className="mt-5 px-3 text-sm text-muted-foreground sm:px-4">
              Loading rooms...
            </p>
          )}

          {roomsQuery.error && (
            <p
              aria-live="polite"
              className="mt-5 px-3 text-sm text-destructive sm:px-4"
            >
              {roomsQuery.error.message}
            </p>
          )}
        </div>
      </aside>

      {isCreateRoomOpen && (
        <CreateRoomModal
          onClose={closeCreateRoomModal}
          onCreated={handleRoomCreated}
          ownerId={profile.id}
        />
      )}
    </>
  );
}
