// @ts-ignore
import search from '../../images/search.png';

import './RoomList.scss';
import React, { useEffect, useRef, useState } from "react";
import axios from 'axios';
import { SERVER_API, WEBSOCKET_API } from '../../constants/constants.ts';
import { RoomItem } from "../RoomItem/RoomItem.tsx";
import { Room } from '../../types/types.ts';

type Props = {
  chooseRoomName: (roomName: string) => void,
  chooseRoomId: (roomId: number) => void,
  logout: (isLogined: boolean) => void,
};

export const RoomList: React.FC<Props> = ({
  chooseRoomName,
  chooseRoomId,
  logout,
}) => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [newRoomName, setNewRoomName] = useState('');
  const [selectedRoomId, setSelectedRoomId] = useState();
  const [hasRights, setHasRights] = useState(false);
  const [currentUserId, setUserId] = useState(-1);
  const ws = useRef<WebSocket | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredRooms = rooms.filter(room =>
    room.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  


  useEffect(() => {
    const currentUser = localStorage.getItem('user');

    if (currentUser) {
      setUserId(JSON.parse(currentUser).id);
    }

    getAllRooms();

    ws.current = new WebSocket(WEBSOCKET_API);

    ws.current.onmessage = async (event) => {
      let data;

      if (event.data instanceof Blob) {
        const text = await event.data.text();
        try {
          data = JSON.parse(text);
        } catch (e) {
          console.error('Failed to parse JSON from Blob:', e);
          return;
        }
      } else if (typeof event.data === 'string') {
        try {
          data = JSON.parse(event.data);
        } catch (e) {
          console.error('Failed to parse JSON:', e);
          return;
        }
      } else {
        console.error('Unexpected data format:', event.data);
        return;
      }

      if (data.type === 'newRoom') {
        setRooms(prevRooms => [...prevRooms, data.data]);
      } else if (data.type === 'deleteRoom') {
        setRooms(prevRooms => prevRooms.filter(room => room.id !== data.data.id));
      } else if (data.type === 'renameRoom') {
        setRooms(prevRooms => prevRooms.map(room =>
          room.id === data.data.id ? { ...room, name: data.data.name } : room
        ));
      }
    };


    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleCreateRoom = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const room = {
      name: newRoomName,
      userId: currentUserId,
    };

    axios
      .post(`${SERVER_API}/room/creation`, room)
      .then(() => {
        getAllRooms()
      });

    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify(room));
    }

    setNewRoomName('')
  }

  const getAllRooms = () => {
    axios
      .get(`${SERVER_API}/room/getRooms`)
      .then((response) => {
        setRooms(response.data)
      })
  }

  const handleRoomClick = (roomId, userId, roomName) => {
    setSelectedRoomId(roomId);
    chooseRoomName(roomName);
    chooseRoomId(roomId);

    if (currentUserId === userId) {
      setHasRights(true);
    } else {
      setHasRights(false);
    }
  };

  const handleDeleteRoom = (roomId) => {
    axios
      .delete(`${SERVER_API}/room/deletion/${roomId}`)
      .then(() => {
        getAllRooms()
      });
  };

  const handleRenameRoom = (roomId, newRoomName) => {
    axios
      .patch(`${SERVER_API}/room/rename/${roomId}`, {
        name: newRoomName,
      })
      .then(() => {
        getAllRooms();
      })
  }

  const handleLogout = () => {
    logout(false);
    localStorage.removeItem('user');
  };

  const handleDelete = () => {
    const userData = localStorage.getItem('user');

    if (userData) {
      const userId = JSON.parse(userData).id;
      axios.delete(`${SERVER_API}/user/deletion/${userId}`)
    }

    handleLogout();
  };

  return (
    <div className="roomList">
      <section className="roomList__search">
        <img
          src={search}
          alt="search"
          className="roomList__search--loupe"
        />
        <input
          className='roomList__search--input'
          type="text"
          value={searchTerm}
          onChange={handleSearchChange}
          placeholder='Search rooms'
        />
      </section>

      <section className="roomList__create">
        <form className='roomList__create--form' onSubmit={(e) => handleCreateRoom(e)}>
          <div className="roomList__create--text">Create New Room:</div>
          <input
            type="text"
            name="roomName"
            className="roomList__create--input"
            value={newRoomName}
            onChange={(e) => setNewRoomName(e.target.value)}
          />
          <button className="roomList__create--button">CREATE</button>
        </form>
      </section>
      <section className="roomList__list">
        {filteredRooms.map(({ id, name, userId }) => (
          <RoomItem
            key={id}
            roomId={id}
            userId={userId}
            roomName={name}
            onClick={handleRoomClick}
            isSelected={selectedRoomId === id}
            deleteRoom={handleDeleteRoom}
            hasRights={hasRights}
            renameRoom={handleRenameRoom}
          />
        ))}
      </section>
      <div className="logout">
        <button
          className='logout__button'
          onClick={handleLogout}
        >
          LOGOUT
        </button>
        <button
          className='logout__button'
          onClick={handleDelete}
        >
          DELETE PROFILE
        </button>
      </div>
    </div>
  );
};