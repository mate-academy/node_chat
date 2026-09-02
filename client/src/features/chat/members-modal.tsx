'use client';

import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';

import { XIcon } from '@/components/icons';
import { getRoomDetails } from '@/lib/api';
import type { ChatProfile, ChatRoom } from '@/types/chat';

type MembersModalProps = {
  profile: ChatProfile;
  room: ChatRoom;
  onClose: () => void;
};

export function MembersModal({ profile, room, onClose }: MembersModalProps) {
  const roomQuery = useQuery({
    queryKey: ['room', room.id, profile.id],
    queryFn: () => getRoomDetails(room.id, profile.id),
  });

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose();
      }
    }

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  function handleBackdropClick() {
    onClose();
  }

  function stopModalClick(event: React.MouseEvent<HTMLElement>) {
    event.stopPropagation();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/30 p-2 backdrop-blur-[2px] sm:p-6"
      onClick={handleBackdropClick}
      role="presentation"
    >
      <section
        aria-labelledby="members-modal-title"
        aria-modal="true"
        className="flex max-h-[calc(100dvh-1rem)] w-full max-w-lg flex-col overflow-hidden rounded-2xl border bg-card text-card-foreground shadow-2xl sm:max-h-[min(42rem,calc(100dvh-3rem))]"
        onClick={stopModalClick}
        role="dialog"
      >
        <header className="flex shrink-0 items-center justify-between gap-4 border-b px-4 py-3.5 sm:px-6 sm:py-5">
          <div className="min-w-0">
            <h2
              className="truncate text-lg font-semibold sm:text-xl"
              id="members-modal-title"
            >
              Members
            </h2>

            <p className="mt-0.5 truncate text-sm text-muted-foreground">
              #{room.name}
            </p>
          </div>

          <button
            aria-label="Close members"
            className="flex size-10 shrink-0 items-center justify-center rounded-xl text-muted-foreground transition hover:bg-muted hover:text-foreground"
            onClick={onClose}
            type="button"
          >
            <XIcon className="size-5" />
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-3 sm:p-6">
          {roomQuery.isPending && (
            <p className="py-6 text-center text-sm text-muted-foreground">
              Loading members...
            </p>
          )}

          {roomQuery.error && (
            <p
              aria-live="polite"
              className="py-6 text-center text-sm text-destructive"
            >
              {roomQuery.error.message}
            </p>
          )}

          {roomQuery.data && (
            <div className="space-y-2 sm:space-y-3">
              {roomQuery.data.members.map((member) => (
                <article
                  className="flex min-h-16 items-center gap-3 rounded-xl border p-3 sm:gap-4 sm:p-4"
                  key={member.userId}
                >
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-semibold sm:size-11">
                    {member.user.displayName.slice(0, 2).toUpperCase()}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium sm:text-base">
                      {member.user.displayName}
                    </p>

                    <p className="mt-0.5 text-xs text-muted-foreground sm:text-sm">
                      {member.role}
                    </p>
                  </div>

                  {member.userId === profile.id && (
                    <span className="shrink-0 rounded-lg bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
                      You
                    </span>
                  )}
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
