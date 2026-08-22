import type { Message } from '../types/Message';
import { formatTime } from '../utils/formatTime';

interface Props {
  messageData: Message;
  username: string;
}

export const MessageCard: React.FC<Props> = ({ messageData, username }) => {
  if (messageData.isSystem) {
    return (
      <div className="self-center elements-color w-max px-2 py-0.5 rounded-2xl">
        <p>{messageData.text}</p>
      </div>
    );
  }

  const isMe = messageData.username === username;
  return (
    <div
      className={`  max-w-[85%] px-2 py-1 rounded-2xl flex flex-col items-stretch
        ${isMe ? 'elements-accent-color self-end' : 'elements-color self-start'}`}
    >
      {!isMe && (
        <span className="text-xs font-bold text-amber-300 mb-1">
          {messageData.username}
        </span>
      )}
      <p className="wrap-anywhere">{messageData.text}</p>
      <span className="self-end text-sm">{formatTime(messageData.date)}</span>
    </div>
  );
};
