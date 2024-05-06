import React from 'react';
import './MessageList.scss';
import { MessageItem } from '../MessageItem/MessageItem';
import { useEffect, useRef } from 'react';
import { Message } from '../../types/message';

type Props = {
  messages: Message[];
};

export const MessageList: React.FC<Props> = ({ messages }) => {
  const messageListRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messageListRef.current) {
      messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="wrapper" ref={messageListRef}>
      {messages.length === 0 ? (
        <>
          <div className="empty">
            <p>no messages yet</p>
            <p>write the first one</p>
          </div>
        </>
      ) : (
        <ul className="list">
          {messages.map(message => (
            <MessageItem key={message.time} message={message} />
          ))}
        </ul>
      )}
    </div>
  );
};
