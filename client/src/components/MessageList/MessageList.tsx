import type React from "react";
import type { Message } from "../../types/Message";
import classNames from "classnames";
import './MessageList.scss';

type Props = {
  messages: Message[];
  username: string;
}

export const MessageList: React.FC<Props> = ({ messages, username }) => {
  return (
    <div className="messageList">
      <ul className="messageList__list">
        {messages.map(message => (
          <li className={classNames('messageList__message', {
            'messageList__messageLeft': message.username !== username
          })} key={message.id}>
            <h2 className="messageList__username">{message.username}</h2>
            <p className="messageList__text">{message.text}</p>
            <p className="messageList__time">{message.time.toString()}</p>
          </li>
        ))}
      </ul>
   </div>
  )
}
