import { useState } from 'react';

type Props = {
  onSend: (text: string) => void;
};

export function MessageForm({ onSend }: Props) {
  const [text, setText] = useState('');

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const value = text.trim();
    if (!value) return;
    onSend(value);
    setText('');
  };

  return (
    <form onSubmit={submit}>
    <div className="field has-addons">
      <div className="control is-expanded">
        <input
          className="input"
          type="text"
          placeholder="Type a message..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
      </div>

      <div className="control">
        <button className="button is-link" type="submit">
          Send
        </button>
      </div>
    </div>
  </form>
  );
}
