import { MessageCircle } from 'lucide-react';
import { iconColor } from '../types/IconColor';
import { UserProfile } from '../components/UserProfile';
import { RoomsList } from '../components/RoomsList';
import { RoomInfo } from '../components/RoomInfo';
import { RoomMessages } from '../components/RoomMessages';
import { useContext, useEffect, useState } from 'react';
import { UsernameContext } from '../context/UsernameContext';
import { SocketContext } from '../context/SocketContext';
import type { Room } from '../types/Room';
import { createSocketMessage } from '../services/createSocketMessage';

export const ChatPage: React.FC = () => {
  const { username } = useContext(UsernameContext);
  const { socket } = useContext(SocketContext);

  const [rooms, setRooms] = useState<Room[]>([]);
  const [currentRoomId, setCurrentRoomId] = useState<number | null>(null);

  const currentRoom = rooms.find((room) => room.id === currentRoomId) ?? null;

  const messages = currentRoom?.messages ?? [];

  useEffect(() => {
    if (!username) {
      return;
    }

    // #region SET_USERNAME

    const message = createSocketMessage('SET_USERNAME', {
      username: username,
    });

    if (!socket) {
      return;
    }

    if (socket.readyState === WebSocket.OPEN) {
      socket.send(message);
    } else {
      socket.addEventListener(
        'open',
        () => {
          if (socket) {
            socket.send(message);
          }
        },
        { once: true },
      );
    }

    // #endregion

    const handleSocketMessage = (event: MessageEvent) => {
      const message = JSON.parse(event.data);

      switch (message.type) {
        case 'ROOMS_UPDATED':
          setRooms(message.payload.rooms);
          break;
        case 'ROOM_CREATED':
          setCurrentRoomId(message.payload.newRoom.id);
          break;

        default:
          break;
      }
    };

    socket.addEventListener('message', handleSocketMessage);

    return () => {
      socket.removeEventListener('message', handleSocketMessage);
    };
  }, [socket, username]);

  return (
    <section className="chat-section">
      <div className="chat-top-bar flex-row-center">
        <MessageCircle size={30} color={iconColor} />
        <h2>Chat</h2>
      </div>
      <RoomInfo currentRoom={currentRoom} />
      <RoomsList
        rooms={rooms}
        currentRoom={currentRoom}
        onSetCurrentRoomId={setCurrentRoomId}
      />
      <UserProfile username={username} />
      <RoomMessages messages={messages} currentRoom={currentRoom} />
    </section>
  );
};
