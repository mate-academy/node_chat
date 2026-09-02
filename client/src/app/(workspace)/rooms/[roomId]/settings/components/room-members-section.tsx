type RoomMember = {
  userId: string;
  role: string;
  user: {
    displayName: string;
  };
};

type RoomMembersSectionProps = {
  members: RoomMember[];
  currentUserId: string;
};

function getInitials(name: string) {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

export function RoomMembersSection({
  members,
  currentUserId,
}: RoomMembersSectionProps) {
  return (
    <section className="mt-4 rounded-2xl border bg-card p-4 text-card-foreground sm:mt-5 sm:p-6">
      <h3 className="text-sm font-medium sm:text-base">
        Members ({members.length})
      </h3>

      <div className="mt-3 max-h-64 space-y-1.5 overflow-y-auto overscroll-contain pr-1 sm:mt-5 sm:max-h-72 sm:space-y-2 sm:pr-2">
        {members.map((member) => (
          <article
            className="flex min-h-14 items-center gap-2.5 rounded-xl px-2 py-2 transition hover:bg-muted/50 sm:min-h-16 sm:gap-3"
            key={member.userId}
          >
            <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold sm:size-11 sm:text-base">
              {getInitials(member.user.displayName)}
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium sm:text-base">
                {member.user.displayName}
              </p>

              <p className="mt-0.5 text-xs text-muted-foreground">
                {member.role}
              </p>
            </div>

            {member.userId === currentUserId && (
              <span className="shrink-0 rounded-full bg-primary/10 px-2 py-1 text-[10px] font-medium text-primary sm:px-2.5 sm:text-xs">
                You
              </span>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}
