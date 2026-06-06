import { MessageForm } from './MessageForm';
import { MessageList } from './MessageList';
import { MessageCircle } from 'lucide-react';
import { iconColor } from '../types/IconColor';
import type { Message } from '../types/Message';
import type { Room } from '../types/Room';

type Props = {
  messages: Message[];
  currentRoom: Room | null;
}

export const RoomMessages: React.FC<Props> = ({ messages, currentRoom }) => {

  if (!currentRoom) {
    return (
      <div className="chat-messages">
        <div className="no-rooms">
          <span className="no-rooms-icon">
            <MessageCircle size={30} color={iconColor} />
          </span>
          <h2>Welcome to chat</h2>
          <span className="no-rooms-text">
            Create a room or join an existing one to start the conversation.
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-messages">
      <MessageList messages={messages} />

      <MessageForm currentRoom={currentRoom}/>
    </div>
  );
};
