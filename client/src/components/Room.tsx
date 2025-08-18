import React, { useState } from 'react'
import type { RoomType } from '../types/Room'
import { Link } from 'react-router-dom';
import { roomsApi } from '../api';

type Props = {
  room: RoomType,
  onDelete: (id: string) => void
  onUpdate: (data: RoomType) => void
}
const Room = ({room, onDelete, onUpdate}: Props) => {
  const [isEdit, setIsEdit] = useState(false);
  const [newName, setNewName] = useState(room.name);

  const deleteRoom = async () =>{
    await roomsApi.deleteRoom(room.id);
    onDelete(room.id)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && newName.length > 3) {
      e.preventDefault();
      onUpdate({
        name: newName,
        id: room.id
      })
      setIsEdit(false);
    }
  };


  return (
    <div className='room'>

      {isEdit
        ? (
        <form className='miniform' onSubmit={(e) => e.preventDefault()}>
          <input
            maxLength={10}
            type="text"
            name='name'
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={handleKeyDown}
            className='input'
          />
        </form>
        ): (
      <Link to={`${room.id}`} className="subtitle">{room.name}</Link>
        )}
      <button className='button' onClick={() => setIsEdit(true)}>Edit</button>
      <button className='button' onClick={deleteRoom}>Delete</button>
    </div>
  )
}

export default Room
