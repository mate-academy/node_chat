import type { Message } from '../../types';

interface MessageListProps {
  messages: Message[];
  currentUsername: string;
}

const MessageList = ({ messages, currentUsername }: MessageListProps) => {
  return (
    <div className="flex flex-1 flex-col gap-3 overflow-y-auto p-4">
      {messages.map((message) => {
        const isOwnMessage = message.author === currentUsername;

        return (
          <div
            key={message.id}
            className={`flex flex-col ${
              isOwnMessage ? 'items-end' : 'items-start'
            }`}
          >
            <span className="mb-1 text-xs text-gray-500">{message.author}</span>

            <div
              className={`max-w-[75%] rounded-xl px-4 py-2 ${
                isOwnMessage
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-900'
              }`}
            >
              <p className="break-words">{message.text}</p>
            </div>

            <span className="mt-1 text-xs text-gray-400">
              {new Date(message.createdAt).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          </div>
        );
      })}

      {messages.length === 0 && (
        <p className="text-center text-sm text-gray-400">No messages yet</p>
      )}
    </div>
  );
};

export default MessageList;
