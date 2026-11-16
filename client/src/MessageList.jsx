import { useEffect, useRef } from 'react';
import classNames from 'classnames';

function formatTime(isoTime) {
  return new Date(isoTime).toLocaleString([], {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export const MessageList = ({ messages, username }) => {
  const bottomRef = useRef(null);

  // Keep the newest message in view
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (messages.length === 0) {
    return <p className="messages has-text-grey">No messages yet</p>;
  }

  return (
    <ul className="messages">
      {messages.map(message => (
        <li
          key={message.id}
          className={classNames('message-item', {
            'is-own': message.author === username,
          })}
        >
          <div className="message-meta">
            <strong>{message.author}</strong>
            <time dateTime={message.time}>{formatTime(message.time)}</time>
          </div>
          <div className="message-text">{message.text}</div>
        </li>
      ))}
      <li ref={bottomRef} />
    </ul>
  );
};
