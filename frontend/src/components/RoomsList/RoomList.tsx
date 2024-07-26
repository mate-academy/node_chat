import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../redux/custom.hooks.ts';
import { initRooms, selectRooms } from '../../redux/slices/roomSlice.ts';
import { Loader } from '../Loader/Loader';
import { RoomTale } from './RoomTale/RoomTale.tsx';

import './RoomList.scss';
import { initUsers } from '../../redux/slices/userSlice.ts';

export const RoomList: React.FC = () => {
  const { rooms } = useAppSelector(selectRooms);
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(initRooms());
    dispatch(initUsers());

  }, []);

  return (
    <div className="RoomList">
      {!rooms?.length && 'Rooms list is empty'}
      {!rooms ? <Loader /> : rooms.map((room) => <RoomTale key={room.id} room={room} />)}
    </div>
  );
};
