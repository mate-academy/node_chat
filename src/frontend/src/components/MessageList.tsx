import { MessageSquareMore } from 'lucide-react';
import type { Message } from '../types/Message';
import { MessageItem } from './MessageItem';
import { iconColor } from '../types/IconColor';
import { useEffect, useRef } from 'react';

type Props = {
  messages: Message[];
};

export const MessageList: React.FC<Props> = ({ messages }) => {
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: 'smooth',
    });
  }, [messages]);

  return (
    <>
      {messages.length === 0 ? (
        <div className="no-messages">
          <MessageSquareMore size={40} color={iconColor} />
          <p>
            <strong>No messages yet</strong>
          </p>
          <p className="no-messages-grey-text">
            Be the first one to send a message in this room.
          </p>
        </div>
      ) : (
        <ul className="message-list">
          {messages.map((message) => (
            <MessageItem key={message.id} message={message} />
          ))}

          <div ref={messagesEndRef} />
        </ul>
      )}
    </>
  );
};
