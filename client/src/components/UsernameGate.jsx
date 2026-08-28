import { useState } from 'react';

export function UsernameGate({ onSubmit }) {
  const [name, setName] = useState('');

  function submit(event) {
    event.preventDefault();
    const trimmed = name.trim();
    if (trimmed) onSubmit(trimmed);
  }

  return (
    <div className="flex h-screen items-center justify-center bg-slate-100 p-4">
      <form
        onSubmit={submit}
        className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-xl"
      >
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-slate-800">Welcome to Chat</h1>
          <p className="mt-1 text-sm text-slate-500">Pick a name to get started</p>
        </div>

        <input
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your username"
          className="w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-800 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
        />

        <button
          type="submit"
          disabled={!name.trim()}
          className="mt-4 w-full rounded-xl bg-indigo-500 px-4 py-3 font-semibold text-white transition hover:bg-indigo-600 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Enter chat
        </button>
      </form>
    </div>
  );
}
