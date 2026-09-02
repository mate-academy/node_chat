'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { joinRoom } from '@/lib/api';

type JoinRoomPromptProps = {
  roomId: string;
  userId: string;
};

export function JoinRoomPrompt({ roomId, userId }: JoinRoomPromptProps) {
  const queryClient = useQueryClient();

  const joinMutation = useMutation({
    mutationFn: () => joinRoom(roomId, userId),

    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: ['rooms', userId],
      }),
  });

  function handleJoinRoom() {
    joinMutation.mutate();
  }

  return (
    <div className="flex min-h-0 flex-1 items-center justify-center overflow-hidden px-4 py-8 text-center sm:px-6 sm:py-10 lg:p-8">
      <div className="w-full max-w-md">
        <h2 className="text-lg font-semibold sm:text-xl">Join this room</h2>

        <p className="mt-1.5 text-sm text-muted-foreground sm:mt-2 sm:text-base">
          Join the room to read and send messages.
        </p>

        <button
          className="mt-5 min-h-10 w-full rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 sm:mt-6 sm:w-auto sm:px-6 sm:py-3 sm:text-base"
          disabled={joinMutation.isPending}
          onClick={handleJoinRoom}
          type="button"
        >
          {joinMutation.isPending ? 'Joining...' : 'Join room'}
        </button>

        {joinMutation.error && (
          <p
            aria-live="polite"
            className="mt-3 text-xs text-destructive sm:text-sm"
          >
            {joinMutation.error.message}
          </p>
        )}
      </div>
    </div>
  );
}
