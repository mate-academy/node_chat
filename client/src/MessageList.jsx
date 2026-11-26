import { useEffect, useRef } from 'react';

export const MessageList = ({ messages, currentUser }) => {
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div style={{ maxHeight: '60vh', overflowY: 'auto', marginBottom: 16 }}>
      {messages.map((m) => (
        <article key={m.id} className="message is-small">
          <div className="message-body">
            <b style={{ color: m.author === currentUser ? '#485fc7' : undefined }}>
              {m.author}
            </b>{' '}
            <small>{new Date(m.time).toLocaleTimeString()}</small>
            <div>{m.text}</div>
          </div>
        </article>
      ))}
      <div ref={endRef} />
    </div>
  );
};