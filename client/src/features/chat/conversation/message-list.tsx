import { Fragment } from 'react';

import type { ChatMessage } from '@/types/chat';

import { isSameMessageDay, MessageDateDivider } from './message-date-divider';
import { MessageItem } from './message-item';

type MessageListProps = {
  messages: ChatMessage[];
  currentUserId: string;
  onEdit: (messageId: string, text: string) => boolean;
  onDelete: (messageId: string) => boolean;
};

export function MessageList({
  messages,
  currentUserId,
  onEdit,
  onDelete,
}: MessageListProps) {
  return (
    <div className="min-w-0">
      {messages.map((message, index) => {
        const previousMessage = messages[index - 1];

        const showDateDivider =
          !previousMessage ||
          !isSameMessageDay(message.createdAt, previousMessage.createdAt);

        const isOwnMessage = message.authorId === currentUserId;

        return (
          <Fragment key={message.id}>
            {showDateDivider && (
              <MessageDateDivider createdAt={message.createdAt} />
            )}

            <MessageItem
              isOwnMessage={isOwnMessage}
              message={message}
              onDelete={onDelete}
              onEdit={onEdit}
            />
          </Fragment>
        );
      })}
    </div>
  );
}
