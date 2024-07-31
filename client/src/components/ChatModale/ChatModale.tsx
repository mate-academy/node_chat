/* eslint-disable react/prop-types */
import './ChatModale.scss';
import { useState, useEffect } from 'react';
import classNames from 'classnames';
import { Message, User, Room } from '../../types/types';

interface Props { 
  author: User | null,
  messages: Message[],
  selectedRoom: Room | null,
}

export const ChatModale: React.FC<Props> = ({ author, messages, selectedRoom }) => {
  const [status, setStatus] = useState(false);

  useEffect(() => setStatus(!!messages.length), [messages]);

  const modaleStyles = classNames('chat-modale', {
    'chat-modale__hidden': status,
    'chat-modale__no-display': status,
    'chat-modale__no-author': !author,
    'chat-modale__no-room': !selectedRoom,
  });

  return <div className={modaleStyles}>
    {!selectedRoom ? (
      'Наразі не вибрано жодного чату.\nОберіть чат зі списку...'
    ) : (
      'Наразі тут немає повідомлень.\nНапишіть перше повідомлення...'
    )}
  </div>;
};
