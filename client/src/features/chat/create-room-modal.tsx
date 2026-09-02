'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  type ChangeEvent,
  type FormEvent,
  type MouseEvent,
  useEffect,
  useState,
} from 'react';

import { XIcon } from '@/components/icons';
import { createRoom } from '@/lib/api';

type CreateRoomModalProps = {
  ownerId: string;
  onClose: () => void;
  onCreated: (roomId: string) => void;
};

export function CreateRoomModal({
  ownerId,
  onClose,
  onCreated,
}: CreateRoomModalProps) {
  const queryClient = useQueryClient();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);

  const normalizedName = name.trim();

  const createMutation = useMutation({
    mutationFn: () =>
      createRoom({
        name: normalizedName,
        description: description.trim() || undefined,
        visibility: isPrivate ? 'PRIVATE' : 'PUBLIC',
        ownerId,
      }),

    onSuccess: async (room) => {
      await queryClient.invalidateQueries({
        queryKey: ['rooms', ownerId],
      });

      onCreated(room.id);
    },
  });
  const canSubmit = normalizedName.length >= 2 && !createMutation.isPending;

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

  function handleNameChange(event: ChangeEvent<HTMLInputElement>) {
    setName(event.target.value);
    createMutation.reset();
  }

  function handleDescriptionChange(event: ChangeEvent<HTMLTextAreaElement>) {
    setDescription(event.target.value);
    createMutation.reset();
  }

  function handleVisibilityChange(event: ChangeEvent<HTMLInputElement>) {
    setIsPrivate(event.target.checked);
    createMutation.reset();
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!canSubmit) {
      return;
    }

    createMutation.mutate();
  }

  function handleBackdropClick() {
    onClose();
  }

  function handleModalClick(event: MouseEvent<HTMLElement>) {
    event.stopPropagation();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/30 p-2 backdrop-blur-[2px] sm:p-6"
      onClick={handleBackdropClick}
      role="presentation"
    >
      <section
        aria-labelledby="create-room-title"
        aria-modal="true"
        className="max-h-[calc(100dvh-1rem)] w-full max-w-xl overflow-y-auto rounded-2xl border bg-card p-4 text-card-foreground shadow-2xl sm:max-h-[calc(100dvh-3rem)] sm:p-6 lg:p-8"
        onClick={handleModalClick}
        role="dialog"
      >
        <header className="flex items-start justify-between gap-4 sm:gap-6">
          <div className="min-w-0">
            <h2
              className="text-lg font-semibold sm:text-xl lg:text-2xl"
              id="create-room-title"
            >
              Create a room
            </h2>

            <p className="mt-1 text-xs text-muted-foreground sm:mt-2 sm:text-sm lg:text-base">
              Start a new space for your team.
            </p>
          </div>

          <button
            aria-label="Close create room"
            className="flex size-9 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-muted hover:text-foreground sm:size-10"
            onClick={onClose}
            type="button"
          >
            <XIcon className="size-4 sm:size-5" />
          </button>
        </header>

        <form
          className="mt-5 space-y-4 sm:mt-6 sm:space-y-5 lg:mt-8 lg:space-y-6"
          onSubmit={handleSubmit}
        >
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium sm:mb-2 sm:text-base">
              Room name
            </span>

            <input
              autoFocus
              className="min-h-10 w-full rounded-xl border bg-input px-3 py-2 text-sm outline-none transition focus:ring-2 focus:ring-ring/30 sm:min-h-11 sm:px-4 sm:py-3 sm:text-base"
              maxLength={80}
              minLength={2}
              onChange={handleNameChange}
              placeholder="e.g. marketing"
              required
              value={name}
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-sm font-medium sm:mb-2 sm:text-base">
              Description
            </span>

            <textarea
              className="min-h-20 w-full resize-none rounded-xl border bg-input px-3 py-2 text-sm outline-none transition focus:ring-2 focus:ring-ring/30 sm:min-h-24 sm:px-4 sm:py-3 sm:text-base lg:min-h-28"
              maxLength={500}
              onChange={handleDescriptionChange}
              placeholder="What is this room for?"
              value={description}
            />
          </label>

          <label className="flex cursor-pointer items-center gap-3 rounded-xl border p-3 sm:gap-4 sm:p-4">
            <input
              checked={isPrivate}
              className="size-4 shrink-0 accent-primary sm:size-5"
              onChange={handleVisibilityChange}
              type="checkbox"
            />

            <span className="min-w-0">
              <span className="block text-sm font-medium sm:text-base">
                Private room
              </span>

              <span className="mt-0.5 block text-xs text-muted-foreground sm:text-sm">
                Only invited members can join.
              </span>
            </span>
          </label>

          {createMutation.error && (
            <p
              aria-live="polite"
              className="text-xs text-destructive sm:text-sm"
            >
              {createMutation.error.message}
            </p>
          )}

          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end sm:gap-3">
            <button
              className="min-h-10 rounded-xl px-4 py-2 text-sm font-medium transition hover:bg-muted sm:px-5 sm:py-3 sm:text-base"
              onClick={onClose}
              type="button"
            >
              Cancel
            </button>

            <button
              className="min-h-10 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 sm:px-5 sm:py-3 sm:text-base"
              disabled={!canSubmit}
              type="submit"
            >
              {createMutation.isPending ? 'Creating...' : 'Create room'}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
