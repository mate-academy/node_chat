import { useState } from 'react';

interface Props {
  onSend: (text: string) => void;
}

export const MessageForm = ({ onSend }: Props) => {
  const [text, setText] = useState('');

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    if (!text.trim()) {
      return;
    }

    onSend(text);

    setText('');
  }

  return (
    <form className="field is-horizontal" onSubmit={handleSubmit}>
      <input
        type="text"
        className="input"
        placeholder="Enter a message"
        value={text}
        onChange={event => setText(event.target.value)}
      />

      <button className="button" type="submit">Send</button>
    </form>
  );
};
