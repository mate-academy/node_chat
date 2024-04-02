import { useState } from 'react';
import axios from 'axios';
import { apiUtils } from './API/apiUtils';



export const MessageForm = ({ room, userName }) => {
  const [text, setText] = useState('');

  const handleMessage = async (event) => {
    event.preventDefault();
    
    apiUtils.post({
      text, userName, room, type: 'message'
    })
    
    setText('');
  };

  return (
    <form
      className="field is-horizontal"
      onSubmit={handleMessage}
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
