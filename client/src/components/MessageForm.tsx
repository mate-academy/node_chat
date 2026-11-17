import { useState } from 'react';

type Props = {
  onSend: (text: string) => void;
};

export const MessageForm = ({ onSend }: Props) => {
  const [text, setText] = useState('');

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        if (!text.trim()) return;
        onSend(text);
        setText('');
      }}
    >
      <input
        value={text}
        onChange={(event) => setText(event.target.value)}
        placeholder="Write a message"
      />
      <button>Send</button>
    </form>
  );
};
