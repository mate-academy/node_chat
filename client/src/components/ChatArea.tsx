import type React from 'react';
import type { Room } from '../types/types.js';
import { useEffect, useRef, useState } from 'react';

interface Props {
  room: Room;
  onSendMessage: (message: string) => void;
}

export const ChatArea: React.FC<Props> = ({ room, onSendMessage }) => {
  const [messageText, setMessageText] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [room.messages]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!messageText.trim()) {
      return;
    }

    onSendMessage(messageText);
    setMessageText('');
  };

  return (
    <div>
      <h2 className="chat-header">{room.name}</h2>
      <div>
        {room.messages.map((message) => {
          const displayTime = new Date(message.time).toLocaleTimeString();

          return (
            <div key={message.id} className="message-bubble">
              <div className="message-meta">
                <span className="message-author">{message.author}</span>
                <span className="message-time">{displayTime}</span>
              </div>
              <div className="message-text">{message.text}</div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="chat-form">
        <input
          type="text"
          value={messageText}
          onChange={(event) => setMessageText(event.target.value)}
          placeholder="Enter a message..."
        />
        <button type="submit">Send</button>
      </form>
    </div>
  );
};
