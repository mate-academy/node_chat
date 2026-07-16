import { useState } from 'react';
import { sendMessage } from '../api';

interface Props {
  onMessageSent: () => void;
  username: string;
  roomId: string;
}

export const MessageForm = ({ onMessageSent, username, roomId }: Props) => {
  const [text, setText] = useState('');

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    if (!text) return;

    await sendMessage(text, username, roomId);
    setText('');
    onMessageSent();
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
      <button className="button">Send</button>
    </form>
  );
};
