import { useRef } from 'react';

export const AuthForm = ({ onLogin }) => {
  const inputRef = useRef(null);

  const submitUsername = () => {
    const entered = inputRef.current?.value.trim();
    if (!entered) return;

    onLogin(entered);
    localStorage.setItem('nickname', entered);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    submitUsername();
  };

  return (
    <section className="px-6 py-5">
      <h2 className="text-lg font-semibold mb-3">Choose a nickname:</h2>
      <form onSubmit={handleSubmit} className="flex items-center gap-3">
        <input
          ref={inputRef}
          type="text"
          placeholder="Nickname"
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none"
        />
        <button
          type="submit"
          className="bg-green-600 text-white py-2 px-5 rounded hover:bg-green-700 transition"
        >
          Enter
        </button>
      </form>
    </section>
  );
};
