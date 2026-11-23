import { useEffect, useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import './MessageList.css';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store/store';
import { useWebSocket } from '../../context/hooks';

export const MessageList = () => {
  const socket = useWebSocket();
  const currentUsername = socket?.user.name ?? '';

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isAtBottomRef = useRef(true);

  const messages = useSelector((state: RootState) => state.messages.messages);

  const virtualizer = useVirtualizer({
    count: messages.length,

    getScrollElement: () => messagesEndRef.current,

    estimateSize: () => 80,

    overscan: 5,
  });

  function handleScroll() {
    const container = messagesEndRef.current;

    if (!container) return;

    const distanceFromBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight;

    isAtBottomRef.current = distanceFromBottom < 80;
  }

  useEffect(() => {
    if (messages.length === 0) return;

    if (isAtBottomRef.current) {
      virtualizer.scrollToIndex(messages.length - 1, {
        align: 'end',
        behavior: 'smooth',
      });
    }
  }, [messages.length]);

  return (
    <div
      className="messages-container"
      ref={messagesEndRef}
      onScroll={handleScroll}
    >
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {virtualizer.getVirtualItems().map((virtualItem) => {
          const message = messages[virtualItem.index];

          const isOwnMessage = message.author === currentUsername;

          const isServerMessage = message.author === 'server';

          return (
            <div
              key={virtualItem.key}
              data-index={virtualItem.index}
              ref={virtualizer.measureElement}
              className={`message-wrapper ${
                isServerMessage
                  ? 'message-center'
                  : isOwnMessage
                    ? 'message-right'
                    : 'message-left'
              }`}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                transform: `translateY(${virtualItem.start}px)`,
              }}
            >
              {isServerMessage ? (
                <div className="server-message">{message.text}</div>
              ) : (
                <div
                  className={`message-box ${
                    isOwnMessage ? 'light' : 'default'
                  }`}
                >
                  <div className="message-title">
                    <strong
                      className={
                        isOwnMessage ? 'has-text-primary' : 'has-text-dark'
                      }
                    >
                      {message.author}
                      {isOwnMessage && ' (You)'}
                    </strong>

                    <small className="has-text-grey ml-3">
                      {new Date(message.time).toLocaleTimeString().slice(0, 5)}
                    </small>
                  </div>

                  <p>{message.text}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
