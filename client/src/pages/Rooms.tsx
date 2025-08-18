import React, { useEffect, useId, useState, type FormEvent } from 'react'
import type { RoomType } from '../types/Room';
import Room from '../components/Room';
import { roomsApi } from '../api';

const Rooms = () => {
  const [rooms, setRooms] = useState<RoomType[]>([]);
  const [roomName, setRoomName] = useState('');

  const getRooms = async() => {
    const rms = await roomsApi.getAllRooms();

    setRooms(rms)
  }

  useEffect(() => {
    getRooms()
  }, [])

  const createRoom  = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const newRoom = await roomsApi.createRoom({name: roomName});

    setRooms(prev => [...prev, newRoom])
    setRoomName('')
  }

  const deleteRoom = async (id: string) => {
    await roomsApi.deleteRoom(id);

    getRooms()
  }

  const updateRoom = async (updatedRoom: RoomType) => {
    await roomsApi.updateRoom(updatedRoom);
    getRooms()
  }

  return (
    <main className='main'>
      <h1>Rooms</h1>
      <div className="rooms">
        {rooms.map(room=>(
          <Room key={room.id} room={room} onDelete={deleteRoom} onUpdate={updateRoom}/>
        ))}
      </div>
      <form className='form' onSubmit={createRoom}>
        <input
          maxLength={10}
          type="text"
          value={roomName}
          onChange={(e) => setRoomName(e.target.value)}
          placeholder='Create new room...'
          className='input'
        />
        <button className='button'>Create </button>
      </form>
    </main>
  )
}

export default Rooms
