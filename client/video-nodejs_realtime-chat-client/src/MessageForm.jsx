import { useState, useRef } from 'react';

const TYPING_THROTTLE_MS = 1500;

export const MessageForm = ({ onSend, onTyping }) => {
  const [text, setText] = useState('');
  const lastTypingSentRef = useRef(0);

  return (
    <form
      className="field is-horizontal"
      onSubmit={(event) => {
        event.preventDefault();
        if (!text.trim()) return;

        onSend(text);
        setText('');
      }}
    >
      <input
        type="text"
        className="input"
        placeholder="Enter a message"
        value={text}
        onChange={(event) => {
          setText(event.target.value);

          const now = Date.now();
          if (now - lastTypingSentRef.current > TYPING_THROTTLE_MS) {
            onTyping();
            lastTypingSentRef.current = now;
          }
        }}
      />
      <button className="button">Send</button>
    </form>
  );
};