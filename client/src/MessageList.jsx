import { useEffect, useRef } from 'react';

export const MessageList = ({ messages, currentUser }) => {
  const endRef = useRef(null);

  useEffect(() => {
    if (endRef.current) {
      endRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  return (
    <div style={{ maxHeight: '60vh', overflowY: 'auto', marginBottom: 16 }}>
      {messages.map((message) => (
        <article key={message.id} className="message is-small">
          <div className="message-body">
            <b
              style={{
                color: message.author === currentUser ? '#485fc7' : undefined,
              }}
            >
              {message.author}
            </b>{' '}
            <small>{new Date(message.time).toLocaleTimeString()}</small>
            <div>{message.text}</div>
          </div>
        </article>
      ))}
      <div ref={endRef} />
    </div>
  );
};