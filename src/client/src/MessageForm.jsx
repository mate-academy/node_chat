import { useState } from 'react';
import axios from 'axios';

const API_URL = 'http://127.0.0.1:3000/messages';

export const MessageForm = ({ username, room }) => {
  const [text, setText] = useState('');

  function sendMessage(text) {
    return axios.post(API_URL, { text, author: username, room });
  }

  return (
    <form
      className="field is-horizontal"
      onSubmit={async (event) => {
        event.preventDefault();

        await sendMessage(text);

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
