import React from 'react';

import './styles/RoomsPage.scss';
import { Room } from '../helpers/types/Room';

import { RoomsList } from '../components/RoomsList';
import { NewRoom } from '../components/NewRoom';
import { ToHomeButton } from '../components/ToHomeButton';

type Props = {
  chatRooms: Room[],
  setChatRooms: (chatRooms: Room[]) => void,
};

export const RoomsPage: React.FC<Props> = ({ chatRooms, setChatRooms }) => {
  return (
    <div className="RoomsPage">
      <h1 className="RoomsPage__title">Manage Rooms</h1>

      <div className="RoomsPage__rooms">
        <RoomsList chatRooms={chatRooms} setChatRooms={setChatRooms} />

        <NewRoom chatRooms={chatRooms} setChatRooms={setChatRooms} />
      </div>

      <ToHomeButton />
    </div>
  );
};
