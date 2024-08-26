import React, { useEffect, useState } from 'react';
import * as Types from '../types';
import { messageService } from '../services/messageService';
const websocketApi = import.meta.env.VITE_API_WEBSOCKET;

interface Props {
  user: Types.User | null;
  messages: Types.Message[];
  setMessages: React.Dispatch<React.SetStateAction<Types.Message[]>>;
  selectedRoom: Types.Room | null;
}

const ChatArea: React.FC<Props> = ({
  user,
  messages,
  setMessages,
  selectedRoom,
}) => {
  const [newMessage, setNewMessage] = useState<string>('');

  useEffect(() => {
    if (!selectedRoom) {
      return;
    }

    const socket = new WebSocket(websocketApi);

    socket.addEventListener('message', (event: { data: string }) => {
      try {
        const incomingMessage: Types.Message = JSON.parse(event.data);
        setMessages((prev) => [...prev, incomingMessage]);
      } catch (error) {
        console.error(error);
      }
    });

    return () => socket.close();
  }, [selectedRoom, setMessages]);

  const handleSendMessage = async () => {
    if (newMessage.trim() !== '' && user && selectedRoom) {
      const message = await messageService.createOne(
        user.id,
        selectedRoom.id,
        newMessage,
      );

      setMessages([...messages, message]);
      setNewMessage('');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  return (
    <div className="flex-1 bg-gray-50 p-4">
      <h2 className="font-semibold text-xl mb-4">{selectedRoom?.name} Chat</h2>
      <div className="flex flex-col space-y-2">
        {messages.length > 0 ? (
          messages.map((message) => (
            <div
              key={message.id}
              className="p-3 bg-white shadow rounded-lg border border-gray-300"
            >
              <div className="text-sm text-gray-500 flex justify-between">
                <span className="font-medium">{message.author.name}</span>
                <span>{message.createdAt}</span>
              </div>
              <div className="mt-1 text-gray-800">{message.text}</div>
            </div>
          ))
        ) : (
          <p>Choose a chat room and start the conversation!</p>
        )}
      </div>
      <div className="p-4 bg-gray-50 flex items-center border-t mt-4">
        <input
          type="text"
          value={newMessage}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          className="flex-grow p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Type your message..."
        />
        <button
          onClick={handleSendMessage}
          className="ml-4 p-2 bg-blue-500 text-white rounded-lg"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatArea;
