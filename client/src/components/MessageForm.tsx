import { useState } from 'react';
import { sendMessage } from '../api';

interface Props {
  activeRoom: string
}

export const MessageForm: React.FC<Props> = ({activeRoom}) => {
  const [text, setText] = useState('');

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    const author = localStorage.getItem('username');

    if (!text) return;

    await sendMessage(text, author!, activeRoom);
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
      <button type='submit' className="button">Send</button>
    </form>
  );
};
