import { useState } from 'react';
import axios from 'axios';

const API_URL = 'http://127.0.0.1:5000/messages';

function sendMessage(text) {
  return axios.post(API_URL, { text });
}

export const MessageForm = () => {
  const [text, setText] = useState('');

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
        onChange={event => setText(event.target.value)}
      />
      <button className="button">Send</button>
    </form>
  );
};
