'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef, useState } from 'react';

import { BellIcon, XIcon } from '@/components/icons';
import { getPendingInvitations, respondToInvitation } from '@/lib/api';

type InvitationsMenuProps = {
  profileId: string;
};

type InvitationAction = 'accept' | 'decline';

type InvitationResponse = {
  invitationId: string;
  action: InvitationAction;
};

export function InvitationsMenu({ profileId }: InvitationsMenuProps) {
  const queryClient = useQueryClient();
  const menuRef = useRef<HTMLDivElement>(null);

  const [isOpen, setIsOpen] = useState(false);

  const invitationsQuery = useQuery({
    queryKey: ['room-invitations', profileId],
    queryFn: () => getPendingInvitations(profileId),
    refetchInterval: 10_000,
  });

  const responseMutation = useMutation({
    mutationFn: ({ invitationId, action }: InvitationResponse) =>
      respondToInvitation(invitationId, profileId, action),

    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ['room-invitations', profileId],
        }),
        queryClient.invalidateQueries({
          queryKey: ['rooms', profileId],
        }),
      ]);
    },
  });

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    function handlePointerDown(event: PointerEvent) {
      const target = event.target;

      if (!(target instanceof Node)) {
        return;
      }

      if (!menuRef.current?.contains(target)) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    }

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const invitations = invitationsQuery.data ?? [];
  const hasInvitations = invitations.length > 0;
  const isEmpty = !invitationsQuery.isLoading && !hasInvitations;

  function toggleMenu() {
    setIsOpen((currentValue) => !currentValue);
  }

  function closeMenu() {
    setIsOpen(false);
  }

  function handleResponse(invitationId: string, action: InvitationAction) {
    responseMutation.mutate({
      invitationId,
      action,
    });
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        aria-label="Invitations"
        className="relative flex size-10 items-center justify-center rounded-xl text-muted-foreground transition hover:bg-muted hover:text-foreground sm:size-11"
        onClick={toggleMenu}
        type="button"
      >
        <BellIcon className="size-5" />

        {hasInvitations && (
          <span className="absolute right-0 top-0 flex size-4.5 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground sm:size-5 sm:text-xs">
            {invitations.length}
          </span>
        )}
      </button>

      {isOpen && (
        <section
          aria-label="Pending invitations"
          className="absolute right-0 top-full z-50 mt-2 w-[calc(100vw-4rem)] max-w-72 rounded-2xl border bg-popover p-3 text-popover-foreground shadow-xl md:left-1/2 md:right-auto md:mt-3 md:w-80 md:max-w-[calc(100vw-2rem)] md:-translate-x-1/4 md:p-4"
          role="dialog"
        >
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-sm font-semibold md:text-base">Invitations</h2>

            <button
              aria-label="Close invitations"
              className="flex size-9 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-muted hover:text-foreground"
              onClick={closeMenu}
              type="button"
            >
              <XIcon className="size-4 md:size-5" />
            </button>
          </div>

          {invitationsQuery.isLoading && (
            <p className="mt-3 text-xs text-muted-foreground md:mt-4 md:text-sm">
              Loading...
            </p>
          )}

          {isEmpty && (
            <p className="mt-3 text-xs text-muted-foreground md:mt-4 md:text-sm">
              No pending invitations
            </p>
          )}

          {hasInvitations && (
            <div className="mt-3 max-h-72 space-y-2 overflow-y-auto overscroll-contain pr-1 md:mt-4 md:max-h-80 md:space-y-3">
              {invitations.map((invitation) => (
                <article
                  className="rounded-xl border p-3 md:p-4"
                  key={invitation.id}
                >
                  <p className="truncate text-sm font-medium md:text-base">
                    #{invitation.room.name}
                  </p>

                  <p className="mt-1 truncate text-xs text-muted-foreground md:text-sm">
                    Invited by {invitation.invitedBy.displayName}
                  </p>

                  <div className="mt-3 flex gap-2 md:mt-4">
                    <button
                      className="rounded-lg bg-primary px-3 py-2 text-xs font-medium text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                      disabled={responseMutation.isPending}
                      onClick={() => handleResponse(invitation.id, 'accept')}
                      type="button"
                    >
                      Accept
                    </button>

                    <button
                      className="rounded-lg border px-3 py-2 text-xs font-medium transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                      disabled={responseMutation.isPending}
                      onClick={() => handleResponse(invitation.id, 'decline')}
                      type="button"
                    >
                      Decline
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}

          {responseMutation.error && (
            <p
              aria-live="polite"
              className="mt-3 text-xs text-destructive md:text-sm"
            >
              {responseMutation.error.message}
            </p>
          )}
        </section>
      )}
    </div>
  );
}
