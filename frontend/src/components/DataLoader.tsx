import React, { FC, SetStateAction, useEffect } from 'react';
import { Outlet, useParams } from 'react-router-dom';
import { Message } from '../types';

type Props = {
  onMessage: (message: Message) => void,
  initMessages: React.Dispatch<React.SetStateAction<Message[]>>;
}

export const DataLoader: FC<Props> = ({ onMessage, initMessages }) => {
  const { roomId } = useParams();

  useEffect(() => {
    const socket = new WebSocket(`ws://localhost:3005?roomId=${roomId}`);

    socket.onmessage = (e) => {
      const data = JSON.parse(e.data);

      if (data.type === 'NEW_MESSAGE') {
        onMessage(data.payload);
      }

      if (data.type === 'INIT_MESSAGES') {
        initMessages(data.payload);
      }
    };

    return () => socket.close();
  }, [roomId])

  return (
    <>
      <h1 className="title">Chat application</h1 >

      <Outlet />
    </>
  );
};