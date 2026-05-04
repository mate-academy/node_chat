import { Fragment, useLayoutEffect, useMemo, useRef } from 'react';
import classNames from 'classnames';
import { formatDayLabel, type DisplayMessage } from './chatPageUtils';
import type { Room } from './types';

type DateGroup = {
  dateKey: string;
  label: string;
  messages: DisplayMessage[];
};

function groupByDate(messages: DisplayMessage[]): DateGroup[] {
  const groups: DateGroup[] = [];

  for (const message of messages) {
    const date = new Date(message.date);
    const dateKey = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
    // If the message belongs to the same date as the last group, add it to that group
    const lastGroup = groups.at(-1);

    if (lastGroup && lastGroup.dateKey === dateKey) {
      lastGroup.messages.push(message);
    } else {
      // Otherwise, create a new group
      groups.push({
        dateKey,
        label: formatDayLabel(message.date),
        messages: [message],
      });
    }
  }

  return groups;
}

type MessageListProps = {
  activeRoom: Room | undefined;
  error: string;
  messages: DisplayMessage[];
  username: string;
};

function MessageList({
  activeRoom,
  error,
  messages,
  username,
}: MessageListProps) {
  const groups = useMemo(() => groupByDate(messages), [messages]);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const previousRoomNameRef = useRef<string | null>(null);
  const scrolledRoomNameRef = useRef<string | null>(null);

  // useLayoutEffect runs synchronously after all DOM updates
  // auto-scrolling to new messages
  useLayoutEffect(() => {
    const roomName = activeRoom?.name ?? null;

    if (previousRoomNameRef.current !== roomName) {
      previousRoomNameRef.current = roomName;
      scrolledRoomNameRef.current = null;
    }

    if (!roomName) {
      return;
    }

    if (!messages.length || scrolledRoomNameRef.current === roomName) {
      return;
    }

    const scrollContainer = scrollContainerRef.current;

    if (!scrollContainer) {
      return;
    }

    // Auto-scroll to the bottom of the message list to show the newest message
    // "scroll all the way down"
    scrollContainer.scrollTop = scrollContainer.scrollHeight;
    scrolledRoomNameRef.current = roomName;
  }, [activeRoom?.name, messages.length]);

  return (
    <div className="message-scroll" ref={scrollContainerRef}>
      {error && <p className="chat-status error">{error}</p>}

      {activeRoom && messages.length ? (
        groups.map((group) => (
          <Fragment key={group.dateKey}>
            <time className="day-pill">{group.label}</time>
            <ol className="message-list">
              {group.messages.map((message) => (
                <li
                  className={classNames('message-row', {
                    mine: message.author === username,
                    'message-appear': message.shouldAnimate,
                  })}
                  key={message.id}
                >
                  {message.author !== username && (
                    <div className="message-meta">
                      <strong>{message.author}</strong>
                      <span>&middot;</span>
                      <time>{message.time}</time>
                    </div>
                  )}
                  <p className="message-bubble">{message.body}</p>
                  {message.author === username && (
                    <time className="message-time">{message.time}</time>
                  )}
                </li>
              ))}
            </ol>
          </Fragment>
        ))
      ) : (
        <p className="chat-status">
          {activeRoom ? 'No messages yet.' : 'No rooms yet.'}
        </p>
      )}
    </div>
  );
}

export default MessageList;
