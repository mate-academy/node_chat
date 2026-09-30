import { useEffect, useRef, useState } from "react";
import type { Message } from "../types/Message";
import { socket } from "../socket";

const formatTime = (t: number) =>
  new Date(t).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

interface ChatProps {
  roomName?: string;
  messages: Message[];
  username: string;
  onMenu: () => void;
}

export const Chat = ({ roomName, messages, username, onMenu }: ChatProps) => {
  const [text, setText] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView();
  }, [messages]);

  function send(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!text.trim()) return;
    socket.emit("message:send", text);
    setText("");
  }

  return (
    <main className="flex min-w-0 flex-1 flex-col">
      <header className="flex items-center gap-3 border-b border-line px-4 py-3.5 md:px-6">
        <button
          onClick={onMenu}
          aria-label="Открыть список комнат"
          className="rounded p-1 text-muted hover:text-text md:hidden"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          >
            <path d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <h2 className="truncate font-mono text-sm">
          <span className="text-accent">#</span> {roomName ?? "…"}
        </h2>
      </header>

      <div className="flex-1 overflow-y-auto px-4 py-4 md:px-6">
        {messages.length === 0 && (
          <p className="font-mono text-sm text-muted">
            It's empty for now. Write the first message.
          </p>
        )}
        <ul className="space-y-1">
          {messages.map((m) => {
            const mine = m.author === username;
            return (
              <li
                key={m.id}
                className="flex gap-3 py-0.5 text-sm leading-relaxed"
              >
                <time className="w-11 shrink-0 pt-px font-mono text-xs text-zinc-600">
                  {formatTime(m.time)}
                </time>
                <div className="min-w-0">
                  <span
                    className={`mr-2 font-mono text-xs ${mine ? "text-accent" : "text-muted"}`}
                  >
                    {m.author}
                  </span>
                  <span className="whitespace-pre-wrap wrap-break-word text-text">
                    {m.text}
                  </span>
                </div>
              </li>
            );
          })}
        </ul>
        <div ref={bottomRef} />
      </div>

      <form
        onSubmit={send}
        className="border-t border-line p-3 md:px-6 md:py-4"
      >
        <div
          className="flex items-center gap-2 rounded-md border border-line bg-panel px-3
                        transition-colors focus-within:border-accent"
        >
          <span className="font-mono text-sm text-accent">&gt;</span>
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={`Message in #${roomName ?? ""}`}
            maxLength={2000}
            className="min-w-0 flex-1 bg-transparent py-2.5 text-sm outline-none placeholder:text-zinc-600"
          />
          <button
            disabled={!text.trim()}
            className="font-mono text-xs text-muted transition-colors hover:text-accent
                       disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:text-muted"
          >
            enter
          </button>
        </div>
      </form>
    </main>
  );
};
