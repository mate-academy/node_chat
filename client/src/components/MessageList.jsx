export function MessageList({ messages }) {
  return (
    <ul className="message-list">
      {messages.map((msg) => (
        <li key={msg.id} className="message-item">
          <div>
            <strong>{msg.author}</strong>{' '}
            <span className="time">{new Date(msg.time).toLocaleTimeString()}</span>
          </div>
          <div>{msg.text}</div>
        </li>
      ))}
    </ul>
  );
}