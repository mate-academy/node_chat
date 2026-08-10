import './MessageList.css';
import { getAvatarColor, getInitial } from './avatarColor.js';

export const MessageList = ({ messages }) => (
  <ul className="message-list">
    {messages.map((message) => {
      const color = getAvatarColor(message.author);

      return (
        <li key={message.time + message.author}>
          <div
            className="avatar"
            style={{ background: color.bg, color: color.text }}
          >
            {getInitial(message.author)}
          </div>

          <div className="message-body">
            <div>
              <strong>{message.author}</strong>{' '}
              <span className="time">
                {new Date(message.time).toLocaleTimeString()}
              </span>
            </div>
            <p>{message.text}</p>
          </div>
        </li>
      );
    })}
  </ul>
);
