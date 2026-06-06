import { CircleUser } from 'lucide-react';
import type { Message } from '../types/Message';
import { useContext } from 'react';
import { UsernameContext } from '../context/UsernameContext';

type Props = {
  message: Message;
};

export const MessageItem: React.FC<Props> = ({ message }) => {
  const time = new Date(message.createdAt);
  const formattedTime = time.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
  const { username } = useContext(UsernameContext);

  if (message.type === 'system') {
    return (
      <li className="message-system">
        <span className='message-system-text'>{message.text}</span>
      </li>
    );
  }

  return (
    <li className={`message ${message.user === username  ? 'message-current-user': ''}`}>
      <CircleUser size={50} />
      <div className="message-data">
        <div className="message-name-and-time">
          <span className="message-username">
            <strong>{message.user}</strong>
          </span>
          <span className="message-time">{formattedTime}</span>
        </div>
        <span>{message.text}</span>
      </div>
    </li>
  );
};
