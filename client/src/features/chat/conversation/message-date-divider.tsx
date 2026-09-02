type MessageDateDividerProps = {
  createdAt: string;
};

export function isSameMessageDay(firstValue: string, secondValue: string) {
  const firstDate = new Date(firstValue);
  const secondDate = new Date(secondValue);

  return (
    firstDate.getFullYear() === secondDate.getFullYear() &&
    firstDate.getMonth() === secondDate.getMonth() &&
    firstDate.getDate() === secondDate.getDate()
  );
}

function getDateLabel(value: string) {
  const date = new Date(value);
  const today = new Date();
  const yesterday = new Date();

  yesterday.setDate(today.getDate() - 1);

  if (isSameMessageDay(value, today.toISOString())) {
    return 'Today';
  }

  if (isSameMessageDay(value, yesterday.toISOString())) {
    return 'Yesterday';
  }

  return date.toLocaleDateString([], {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: date.getFullYear() === today.getFullYear() ? undefined : 'numeric',
  });
}

export function MessageDateDivider({ createdAt }: MessageDateDividerProps) {
  return (
    <div className="my-4 flex items-center gap-2 sm:my-5 sm:gap-3 lg:my-6 lg:gap-4">
      <div className="h-px min-w-2 flex-1 bg-border" />

      <time
        className="shrink-0 rounded-full border bg-card px-2.5 py-1 text-[10px] font-medium text-muted-foreground sm:px-3 sm:text-xs"
        dateTime={createdAt}
      >
        {getDateLabel(createdAt)}
      </time>

      <div className="h-px min-w-2 flex-1 bg-border" />
    </div>
  );
}
