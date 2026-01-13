import React from "react";
import type { Message } from "../types/message";

export const MessageItem: React.FC<{ message: Message; isMe?: boolean }> = ({
  message,
  isMe,
}) => {
  return (
    <div className={isMe ? "message me" : "message"}>
      <div style={{ fontSize: 12, opacity: 0.8 }}>
        {message.author} • {new Date(message.time).toLocaleTimeString()}
      </div>
      <div style={{ marginTop: 6 }}>{message.text}</div>
    </div>
  );
};
