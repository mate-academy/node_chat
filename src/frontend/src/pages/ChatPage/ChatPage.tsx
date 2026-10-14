/* eslint-disable */
import { useContext, useEffect, useState } from 'react';
import { ChatInfo } from '../../components/ChatInfo/ChatInfo';
import { ChatMessages } from '../../components/ChatMessages/ChatMessages';
import { Icon } from '../../components/Icon/Icon';
import { RoomList } from '../../components/RoomList/RoomList';
import { UserProfile } from '../../components/UserProfile/UserProfile';
import style from './ChatPage.module.scss';
import type { Room } from '../../type/Room';
import { UserContext } from '../../context/UserContext';
import { SocketContext } from '../../context/SocketProvider';
import { socketService } from '../../services/socetService';

export const ChatPage = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [currentRoomId, setCurrentRoomId] = useState<string | null>(null);
  const { userName } = useContext(UserContext);
  const { socket } = useContext(SocketContext);

  const currentRoom = rooms.find((room) => room.id === currentRoomId) ?? null;
  const onSetCurrentRoomId = (id: string) => setCurrentRoomId(id);

  useEffect(() => {
    if (!userName) {
      return;
    }

    const message = socketService.createSystemMessage('SET_USERNAME', {
      userName,
    });

    if (socket?.readyState === WebSocket.OPEN) {
      socket.send(message);
    } else {
      socket?.addEventListener(
        'open',
        () => {
          socket.send(message);
        },
        { once: true },
      );
    }

    const hendleSocketMessage = (event: MessageEvent) => {
      const message = JSON.parse(event.data);
      switch (message.type) {
        case 'ROOMS_UPDATED':
          setRooms(message.payload.rooms);
          break;
        case 'CREATED_ROOM':
          setCurrentRoomId(message.payload.newRoom.id);
      }
    };

    socket?.addEventListener('message', hendleSocketMessage);

    return () => {
      socket?.removeEventListener('message', hendleSocketMessage);
    };
  }, [userName, socket]);

  return (
    <section className={style.chatPage}>
      <div className={style.chatPage__top}>
        <Icon className={style['chatPage__icon']} nameIcon="chat" />
        <h2>Chat</h2>
      </div>

      <ChatInfo currentRoom={currentRoom} />
      <RoomList
        rooms={rooms}
        currentRoom={currentRoom}
        onSetCurrentRoomId={onSetCurrentRoomId}
      />
      <UserProfile />
      <ChatMessages currentRoom={currentRoom} />
    </section>
  );
};
