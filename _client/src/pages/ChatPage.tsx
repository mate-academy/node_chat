import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Socket } from 'socket.io-client';

import './styles/ChatPage.scss';
import { Room } from '../helpers/types/Room';
import { getUserName } from '../helpers/utils/manageLocalState';

import { RoomInfo } from '../components/RoomInfo';
import { MessagesList } from '../components/MessagesList';
import { SendMessage } from '../components/SendMessage';

type Props = {
  userName: string,
  chatRooms: Room[],
  socket: Socket;
};

export const ChatPage: React.FC<Props> = ({
  userName,
  chatRooms,
  socket,
}) => {
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);

  const navigate = useNavigate();
  const { chatId } = useParams();

  useEffect(() => {
    const name = getUserName();
    let room: Room | undefined;

    if (chatId && !Number.isNaN(+chatId)) {
      room = chatRooms
        .find(currRoom => currRoom.id === +chatId);
    } else {
      navigate('/', { replace: true });
    }

    if (name && room) {
      setSelectedRoom(room);

      socket.emit('join_room', { userName: name, roomId: room.id });
    }
  }, [chatRooms, socket, navigate, chatId]);

  return (
    <div className="ChatPage">
      {selectedRoom && (
        <>
          <RoomInfo
            socket={socket}
            userName={userName}
            room={selectedRoom}
          />

          <div className="ChatPage__right">
            <MessagesList socket={socket} />
            <SendMessage
              userName={userName}
              roomId={selectedRoom.id}
              socket={socket}
            />
          </div>
        </>
      )}
    </div>
  );
};
