'use client';

import { type FormEvent } from 'react';

type RoomVisibility = 'PUBLIC' | 'PRIVATE';

export type UpdateRoomSettingsInput = {
  name: string;
  description?: string;
  visibility: RoomVisibility;
};

type RoomDetailsSectionProps = {
  room: {
    name: string;
    description: string | null;
    visibility: RoomVisibility;
    updatedAt: string | Date;
  };
  isOwner: boolean;
  isPending: boolean;
  isSaved: boolean;
  errorMessage?: string;
  onChange: () => void;
  onSave: (input: UpdateRoomSettingsInput) => void;
};

export function RoomDetailsSection({
  room,
  isOwner,
  isPending,
  isSaved,
  errorMessage,
  onChange,
  onSave,
}: RoomDetailsSectionProps) {
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const normalizedName = String(formData.get('name') ?? '').trim();

    const normalizedDescription = String(
      formData.get('description') ?? '',
    ).trim();

    const isPrivate = formData.has('isPrivate');

    if (normalizedName.length < 2) {
      return;
    }

    onSave({
      name: normalizedName,
      description: normalizedDescription || undefined,
      visibility: isPrivate ? 'PRIVATE' : 'PUBLIC',
    });
  }

  function handleFieldChange() {
    onChange();
  }

  return (
    <section className="mt-5 rounded-2xl border bg-card p-4 text-card-foreground sm:mt-6 sm:p-6 lg:mt-8">
      {isOwner ? (
        <form
          className="space-y-4 sm:space-y-5"
          key={String(room.updatedAt)}
          onSubmit={handleSubmit}
        >
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium sm:mb-2">
              Room name
            </span>

            <input
              className="min-h-10 w-full rounded-xl border bg-input px-3 py-2 text-sm outline-none transition focus:ring-2 focus:ring-ring/30 sm:min-h-11 sm:px-4 sm:py-3 sm:text-base"
              defaultValue={room.name}
              maxLength={80}
              minLength={2}
              name="name"
              onChange={handleFieldChange}
              required
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-sm font-medium sm:mb-2">
              Description
            </span>

            <textarea
              className="min-h-20 w-full resize-y rounded-xl border bg-input px-3 py-2 text-sm outline-none transition focus:ring-2 focus:ring-ring/30 sm:min-h-28 sm:px-4 sm:py-3 sm:text-base"
              defaultValue={room.description ?? ''}
              maxLength={500}
              name="description"
              onChange={handleFieldChange}
            />
          </label>

          <label className="flex min-h-10 cursor-pointer items-center gap-2.5 rounded-xl border p-3 text-sm sm:gap-3 sm:p-4">
            <input
              className="size-4 shrink-0 accent-primary"
              defaultChecked={room.visibility === 'PRIVATE'}
              name="isPrivate"
              onChange={handleFieldChange}
              type="checkbox"
            />

            <span>Private room</span>
          </label>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
            <button
              className="min-h-10 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto sm:px-5 sm:py-2.5 sm:text-base"
              disabled={isPending}
              type="submit"
            >
              {isPending ? 'Saving...' : 'Save changes'}
            </button>

            {isSaved && (
              <p
                aria-live="polite"
                className="text-center text-xs text-accent sm:text-left sm:text-sm"
              >
                Changes saved
              </p>
            )}
          </div>

          {errorMessage && (
            <p
              aria-live="polite"
              className="text-xs text-destructive sm:text-sm"
            >
              {errorMessage}
            </p>
          )}
        </form>
      ) : (
        <div>
          <h3 className="text-sm font-medium sm:text-base">Room information</h3>

          <dl className="mt-4 space-y-3 sm:space-y-4">
            <div>
              <dt className="text-xs text-muted-foreground sm:text-sm">
                Room name
              </dt>

              <dd className="mt-1 break-words text-sm sm:text-base">
                {room.name}
              </dd>
            </div>

            <div>
              <dt className="text-xs text-muted-foreground sm:text-sm">
                Description
              </dt>

              <dd className="mt-1 break-words text-sm sm:text-base">
                {room.description ?? 'No room description'}
              </dd>
            </div>

            <div>
              <dt className="text-xs text-muted-foreground sm:text-sm">
                Visibility
              </dt>

              <dd className="mt-1 text-sm sm:text-base">
                {room.visibility === 'PRIVATE' ? 'Private' : 'Public'}
              </dd>
            </div>
          </dl>

          <p className="mt-4 text-xs text-muted-foreground sm:mt-5 sm:text-sm">
            Only the room owner can change room settings.
          </p>
        </div>
      )}
    </section>
  );
}
