import { useRef } from 'react';

export function Login({ setUsername }) {
  const nameInput = useRef();

  const handleNameSubmit = () => {
    const newName = nameInput.current.value;
    if (!newName.trim()) return;

    setUsername(newName);
    localStorage.setItem('username', newName);
  };

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Enter your username:</h1>
      <form
        action="#"
        className="flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          handleNameSubmit();
        }}
      >
        <input
          className="border p-2 rounded"
          placeholder="Your name"
          ref={nameInput}
        />
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Send
        </button>
      </form>
    </div>
  );
}
