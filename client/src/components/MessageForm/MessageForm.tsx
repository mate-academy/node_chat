import React, { useEffect, useRef, useState } from 'react';

type Props = {
  send: (message: string) => void;
};

export const MessageForm: React.FC<Props> = ({ send }) => {
  const [text, setText] = useState('');
  const input = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (input.current) {
      input.current.focus();
    }
  });

  return (
    <form
      className="field messageField"
      onSubmit={e => {
        e.preventDefault();

        if (text.trim().length === 0) {
          return;
        }

        send(text);

        input.current?.focus();
        setText('');
      }}
    >
      <input
        ref={input}
        type="text"
        className="input"
        placeholder="Enter a message"
        value={text}
        onChange={e => setText(e.target.value)}
      />
      <button className="button">Send</button>
    </form>
  );
};
