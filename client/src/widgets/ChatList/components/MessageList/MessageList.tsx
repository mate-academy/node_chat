import React, { useEffect, useRef } from "react";
import { Stack } from "react-bootstrap";
import { Message } from "../../../../entities/Message";
import moment from "moment";
import { useAppSelector } from "../../../../shared/hooks/reduxHooks";

type Props = {
  messages: Message[];
}

export const MessageList: React.FC<Props> = ({ messages }) => {
  const lastMessage = useRef<HTMLDivElement>(null);
  const { user } = useAppSelector(state => state.user);

  useEffect(() => {
    if (lastMessage.current) {
      lastMessage.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  return (
    <Stack gap={3} className="messages">
      {messages.map(message => (
        <Stack
          key={message.id}
          className={`message flex-grow-0 ${message.author === user?.name
            ? 'self align-self-end'
            : 'align-self-start'
            }`}
        >
          <span>{message.text}</span>
          <span className="message-footer">{moment(message.date).calendar()}</span>
          {message.userId === user?.id && (
            <span className="message-footer">
              {message.read
                ? < img src="icons/read.svg" alt="read" />
                : <img src="icons/not-read.svg" alt="not read" />
              }
            </span>
          )}
        </Stack>
      ))}
      <div ref={lastMessage}></div>
    </Stack>
  );
}