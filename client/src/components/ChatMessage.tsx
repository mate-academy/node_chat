import React from 'react';

interface MessageProps {
  user: string;
  message: string;
}

const ChatMessage: React.FC<MessageProps> = ({ user, message }) => {
  return (
    <div className="flex mb-2">
      <div className="bg-blue-500 text-white rounded-lg p-2 mr-2">
        <p className="font-bold">{user}</p>
        <p>{message}</p>
      </div>
    </div>
  );
};

export default ChatMessage;
