import { useEffect, useRef } from 'react';

const AVATAR_COLORS = [
  'bg-rose-400',
  'bg-amber-400',
  'bg-emerald-400',
  'bg-sky-400',
  'bg-violet-400',
  'bg-pink-400',
];

function colorFor(name) {
  let sum = 0;
  for (const ch of name) sum += ch.charCodeAt(0);
  return AVATAR_COLORS[sum % AVATAR_COLORS.length];
}

function formatTime(iso) {
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export function MessageList({ messages, username }) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center text-sm text-slate-400">
        No messages yet — say hi! 👋
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-3 overflow-y-auto px-6 py-4">
      {messages.map((message) => {
        const mine = message.author === username;

        return (
          <div
            key={message.id}
            className={`flex items-end gap-2 ${mine ? 'flex-row-reverse' : ''}`}
          >
            {/* Avatar */}
            <div
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white ${colorFor(
                message.author,
              )}`}
              title={message.author}
            >
              {message.author.charAt(0).toUpperCase()}
            </div>

            {/* Bubble */}
            <div
              className={`max-w-[70%] rounded-2xl px-4 py-2 shadow-sm ${
                mine
                  ? 'rounded-br-sm bg-indigo-500 text-white'
                  : 'rounded-bl-sm bg-white text-slate-800'
              }`}
            >
              {!mine && (
                <div className="mb-0.5 text-xs font-semibold text-indigo-500">
                  {message.author}
                </div>
              )}
              <div className="break-words">{message.text}</div>
              <div
                className={`mt-1 text-right text-[10px] ${
                  mine ? 'text-indigo-100' : 'text-slate-400'
                }`}
              >
                {formatTime(message.createdAt)}
              </div>
            </div>
          </div>
        );
      })}
      <div ref={bottomRef} />
    </div>
  );
}
