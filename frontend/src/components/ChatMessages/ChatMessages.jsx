import { memo } from 'react';
import { Message } from '../Message';
import './ChatMessages.css';

export const ChatMessages = memo(({ socket, messages }) => {
  return (
    <div className="ChatMessages Chat__messages">
      {messages
        .sort((a, b) => {
          return new Date(b.createdAt) - new Date(a.createdAt);
        })
        .map((message) => (
          <Message key={message.id} message={message} socket={socket} />
        ))}
    </div>
  );
});
