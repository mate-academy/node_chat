import React, { useState } from 'react';
import { Socket } from 'socket.io-client';

import './SendMessage.scss';

type Props = {
  userName: string,
  roomId: number,
  socket: Socket,
};

export const SendMessage: React.FC<Props> = ({
  userName,
  roomId,
  socket,
}) => {
  const [messageText, setMessageText] = useState('');

  const handleMessageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessageText(e.target.value);
  };

  const sendMessage = () => {
    if (userName && roomId && messageText) {
      socket.emit('send_message', {
        author: userName,
        text: messageText,
        roomId,
      });

      setMessageText('');
    }
  };

  const handleEnterPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      sendMessage();
    }
  };

  return (
    <div className="SendMessage">
      <input
        className="SendMessage__input"
        placeholder="Write a Message here"
        value={messageText}
        onChange={handleMessageChange}
        onKeyUp={handleEnterPress}
      />

      <button
        type="button"
        className="SendMessage__button"
        onClick={sendMessage}
      >
        Send message
      </button>
    </div>
  );
};
