import type { Message } from '../types/message.ts';

export const MessageList = ({ messages }: { messages: Message[] }) => (
  <div className="content">
    {messages.length === 0 && (
      <p className="has-text-grey">No messages yet. Humans are shy today.</p>
    )}

    {messages.map((message) => (
      <article className="media box" key={message.time} style={{ marginBottom: '0.75rem' }}>
        <div className="media-content">
          <div className="content">
            <p>
              <strong>{message.author}</strong>{' '}
              <small className="has-text-grey">{message.time}</small>
              <br />
              {message.text}
            </p>
          </div>
        </div>
      </article>
    ))}
  </div>
)
