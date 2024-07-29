import './MessageItem.scss'
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Message } from '../../types/types';
import { SERVER_API } from './../../constants/constants.ts';

type Props = {
  info: Message,
};

export const MessageItem: React.FC<Props> = ({ info }) => {
  const {
    messageText,
    createdAt,
    userId,
  } = info;

  const [userName, setUserName] = useState('Unknown');
  const [formattedTime, setFormattedTime] = useState('');

  useEffect(() => {
    axios
      .get(`${SERVER_API}/user/getName/${userId}`)
      .then((response) => {
        setUserName(response.data);
      })
      .catch((error) => {
        console.error('Failed to fetch user name:', error);
        setUserName('Unknown');
      });

    const date = new Date(createdAt);
    const hours = date.getUTCHours() + 3;
    const minutes = date.getUTCMinutes();
    setFormattedTime(`${hours}:${minutes < 10 ? '0' : ''}${minutes}`);
  }, [userId, createdAt]);

  return (
    <div className="message">
      <div className="message__iconBlock">
        <div className="message__iconBlock--icon">{userName.slice(0, 2).toUpperCase()}</div>
      </div>
      <div className="message__block">
        <div className="message__block--name">{userName}</div>
        <div className="message__block--text">{messageText}</div>
        <div className="message__block--date">{formattedTime}</div>
      </div>
    </div>
  );
};
