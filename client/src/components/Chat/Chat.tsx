
import type { Message, Room } from '../../types';
import MessageList from '../MessageList/MessageList';
import MessageInput from '../MessageInput/MessageInput';

interface ChatProps {
  room: Room | null;
  messages: Message[];
  username: string;
  onSend: (text: string) => void;
}

const Chat = ({
  room,
  messages,
  username,
  onSend,
}: ChatProps) => {
  if (!room) {
    return (
      <main className="flex flex-1 items-center justify-center text-gray-400">
        Select a room to start chatting
      </main>
    );
  }

  return (
    <main className="flex min-w-0 flex-1 flex-col">
      <div className="border-b border-gray-200 px-4 py-3">
        <h2 className="text-lg font-semibold">{room.name}</h2>
      </div>

      <MessageList
        messages={messages}
        currentUsername={username}
      />

      <MessageInput onSend={onSend} />
    </main>
  );
};

export default Chat;
