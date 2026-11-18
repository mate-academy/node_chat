import { useEffect, useRef } from 'react';
import type { Message } from '../../types';
import './MessageList.scss';

type Props = {
  messages: Message[];
  currentUser: string;
};

export const MessageList = ({ messages, currentUser }: Props) => {
  const listRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    const list = listRef.current;

    if (list) {
      list.scrollTop = list.scrollHeight;
    }
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div className="messages">
        <p className="messages__empty">Повідомлень ще немає. Напиши першим</p>
      </div>
    );
  }

  return (
    <ul className="messages" ref={listRef}>
      {messages.map((message, index) => {
        const isOwn = message.author === currentUser;

        return (
          <li
            key={`${message.time}-${message.author}-${index}`}
            className={`messages__item ${isOwn ? 'messages__item--own' : ''}`}
          >
            <div className="messages__meta">
              {!isOwn && (
                <span className="messages__author">{message.author}</span>
              )}
              <span className="messages__time">
                {new Date(message.time).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>
            <p className="messages__text">{message.text}</p>
          </li>
        );
      })}
    </ul>
  );
};
