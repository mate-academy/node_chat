import { useState } from 'react';
import { createRoom } from '../api';

export const CreateRoom: React.FC = () => {
  const [roomName, setRoomName] = useState('');

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    if (!roomName) return;

    createRoom(roomName);
    setRoomName('');
  }

  return (
    <form className="field is-horizontal" onSubmit={handleSubmit}>
      <input
        type="text"
        className="input"
        placeholder="Enter a room name"
        value={roomName}
        onChange={event => setRoomName(event.target.value)}
      />
      <button type='submit' className="button">Create</button>
    </form>
  );
};
