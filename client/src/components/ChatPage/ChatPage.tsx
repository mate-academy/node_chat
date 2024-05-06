import React, { useEffect, useState } from 'react';
import './ChatPage.scss';
import { MessageForm } from '../MessageForm/MessageForm';
import { MessageList } from '../MessageList/MessageList';
import { API_WEBSOCKET } from '../../utils/config';
import { User } from '../../types/user';
import classNames from 'classnames';
import { Room } from '../../types/room';
import { Error } from '../../types/error';
import { Message } from '../../types/message';

type Props = {
  author: User | null;
  setSelectRoom: (room: Room | null) => void;
  selectedRoom: Room | null;
  setRefresh: (callback: (flag: boolean) => boolean) => void;
  setError: (error: Error | null) => void;
};

export const ChatPage: React.FC<Props> = ({
  author,
  setSelectRoom,
  selectedRoom,
  setRefresh,
  setError,
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [socket, setSocket] = useState<WebSocket | null>(null);

  useEffect(() => {
    if (!selectedRoom) {
      return;
    }

    const newSocket = new WebSocket(API_WEBSOCKET);

    newSocket.onmessage = dataFromServer => {
      try {
        const newData = JSON.parse(dataFromServer.data);

        if (Array.isArray(newData)) {
          setMessages(newData);
        } else {
          if (newData.error) {
            setError(newData.error);
            setSelectRoom(null);
            setRefresh(currenRefresh => !currenRefresh);
          } else {
            setMessages(currentMessages => [...currentMessages, newData]);
          }
        }
      } catch (error) {
        setError(error as Error);
      }
    };

    newSocket.onopen = () => {
      newSocket.send(
        JSON.stringify({
          init: true,
          roomId: selectedRoom.id,
        }),
      );
    };

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, [selectedRoom, setSelectRoom, setError, setRefresh]);

  const sendMessage = (text: string) => {
    try {
      if (socket) {
        socket.send(
          JSON.stringify({
            userId: author?.id,
            text,
          }),
        );
      }
    } catch (error) {
      setError(error as Error);
    }
  };

  return (
    <div
      className={classNames('my-block chatPage', {
        'chatPage--active': selectedRoom,
      })}
    >
      <div className="top">
        {selectedRoom ? (
          <h1 className="my-block__title">{selectedRoom.name}</h1>
        ) : (
          <h1 className="my-block__title">Choose room</h1>
        )}
        {selectedRoom && (
          <button
            className="top__button button__exit"
            title="Покинути чат"
            onClick={() => setSelectRoom(null)}
          ></button>
        )}
      </div>
      {selectedRoom && (
        <>
          <MessageList messages={messages} />
          <MessageForm send={sendMessage} />
        </>
      )}
    </div>
  );
};
