import React, { useState } from 'react';

export const SendMessage = ({ socket, userName, room }) => {
  const [message, setMessage] = useState('');

  const sendMessage = () => {
    if (message !== '') {
      const createdtime = Date.now();

      socket.emit('send_message', { userName, room, message, createdtime });
      setMessage('');
    }
  };

  return (
    <div className="send-message">
      <input
        className="message-input"
        placeholder='Message...'
        onChange={(e) => setMessage(e.target.value)}
        value={message}
      />
      <button className='button button-primary' onClick={sendMessage}>
        Send Message
      </button>
    </div>
  );
};
