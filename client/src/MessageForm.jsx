import { useState } from 'react';

export const MessageForm = ({ onSend }) => {
  const [text, setText] = useState('');

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
        onChange={(event) => setText(event.target.value)}
      />
      <button className="button">Send</button>
    </form>
  );
};