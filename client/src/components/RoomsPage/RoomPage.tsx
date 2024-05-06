import axios from 'axios';
import React, { useEffect, useRef, useState } from 'react';
import './RoomPage.scss';
import { API_URL } from '../../utils/config';
import { Room } from '../../types/room';
import { User } from '../../types/user';
import classNames from 'classnames';

type Props = {
  selectedRoom: Room | null;
  setSelectRoom: (room: Room | null) => void;
  author: User | null;
  refresh: boolean;
  setRefresh: (callback: (flag: boolean) => boolean) => void;
};

export const RoomPage: React.FC<Props> = ({
  selectedRoom,
  setSelectRoom,
  author,
  refresh,
  setRefresh,
}) => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [roomName, setRoomName] = useState('');
  const [newName, setNewName] = useState('');
  const [isEdit, setIsEdit] = useState<Room | null>(null);
  const edit = useRef<HTMLInputElement>(null);

  useEffect(() => {
    axios.get(`${API_URL}room/chatRooms`).then(roomsFromServer => {
      setRooms(
        roomsFromServer.data.sort((room1: Room, room2: Room) => {
          const date1: Date = new Date(room1.createdAt);
          const date2: Date = new Date(room2.createdAt);

          return +date2 - +date1;
        }),
      );
    });
  }, [author, refresh]);

  const handleCreateRoom = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (roomName.trim().length === 0) {
      setRoomName('');

      return;
    }

    axios
      .post(`${API_URL}room/createRoom`, {
        userId: author?.id,
        name: roomName,
      })
      .then(response => {
        const newRoom = response.data;

        setRooms(currentRooms => [newRoom, ...currentRooms]);
        setRoomName('');
      });
  };

  const refreshRooms = () => {
    setRefresh(prevRefresh => !prevRefresh);
  };

  const handleDeleteRoom = (
    id: string,
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>,
  ) => {
    event.stopPropagation();

    axios
      .post(`${API_URL}room/deleteRoom`, {
        id,
      })
      .then(() => {
        setRooms(allRooms => allRooms.filter(room => room.id !== id));

        if (selectedRoom && selectedRoom.id === id) {
          setSelectRoom(null);
        }
      });
  };

  const editName = () => {
    axios
      .post(`${API_URL}room/editRoom`, {
        id: isEdit?.id,
        newName,
      })
      .then(() => {
        setIsEdit(null);
        setNewName('');
        refreshRooms();
      });
  };

  useEffect(() => {
    if (edit.current) {
      edit.current.focus();
    }
  }, [isEdit]);

  const handleEditName = (
    room: Room,
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>,
  ) => {
    event.stopPropagation();
    setNewName(room.name);
    setIsEdit(room);
  };

  return (
    <div className="my-block roomPage">
      <div className="top">
        <h1 className="my-block__title">Chat rooms</h1>
        <button
          type="button"
          className="top__button"
          onClick={refreshRooms}
        ></button>
      </div>

      <form className="field" onSubmit={event => handleCreateRoom(event)}>
        <input
          type="text"
          className="input"
          placeholder="Create new chat"
          required
          value={roomName}
          onChange={e => setRoomName(e.target.value)}
        />
        <button type="submit" className="field__button button"></button>
      </form>

      {rooms.length === 0 ? (
        <h3 className="roomPage__title">no chat rooms...</h3>
      ) : (
        <ul className="roomPage__room">
          {rooms.map(room => (
            <li
              key={room.id}
              onClick={() => setSelectRoom(room)}
              className={classNames('roomPage__item', {
                'roomPage__item--active':
                  selectedRoom && selectedRoom.id === room.id,
              })}
            >
              {isEdit === room ? (
                <form
                  className="roomPage__form"
                  onSubmit={e => {
                    e.preventDefault();
                    editName();
                  }}
                >
                  <input
                    ref={edit}
                    type="text"
                    className="roomPage__input"
                    placeholder="Enter a message"
                    value={newName}
                    onChange={e => setNewName(e.target.value)}
                    onBlur={editName}
                  />
                </form>
              ) : (
                <span className="roomPage__name">{room.name}</span>
              )}
              <div className="roomPage__buttons">
                {room.userId === author?.id && (
                  <>
                    <button
                      className="roomPage__button"
                      onClick={event => handleEditName(room, event)}
                    ></button>

                    <button
                      className="roomPage__button roomPage__delete"
                      onClick={event => handleDeleteRoom(room.id, event)}
                    ></button>
                  </>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
