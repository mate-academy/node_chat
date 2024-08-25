import React from 'react';
import * as Types from '../../types';
import {
  ArrowRightStartOnRectangleIcon,
  PlusIcon,
  UserIcon,
} from '@heroicons/react/24/outline';
import { roomService } from '../../services/roomService';
import Room from './Room';

interface SidebarProps {
  user: Types.User | null;
  rooms: Types.Room[];
  onLogout: (value: null) => void;
  onAddRoom: (value: Types.Room) => void;
  onSelect: React.Dispatch<React.SetStateAction<Types.Room | null>>;
  selectedRoom: Types.Room | null;
}

const Sidebar: React.FC<SidebarProps> = ({
  user,
  rooms,
  onLogout,
  onAddRoom,
  onSelect,
  selectedRoom,
}) => {
  const handleAddRoom = async () => {
    if (user) {
      const newroom = await roomService.createOne('NewRoom', user.id);
      onAddRoom(newroom);
      onSelect(newroom);
    }
  };

  return (
    <div className="w-full md:w-1/3 bg-gray-200 p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-xl">User Info</h2>
        {/* Logout Button */}
        <button
          onClick={() => onLogout(null)}
          className="flex items-center justify-center p-2 bg-red-500 text-white rounded-lg mt-4"
        >
          <ArrowRightStartOnRectangleIcon className="h-6 w-6 mr-2" />
          Logout
        </button>
      </div>
      <div className="space-y-4">
        {/* User Info */}
        <div className="flex items-center p-4 bg-gray-300 rounded-lg">
          <UserIcon className="h-6 w-6 mr-2 text-gray-700" />
          <p>{user?.name || 'Guest'}</p>
        </div>
        {/* Rooms */}
        <h2 className="font-semibold text-xl">Rooms</h2>
        <div className="space-y-2">
          {rooms.map((room: Types.Room) => (
            <Room
              key={room.id}
              room={room}
              selectedRoom={selectedRoom}
              setSelectedRoom={onSelect}
            />
          ))}
        </div>
        {/* Add Room Button */}
        <button
          onClick={handleAddRoom}
          className="flex items-center justify-center p-2 bg-green-500 text-white rounded-lg mt-4"
        >
          <PlusIcon className="h-6 w-6 mr-2" />
          Add Room
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
