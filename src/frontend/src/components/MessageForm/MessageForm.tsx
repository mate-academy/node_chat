import React, { useContext, useState } from 'react';
import style from './MessageForm.module.scss';
import { Icon } from '../Icon/Icon';
import { SocketContext } from '../../context/SocketProvider';
import type { Room } from '../../type/Room';
import { socketService } from '../../services/socetService';

type Props = {
  currentRoom: Room;
};

export const MessageForm: React.FC<Props> = ({ currentRoom }) => {
  const [inputValue, setInputValue] = useState('');
  const { socket } = useContext(SocketContext);

  const onSubmit: React.SubmitEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault();

    if (!socket) {
      return;
    }

    const normalizedMessage = inputValue.trim();

    if (!normalizedMessage) {
      return;
    }

    const message = socketService.createSystemMessage('SEND_MESSAGE', {
      roomId: currentRoom.id,
      text: normalizedMessage,
    });

    socket.send(message);

    setInputValue('');
  };

  return (
    <form className={style.messageForm} onSubmit={onSubmit}>
      <input
        className={style.messageForm__input}
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
      />

      <button
        className={style.messageForm__button}
        disabled={inputValue === ''}
      >
        <Icon nameIcon="send" className={style.messageForm__icon} />
      </button>
    </form>
  );
};
