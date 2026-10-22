import { useState } from 'react';

export const MessageForm = ({ onSend, disabled }) => {
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);

  function submitMessage(event) {
    event.preventDefault();
    const message = text.trim();

    if (!message || disabled || sending) {
      return;
    }

    setSending(true);
    try {
      onSend(message);
      setText('');
    } catch {
      return;
    } finally {
      setSending(false);
    }
  }

  return (
    <form className="message-form" onSubmit={submitMessage}>
      <input
        className="message-input"
        type="text"
        maxLength={2000}
        aria-label="Message"
        placeholder="Write a message…"
        value={text}
        onChange={event => setText(event.target.value)}
        disabled={disabled}
      />
      <button
        className="primary-button send-button"
        type="submit"
        disabled={disabled || sending || !text.trim()}
      >
        Send
      </button>
    </form>
  );
};
