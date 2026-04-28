import { useState } from 'react';
import { messageService } from '../services/messageService.js';

export const MessageForm = ({ roomId }) => {
  const [text, setText] = useState('');
  const [error, setError] = useState(null);

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      await messageService.send(text, roomId);
      setText('');
      setError(null);
    } catch {
      setError('Failed to send message. Try again.');
    }
  };

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
      {error && <p className="help is-danger">{error}</p>}
    </form>
  );
};
