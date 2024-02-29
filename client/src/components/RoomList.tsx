import React from 'react';
import { Room } from '../websocket';

interface RoomListProps {
  rooms: Room[];
  onSelectRoom: (room: Room) => void;
}

const RoomList: React.FC<RoomListProps> = ({ rooms, onSelectRoom }) => {
  return (
    <div>
      <h2 className="text-xl mb-4">Rooms</h2>
      <ul>
        {rooms.map(room => (
          <li
            key={room.id}
            onClick={() => onSelectRoom(room)}
            className="cursor-pointer bg-white
             hover:bg-gray-100 rounded px-3 py-2 mb-2"
          >
            {room.name}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default RoomList;
