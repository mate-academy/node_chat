function formatTime(value) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return new Intl.DateTimeFormat(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);
}

export const MessageList = ({ messages }) => (
  <ul className="message-list" aria-live="polite" aria-label="Room messages">
    {messages.length === 0 ? (
      <li className="empty-messages">No messages yet. Start the conversation.</li>
    ) : messages.map((message, index) => (
      <li
        className="message"
        key={message.id ?? `${message.author}-${message.time}-${index}`}
      >
        <div className="message-avatar" aria-hidden="true">
          {message.author.charAt(0).toUpperCase()}
        </div>
        <div className="message-content">
          <div className="message-meta">
            <span className="message-author">{message.author}</span>
            <time className="message-time" dateTime={message.time}>
              {formatTime(message.time)}
            </time>
          </div>
          <p className="message-text">{message.text}</p>
        </div>
      </li>
    ))}
  </ul>
);
