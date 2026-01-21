import { useState } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:3005/messages';

function sendMessage(message) {
  return axios.post(API_URL, message);
}

export const MessageForm = ({ room, username }) => {
  const [text, setText] = useState('');

  return (
    <form
      className="field is-horizontal"
      onSubmit={async (event) => {
        event.preventDefault();

        await sendMessage({
          text,
          author: username,
          room, 
        });

        setText('');
      }}
    >
      <input
        type="text"
        className="input"
        placeholder="Enter a message"
        value={text}
        onChange={(event) => setText(event.target.value)}
        required
      />

      <button className="button">Send</button>
    </form>
  );
};
