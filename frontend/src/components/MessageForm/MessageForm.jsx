import { useState } from 'react';
import { sendData } from '../../webSocket';

export const MessageForm = ({ name, room }) => {
  const [text, setText] = useState('');

  return (
    <form
      className="field"
      onSubmit={async event => {
        event.preventDefault();

        sendData(text, name, room);
        setText('');
      }}
    >
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
