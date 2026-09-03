function formatTime(isoString) {
  return new Date(isoString).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function Message({ message, isOwn }) {
  return (
    <li className={`message${isOwn ? ' own' : ''}`}>
      <div className="message-meta">
        <span className="message-author">{message.author}</span>
        {' · '}
        <span className="message-time">{formatTime(message.createdAt)}</span>
      </div>
      <div className="message-text">{message.text}</div>
    </li>
  );
}
