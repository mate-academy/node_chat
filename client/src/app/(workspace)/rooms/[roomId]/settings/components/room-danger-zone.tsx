type RoomDangerZoneProps = {
  isOwner: boolean;
  isPending: boolean;
  errorMessage?: string;
  onDelete: () => void;
  onLeave: () => void;
};

export function RoomDangerZone({
  isOwner,
  isPending,
  errorMessage,
  onDelete,
  onLeave,
}: RoomDangerZoneProps) {
  const description = isOwner
    ? 'Deleting permanently removes this room and its messages.'
    : 'Leaving removes this room from your workspace.';

  return (
    <section className="mt-4 rounded-2xl border border-destructive/30 bg-destructive/5 p-4 sm:mt-5 sm:p-6">
      <h3 className="text-sm font-semibold text-destructive sm:text-base">
        Danger zone
      </h3>

      <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
        {description}
      </p>

      {isOwner ? (
        <button
          className="mt-4 min-h-10 w-full rounded-xl border border-destructive px-4 py-2 text-sm font-medium text-destructive transition hover:bg-destructive/10 disabled:cursor-not-allowed disabled:opacity-50 sm:mt-5 sm:w-auto sm:px-5 sm:py-2.5 sm:text-base"
          disabled={isPending}
          onClick={onDelete}
          type="button"
        >
          {isPending ? 'Deleting...' : 'Delete room'}
        </button>
      ) : (
        <button
          className="mt-4 min-h-10 w-full rounded-xl border border-destructive px-4 py-2 text-sm font-medium text-destructive transition hover:bg-destructive/10 disabled:cursor-not-allowed disabled:opacity-50 sm:mt-5 sm:w-auto sm:px-5 sm:py-2.5 sm:text-base"
          disabled={isPending}
          onClick={onLeave}
          type="button"
        >
          {isPending ? 'Leaving...' : 'Leave room'}
        </button>
      )}

      {errorMessage && (
        <p
          aria-live="polite"
          className="mt-3 text-xs text-destructive sm:mt-4 sm:text-sm"
        >
          {errorMessage}
        </p>
      )}
    </section>
  );
}
