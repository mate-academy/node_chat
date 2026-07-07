import React, { useState } from 'react';
import { socket } from '../services/socket';

export const MessageForm = ({
  roomId,
  authorId,
}: {
  roomId: string;
  authorId: string;
}) => {
  const [text, setText] = useState('');

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();

    if (!text.trim()) {
      return;
    }

    socket.emit('send_message', { roomId, authorId, text });

    setText('');
  };

  return (
    <form onSubmit={handleSend} style={{ display: 'flex', gap: '10px' }}>
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        style={{
          flexGrow: 1,
          padding: '12px',
          background: '#ffffff',
          color: '#333',
          border: '1px solid #ccc',
          borderRadius: '6px',
          outline: 'none',
        }}
        placeholder="Написати повідомлення..."
      />
      <button
        type="submit"
        style={{
          padding: '12px 24px',
          background: '#007bff',
          color: '#fff',
          fontWeight: 'bold',
          border: 'none',
          borderRadius: '6px',
          cursor: 'pointer',
        }}
      >
        Відправити
      </button>
    </form>
  );
};
