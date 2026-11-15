import { useState } from 'react';
import './CreateRoomPopUp.css';

export const RoomPopUp = ({ onClose, onCreateRoom }) => {
  const [roomName, setRoomName] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (roomName.trim()) {
      onCreateRoom(roomName);
      onClose();
    }
  };

  return (
    <div className="room-popup" onClick={onClose}>
      <div
        className="room-popup__dialog"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="room-popup__title">Enter name for room</h2>
        <form className="room-popup__form" onSubmit={handleSubmit}>
          <input
            className="text-input"
            placeholder="Example: General"
            type="text"
            value={roomName}
            onChange={(e) => setRoomName(e.target.value)}
          />
          <div className="room-popup__actions">
            <button
              className="app-button app-button--primary"
              type="submit"
            >
              Create room
            </button>
            <button
              className="app-button"
              type="button"
              onClick={onClose}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
