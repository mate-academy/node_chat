import { useState } from 'react';
import axios from 'axios';
import './MessageForm.css';

const API_URL = (process.env.REACT_APP_API_URL || 'http://localhost:3001') + '/messages';

function sendMessage(text, roomId, userName) {
  return axios.post(API_URL, { text, roomId, userName });
}

export const MessageForm = ({ roomId, userName }) => {
  const [text, setText] = useState('');

  return (
    <form
      className="form-row message-form"
      onSubmit={async (event) => {
        event.preventDefault();

        await sendMessage(text, roomId, userName);

        setText('');
      }}
    >
      <input
        type="text"
        className="text-input"
        placeholder="Enter a message"
        value={text}
        onChange={(event) => setText(event.target.value)}
      />
      <button className="app-button app-button--primary">Send</button>
    </form>
  );
};
