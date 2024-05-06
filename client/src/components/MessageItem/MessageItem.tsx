import React from 'react';
import classNames from 'classnames';
import './MessageItem.scss';
import { Message } from '../../types/message';

type Props = {
  message: Message;
};

export const MessageItem: React.FC<Props> = ({ message }) => {
  const authorString = localStorage.getItem('author');
  const author = authorString ? JSON.parse(authorString) : null;

  const myDate = new Date(message.time);

  const hours = myDate.getHours();
  const minutes = myDate.getMinutes().toString().padStart(2, '0');

  return (
    <li
      className={classNames('list__item', {
        'list__item--right': message.userId === author.id,
      })}
    >
      {message.userId !== author.id ? (
        <h4 className="list__author">{message.userName}</h4>
      ) : (
        <h4 className="list__author">Ви</h4>
      )}

      {message.text}
      <div className="list__time">{`${hours}:${minutes}`}</div>
    </li>
  );
};
