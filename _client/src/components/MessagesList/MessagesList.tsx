import React, { useEffect, useRef, useState } from 'react';
import { Socket } from 'socket.io-client';

import './MessagesList.scss';
import { Message } from '../../helpers/types/Message';
import { MessagesItem } from '../MessagesItem';

type Props = {
  socket: Socket;
};

export const MessagesList: React.FC<Props> = ({ socket }) => {
  const [messagesRecieved, setMessagesReceived] = useState<Message[]>([]);

  const messagesColumnRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    socket.on('receive_message', (data) => {
      const {
        author,
        time,
        text,
      } = data;

      setMessagesReceived((state) => [
        ...state,
        {
          author,
          text,
          time,
        },
      ]);
    });

    return () => {
      socket.off('receive_message');
    };
  }, [socket]);

  useEffect(() => {
    socket.on('get_messages', (messages) => {
      setMessagesReceived((state) => [...messages, ...state]);
    });

    return () => {
      socket.off('get_messages');
    };
  }, [socket]);

  useEffect(() => {
    if (messagesColumnRef.current) {
      messagesColumnRef.current.scrollTop = (
        messagesColumnRef.current.scrollHeight
      );
    }
  }, [messagesRecieved.length]);

  return (
    <div className="MessagesList" ref={messagesColumnRef}>
      {messagesRecieved.map(msg => (
        <MessagesItem
          key={msg.time.toString()}
          message={msg}
        />
      ))}
    </div>
  );
};
