import React, { useState } from "react"
import { createRoom } from "../../services/roomApi";
import type { Room } from "../../types/Room";

type Props = {
  userId: string;
  onSet: (room: Room) => void;
  onClose: (isOpen: boolean) => void;
}

export const RoomCreateForm: React.FC<Props> = ({ userId, onSet, onClose }) => {
  const [name, setName] = useState('');

  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      return;
    }

    const room = await createRoom(name, userId);
    onSet(room);
    onClose(false);
  }

  return (
    <form className="createRoom" onSubmit={handleSubmit}>
      <p className="createRoom__label">Enter the name:</p>
      <input
        className="createRoom__input"
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <button className="createRoom__btn" type="submit">Create</button>
    </form>
  )
}
