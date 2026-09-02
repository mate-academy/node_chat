import { UsersIcon } from '@/components/icons';

type RoomMembersBarProps = {
  memberCount: number;
  onViewMembers: () => void;
};

export function RoomMembersBar({
  memberCount,
  onViewMembers,
}: RoomMembersBarProps) {
  const memberLabel = memberCount === 1 ? 'member' : 'members';
  const isViewMembersDisabled = memberCount === 0;

  return (
    <section className="flex min-h-10 items-center justify-center gap-2.5 border-b bg-muted/30 px-3 text-xs sm:min-h-11 sm:gap-3 sm:px-6 sm:text-sm lg:min-h-12 lg:justify-start lg:gap-4 lg:px-8">
      <div className="flex shrink-0 items-center gap-1.5 text-muted-foreground sm:gap-2">
        <UsersIcon className="size-4 shrink-0 lg:size-5" />

        <span className="whitespace-nowrap">
          {memberCount} {memberLabel}
        </span>
      </div>

      <span aria-hidden="true" className="h-4 w-px shrink-0 bg-border lg:h-5" />

      <button
        className="whitespace-nowrap font-medium text-primary transition hover:opacity-75 disabled:cursor-not-allowed disabled:opacity-50"
        disabled={isViewMembersDisabled}
        onClick={onViewMembers}
        type="button"
      >
        View members
      </button>
    </section>
  );
}
