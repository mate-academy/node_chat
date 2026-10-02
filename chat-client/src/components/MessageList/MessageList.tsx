import { useEffect, useRef } from "react";
import type { Message } from "../../types/message"

import './MessageList.scss';

type Props = {
  messages: Message[];
  name: string,
}


export const MessageList = ({ messages, name }: Props) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  function formatTime(timestamp: number) {
    const time = new Date(timestamp);
    const timeNormalize = time.toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' })
    return timeNormalize;
  }

  if (messages.length < 1) {
    return <h3>Поки що тихо...</h3>
  }

  return (
    <div className="container">
      {messages.map((message) => {
        const isOwner = name === message.author

        return (
          <div key={message.messageId} className={`message--list ${isOwner ? 'message--list__owner' : ''}`}>
            <p className="message--list__author">{message.author}</p>
            <p className="message--list__text">{message.content}</p>
            <p className="message--list__time">{formatTime(message.timestamp)}</p>
          </div>
        )
      })}
      <div ref={bottomRef} />
    </div >
  )
}
