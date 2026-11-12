
import { useState } from 'react';

interface MessageInputProps {
  onSend: (text: string) => void;
}

const MessageInput = ({ onSend }: MessageInputProps) => {
  const [text, setText] = useState('');

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedText = text.trim();

    if (!trimmedText) return;

    onSend(trimmedText);
    setText('');
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex gap-2 border-t border-gray-200 p-4"
    >
      <input
        type="text"
        value={text}
        onChange={(event) => setText(event.target.value)}
        placeholder="Write a message..."
        className="flex-1 rounded-lg border border-gray-300 px-4 py-2 outline-none focus:border-blue-500"
      />

      <button
        type="submit"
        disabled={!text.trim()}
        className="rounded-lg bg-blue-600 px-5 py-2 text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        Send
      </button>
    </form>
  );
};

export default MessageInput;
