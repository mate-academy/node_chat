import { useState } from 'react';
import { roomService } from '../services/roomService.js';

export const RoomForm = ({ onCreated }) => {
  const [name, setName] = useState('');
  const [error, setError] = useState(null);

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      await roomService.create(name);
      setName('');
      setError(null);
      onCreated();
    } catch {
      setError('Failed to create room. Try again.');
    }
  };

  return (
    <form className="field is-horizontal" onSubmit={handleSubmit}>
      <input
        type="text"
        className="input"
        placeholder="Room name"
        value={name}
        onChange={event => setName(event.target.value)}
      />
      <button className="button">Create Room</button>
      {error && <p className="help is-danger">{error}</p>}
    </form>
  );
};
