import React from 'react';

import './RoomsList.scss';
import { Room } from '../../helpers/types/Room';
import { RoomItem } from '../RoomItem';

type Props = {
  chatRooms: Room[],
  setChatRooms: (chatRooms: Room[]) => void,
};

export const RoomsList: React.FC<Props> = ({ chatRooms, setChatRooms }) => {
  return (
    <ul className="RoomsList">
      {chatRooms.map((room) => (
        <RoomItem
          key={room.id}
          room={room}
          chatRooms={chatRooms}
          setChatRooms={setChatRooms}
        />
      ))}
    </ul>
  );
};
