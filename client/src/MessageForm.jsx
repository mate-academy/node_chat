import { useState } from 'react';

export const MessageForm = ({ onSend, disabled }) => {
  const [text, setText] = useState('');

  return (
    <form
      className="field"
      onSubmit={(event) => {
        event.preventDefault();

        const trimmed = text.trim();

        if (trimmed) {
          onSend(trimmed);
          setText('');
        }
      }}
    >
      <input
        type="text"
        className="input"
        placeholder="Enter a message"
        value={text}
        onChange={event => setText(event.target.value)}
        disabled={disabled}
      />
      <button className="button is-success" disabled={disabled || !text.trim()}>
        Send
      </button>
    </form>
  );
};
