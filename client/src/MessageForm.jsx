import { useState } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:3005/messages';

export const MessageForm = ({ room }) => {
  const [text, setText] = useState('');

  function sendMessage(text, room) {
    const author = localStorage.getItem('username');
  
    return axios.post(API_URL, { text, author, room });
  }

  return (
    <form
      className="field is-horizontal"
      onSubmit={async (event) => {
        event.preventDefault();
        if (!text.trim()) return;
        
        await sendMessage(text, room);
        
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
