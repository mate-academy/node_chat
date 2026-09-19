import { useState } from "react";
import { useChat } from "../ChatContext";

export const MessageForm = () => {
  const [text, setText] = useState("");
  const { sendMessage } = useChat();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const trimmedText = text.trim();
    if (!trimmedText) return;

    sendMessage({ text: trimmedText });
    setText("");
  };

  return (
    <form className="chat-form" onSubmit={handleSubmit}>
      <input
        type="text"
        className="chat-input"
        placeholder="Напишіть повідомлення..."
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <button className="chat-send-btn" type="submit" disabled={!text.trim()}>
        <span>Надіслати</span>
        <svg
          viewBox="0 0 24 24"
          width="16"
          height="16"
          fill="currentColor"
          className="send-icon"
        >
          <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
        </svg>
      </button>
    </form>
  );
};
