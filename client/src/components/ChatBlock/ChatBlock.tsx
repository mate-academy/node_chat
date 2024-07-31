/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable react/prop-types */
import './ChatBlock.scss';
import classNames from 'classnames';
import { useEffect, useRef, useState } from 'react';
import { ChatModale } from '../ChatModale/ChatModale';
import { Button } from '../Button/Button';
import { Input } from '../Input/Input';
import { MessageItem } from '../MessageItem/MessageItem';
import * as Types from '../../types/types';
import { API_WEBSOCKET } from '../../constants/constants';
import { requestCreator } from '../../service/service';

interface Props {
  author: Types.User | null,
  messages: Types.Message[],
  setMessages: React.Dispatch<React.SetStateAction<Types.Message[]>>,
  selectedRoom: Types.Room | null,
  roomIsChanging: boolean,
  newNameOfRoom: string,
  newMessageText: string,
  setNewNameOfRoom: (value: string) => void
  setNewMessageText: (value: string) => void
  setSelectedRoom: (value: Types.Room | null) => void,
  setRoomIsChanging: React.Dispatch<React.SetStateAction<boolean>>,
  setRooms: (value: React.SetStateAction<Types.Room[]>) => void,
  setRefresh: (callback: (flag: boolean) => boolean) => void;
}

export const ChatBlock: React.FC<Props> = ({
  author,
  messages,
  setMessages,
  selectedRoom,
  roomIsChanging,
  newNameOfRoom,
  newMessageText,
  setNewNameOfRoom,
  setNewMessageText,
  setSelectedRoom,
  setRoomIsChanging,
  setRooms,
  setRefresh,
}) => {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const messageListRef = useRef<HTMLUListElement | null>(null);

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
            console.error(newData.error);
            setSelectedRoom(null);
            setRefresh(currenRefresh => !currenRefresh);
          } else {
            setMessages(currentMessages => [...currentMessages, newData]);
          }
        }
      } catch (error) {
        console.error(error)
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

    return () => newSocket.close();
  }, [selectedRoom, setMessages, setRefresh, setSelectedRoom]);

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
      console.error(error);
    }
  };

  const handleSubmitMessage = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (author && selectedRoom && newMessageText.trim()) {
      sendMessage(newMessageText.trim());
      setNewMessageText('');
    }
  };

  const editName = () => {
    if (selectedRoom && !newNameOfRoom.trim()) {
      setNewNameOfRoom(selectedRoom.name);
      setRoomIsChanging(false);
      return;
    }

    requestCreator({
      type: Types.RequestType.RoomRename,
      actions: { setRoomIsChanging, setRefresh },
      body: { id: selectedRoom?.id, newName: newNameOfRoom.trim() },
      errorText: Types.RequestError.RoomRename,
    });

    if (selectedRoom) {
      setSelectedRoom({ ...selectedRoom, name: newNameOfRoom.trim() });
    }
  };

  const handleEditName = () => {
    if (selectedRoom) {
      setNewNameOfRoom(selectedRoom.name);
      setRoomIsChanging(true);
    }
  };

  const closeHelper = () => {
    setSelectedRoom(null);
    setRoomIsChanging(false);
    setMessages([]);
    setNewMessageText('');
  };

  const handleDeleteRoom = (id: string | undefined) => {
    requestCreator({
      type: Types.RequestType.RoomDelete,
      actions: { setRooms, closeHelper },
      body: { id },
      errorText: Types.RequestError.RoomDelete,
    });
  };

  const scrollDown = () => {
    if (messageListRef.current) {
      messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
    }
  };

  useEffect(() => scrollDown(), [messages]);

  return (
    <section className={classNames('chat-block', {
      'chat-block__display': selectedRoom,
    })}>
      <article className="chat-block__info">
        {!roomIsChanging && (
          <h1 className='chat-block__info--title'>
            {selectedRoom ? `${selectedRoom.name}` : 'Назва чату...'}
          </h1>
        )}

        {selectedRoom && roomIsChanging && (
          <form className='chat-block__info--form' onSubmit={event => {
            event.preventDefault();
            editName();
          }}>
            <Input
              type={Types.Input.RoomRename}
              value={newNameOfRoom}
              placeholder={Types.PlaceHolder.RoomRename}
              onChange={setNewNameOfRoom}
              onBlur={editName}
            />
          </form>
        )}

        <div className={classNames('chat-block__info--buttons', {
          'chat-block__info--display': selectedRoom,
        })}>
          {author?.id === selectedRoom?.userId && (
            <>
              <Button type={Types.Button.Rename} onCLick={handleEditName} />
              <Button type={Types.Button.Delete} onCLick={() => handleDeleteRoom(selectedRoom?.id)} />
            </>
          )}
          <Button type={Types.Button.Close} onCLick={closeHelper} />
        </div>
      </article>

      <article className="chat-block__chat">
        <ChatModale author={author} messages={messages} selectedRoom={selectedRoom} />

        <ul ref={messageListRef} className="chat-block__chat--messages">
          {messages.map(message => (
            <MessageItem key={message.id} message={message} author={author} />
          ))}
        </ul>

        <form
          className={classNames('chat-block__form', {
            'chat-block__form--display': selectedRoom,
          })}
          onSubmit={handleSubmitMessage}
        >
          <Input
            type={Types.Input.Send}
            value={newMessageText}
            placeholder={Types.PlaceHolder.Send}
            onChange={setNewMessageText}
          />

          <Button type={Types.Button.Send} />
        </form>
      </article>
    </section>
  );
}
