import type { Page } from '../App';
import Chat from '../services/web-chat';

interface NameInputProps {
  onName: (name: string) => void;
  onPage: (page: Page) => void;
  name: string;
}

export const Registration = ({ name, onName, onPage }: NameInputProps) => {
  const handleSend = async () => {
    try {
      if (!name.trim()) return;
      await Chat.registration(name);
      localStorage.setItem('user', name)
      onName('');
      onPage('room');
    } catch (e) {
      console.log(e);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleSend();
  };

  return (
    <>
      <h1 className="text-center text-xl font-medium mt-25">
        Enter your nickname to join the chat
      </h1>

      <div className="w-full flex mt-10 justify-center">
        <div className=" flex items-center  gap-2  w-64">
          <input
            type="text"
            value={name}
            onChange={(e) => onName(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Enter name..."
            className="flex-1 rounded border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-500"
          />
          <button
            onClick={handleSend}
            disabled={!name.trim()}
            className="rounded bg-gray-500 px-4 py-2 text-sm text-white disabled:opacity-40 hover:bg-gray-700"
          >
            Send
          </button>
        </div>
      </div>
    </>
  );
};
