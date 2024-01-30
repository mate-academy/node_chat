import { FC } from "react";
import { Message as MessageType } from "../../types/message";
import cn from "classnames";

import "./message.scss";

type MessageProps = {
  message: MessageType;
  position?: "left" | "right";
};

export const Message: FC<MessageProps> = ({ message, position }) => {
  const date = new Date(message.createdAt);
  const time = `${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;

  return (
    <div
      className={cn("message", {
        "message--right": position === "right",
      })}
    >
      <p className="message__author">{message.author}</p>
      <p className="message__text">{message.text}</p>
      <p className="message__time">{time}</p>
    </div>
  );
};
