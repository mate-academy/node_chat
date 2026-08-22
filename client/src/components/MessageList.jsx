import React, { useEffect, useRef } from 'react';
import MessageItem from './MessageItem';

const MessageList = ({
  messages,
  currentUserId,
}) => {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: 'smooth',
    });
  }, [messages]);

  return (
    <div
      style={{
        height: 'calc(100vh - 220px)',
        overflowY: 'auto',
      }}
      className="p-4"
    >
      {messages.length === 0 ? (
        <div className="has-text-centered has-text-grey mt-6">
          No messages yet. Be the first to write something!
        </div>
      ) : (
        messages.map((message) => (
          <MessageItem
            key={message.id}
            message={message}
            currentUserId={currentUserId}
          />
        ))
      )}

      <div ref={bottomRef} />
    </div>
  );
};

export default MessageList;
