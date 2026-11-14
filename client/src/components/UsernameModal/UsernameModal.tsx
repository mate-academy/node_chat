import { useState } from 'react';

interface UsernameModalProps {
  onSubmit: (username: string) => void;
}

const UsernameModal = ({ onSubmit }: UsernameModalProps) => {
  const [username, setUsername] = useState('');

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedUsername = username.trim();

    if (!trimmedUsername) return;

    onSubmit(trimmedUsername);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl"
      >
        <h2 className="mb-2 text-xl font-semibold">Welcome to Chat</h2>

        <p className="mb-5 text-sm text-gray-500">
          Enter your username to continue.
        </p>

        <input
          type="text"
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          placeholder="Your username"
          maxLength={100}
          autoFocus
          className="mb-4 w-full rounded-lg border border-gray-300 px-4 py-2 outline-none focus:border-blue-500"
        />

        <button
          type="submit"
          disabled={!username.trim()}
          className="w-full rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Continue
        </button>
      </form>
    </div>
  );
};

export default UsernameModal;
