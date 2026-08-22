import { useState } from 'react';
import type { Message } from '../types/Message';
import { MessageCard } from './MessageCard';
import { PaperAirplaneIcon } from '@heroicons/react/16/solid';

interface Props {
  className: string;
  currentHistory: Message[];
  onSendMessage: (text: string) => void;
  username: string;
}

export const Chat: React.FC<Props> = ({
  className,
  currentHistory,
  onSendMessage,
  username,
}) => {
  const [text, setText] = useState('');

  return (
    <div className={`${className} flex flex-col h-full`}>
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2">
        {currentHistory.map((messageData) => (
          <MessageCard
            username={username}
            messageData={messageData}
            key={messageData.date}
          />
        ))}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSendMessage(text);
          setText('');
        }}
        className="hrink-0 flex gap-5 w-full p-1 px-3 secondary-color"
      >
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Write a message..."
          autoFocus
          className="elements-text-accent-color text-md w-full outline-none rounded-md px-2 py-2 focus:outline-slate-600"
        />
        <button className="shrink-0 rounded-full ml-2 cursor-pointer flex items-center justify-center">
          <PaperAirplaneIcon className="w-8 h-8 elements-text-color" />
        </button>
      </form>
    </div>
  );
};
