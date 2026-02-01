import type { Message } from '../types/message';

function formatTime(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString();
}

export const MessageList = ({ messages }: { messages: Message[] }) => (
  <div className="content">
    {messages.length === 0 && (
      <p className="has-text-grey">No messages yet. Humans are shy today.</p>
    )}

    {messages.map((message) => (
      <article className="media box" key={message.id} style={{ marginBottom: '0.75rem' }}>
        <div className="media-content">
          <div className="content">
            <p>
              <strong>{message.author}</strong>{' '}
              <small className="has-text-grey">{formatTime(message.time)}</small>
              <br />
              {message.text}
            </p>
          </div>
        </div>
      </article>
    ))}
  </div>
);

