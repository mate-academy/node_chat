import { useState } from 'react';

export function MessageForm({ onSend }) {
  const [text, setText] = useState('');

  function submit(event) {
    event.preventDefault();
    const trimmed = text.trim();
    if (trimmed) {
      onSend(trimmed);
      setText('');
    }
  }

  return (
    <form
      onSubmit={submit}
      className="flex gap-2 border-t border-slate-200 bg-white px-4 py-3"
    >
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Type a message…"
        className="flex-1 rounded-full border border-slate-200 px-4 py-2 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
      />
      <button
        type="submit"
        disabled={!text.trim()}
        className="rounded-full bg-indigo-500 px-5 py-2 font-semibold text-white transition hover:bg-indigo-600 disabled:opacity-40"
      >
        Send
      </button>
    </form>
  );
}
