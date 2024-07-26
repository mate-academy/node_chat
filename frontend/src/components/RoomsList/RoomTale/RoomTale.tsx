import React, { useEffect, useRef, useState } from 'react';
import { Room } from '../../../types/room';
import { getUserById } from '../../../api/users.ts';
import { useAppDispatch, useAppSelector } from '../../../redux/custom.hooks.ts';
import {
  initDeleteRoom,
  initRooms,
  initUpdateRoom,
  selectRooms,
  setRooms,
  setSelectRoom,
} from '../../../redux/slices/roomSlice.ts';
import { Loader } from '../../Loader/Loader.jsx';

import './RoomTale.scss';
import { SERVER_URL } from '../../../utils/const.js';
import { selectUser } from '../../../redux/slices/userSlice.ts';
import { setMessage } from '../../../redux/slices/messageSlice.ts';

interface Props {
  room: Room;
}

export const RoomTale: React.FC<Props> = ({ room }) => {
  const [newName, setNewName] = useState('');
  const [rename, setRename] = useState(false);
  const { loaded, rooms } = useAppSelector(selectRooms);
  const { users } = useAppSelector(selectUser);
  const dispatch = useAppDispatch();
  console.log(users);
  const creatorRoom = users.find((user) => user.id === room.createByUserId);

  const refValue = useRef<HTMLFormElement | null>(null);

  const handleDeleteButton = (id) => {
    dispatch(initDeleteRoom(id)).then(() => {
      const filteredRooms = rooms.filter((room) => room.id !== id);

      dispatch(setRooms(filteredRooms));
    });
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    dispatch(initUpdateRoom({ id: room.id, name: newName })).then(() => {
      const updatedRooms = rooms.map((r) => {
        if (room.id === r.id) {
          return {
            ...r,
            name: newName,
          };
        }

        return r;
      });

      dispatch(setRooms(updatedRooms));

      refValue.current?.reset();

      setRename(!rename);
    });
  };

  const handleJoinRoom = () => {

    dispatch(setSelectRoom(room));

  };

  if (loaded) {
    return <Loader />;
  }

  return (
    <div className="RoomTale">
      <div className="RoomTale__room">
        <h3>{room.name}</h3>
        <p>{`created by: ${creatorRoom?.name}`}</p>

        <div className="RoomTale__option">
          <button onClick={handleJoinRoom} className="RoomTale__connect">
            join
          </button>

          <button
            className="RoomTale__rename"
            onClick={() => setRename(!rename)}
          >
            rename
          </button>

          <button
            onClick={() => handleDeleteButton(room.id)}
            className="RoomTale__delete"
          >
            delete
          </button>

          {rename && (
            <form
              onSubmit={(event) => handleSubmit(event)}
              ref={() => refValue}
              className="RoomTale__form"
              action=""
              method="patch"
            >
              <label htmlFor="updateName">Enter new name room:</label>
              <input
                onChange={(event) => {
                  setNewName(event.target.value);
                }}
                placeholder={room.name}
                id="updateName"
                type="text"
              />
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
