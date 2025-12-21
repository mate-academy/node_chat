import React, { useEffect, useState } from 'react'
import { roomService } from '../services/roomService.ts';
import { useAuth } from '../contexts/AuthContext.tsx';
import { Link } from 'react-router-dom';

interface Room {
  id: string,
  name: string,
  author: string,
}
export const RoomsList = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [createRoomName, setCreateRoomName] = useState('');
  const { userName } = useAuth();
  const [changeRoomName, setChangeRoomName] = useState('');
  const [editingRoomId, setEditingRoomId] = useState<string | null>(null);

  useEffect(() => {
    const socket = new WebSocket(`ws://localhost:3005`);

    socket.onmessage = (e) => {
      const data = JSON.parse(e.data);

      if (data.type === 'NEW_ROOM') {
        setRooms(rooms => [data.payload, ...rooms]);
      }

      if (data.type === 'INIT_ROOMS') {
        setRooms(data.payload);
      }

      if (data.type === 'ROOM_UPDATE') {
        setRooms(prev =>
          prev.map(room => data.payload.id === room.id
            ? data.payload
            : room
          )
        )
      }

      if (data.type === 'ROOM_DELETE') {
        setRooms(prev => prev.filter(room => room.id !== data.payload.id))
      }
    };

    return () => socket.close();
  }, [])

  const createRoom = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    await roomService.create(createRoomName, userName!);

    setCreateRoomName('');
  }

  const saveRoomName = async (roomId: string) => {
    if (!changeRoomName.trim()) return;

    await roomService.update(roomId, changeRoomName);

    setEditingRoomId(null);
    setChangeRoomName('');
  };

  const deleteRoom = async (roomId: string) => {
    await roomService.delete(roomId);
  }

  return (
    <section className="section">
      <h2 className="title m-3">Rooms</h2>
      <div className="card ">
        <form
          className='form card-footer'
          onSubmit={createRoom}
        >
          <input
            type="text"
            className='input m-3'
            value={createRoomName}
            onChange={e => setCreateRoomName(e.target.value)}
          />
          <button
            type="submit"
            className="button m-3"
          >
            Create
          </button>
        </form>
      </div>
      {rooms.length > 0 &&
        <ul className='card p-3'>
          {rooms.map(room => (
            <li
              key={room.id}
              className="field"
              style={{ display: 'flex', gap: '10px', justifyContent: 'space-between' }}
            >
              <Link to={`${room.id}`}>
                <button className="button">Join</button>
              </Link>
              {editingRoomId === room.id ?
                <input
                  type="text"
                  value={changeRoomName}
                  className='input'
                  style={{ width: '50%' }}
                  onChange={e => setChangeRoomName(e.target.value)}
                /> : room.name}

              <div className="field" >
                {editingRoomId !== room.id ?
                  <button
                    className="button mr-1"
                    onClick={() => {
                      setEditingRoomId(room.id);
                      setChangeRoomName(room.name)
                    }}
                  >
                    Edit name
                  </button> :
                  <button
                    className="button"
                    onClick={() => saveRoomName(room.id)}
                  >
                    Save change
                  </button>

                }
                <button
                  className="button"
                  onClick={() => deleteRoom(room.id)}
                >
                  Delete room
                </button>
              </div>
            </li>
          ))}
        </ul >
      }
    </section>
  )
}
