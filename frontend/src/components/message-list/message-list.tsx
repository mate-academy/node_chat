import { FC, useEffect, useRef } from "react";
import { Message as MessageType } from "../../types/message";
import { useUser } from "../../hooks/useUser";
import { Message } from "../message/message";

import "./message-list.scss";

type MessageListProps = {
  messages: MessageType[];
};

export const MessageList: FC<MessageListProps> = ({ messages }) => {
  const { userName: currentUser } = useUser();

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="messages">
      {messages.map((message) => {
        const position = message.author === currentUser ? "right" : "left";
        return (
          <Message key={message.id} message={message} position={position} />
        );
      })}
      <div ref={messagesEndRef} />
    </div>
  );
};
