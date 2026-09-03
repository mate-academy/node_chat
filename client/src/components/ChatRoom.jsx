import { useEffect, useRef, useState } from 'react';
import { Message } from './Message';

export function ChatRoom({ room, messages, username, onSend }) {
  const [text, setText] = useState('');
  const listRef = useRef(null);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
  }, [messages]);

  function handleSubmit(event) {
    event.preventDefault();

    const value = text.trim();

    if (!value) {
      return;
    }

    onSend(value);
    setText('');
  }

  return (
    <main className="chat-panel">
      <header className="chat-header">
        <h2>{room ? room.name : '-'}</h2>
        <span className="current-username">{username}</span>
      </header>

      <ul className="messages-list" ref={listRef}>
        {messages.map((message) => (
          <Message key={message.id} message={message} isOwn={message.author === username} />
        ))}
      </ul>

      <form className="message-form" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Type a message..."
          autoComplete="off"
          value={text}
          onChange={(event) => setText(event.target.value)}
        />
        <button type="submit">Send</button>
      </form>
    </main>
  );
}
