import { useState } from 'react';
import { deleteRoom, getMessages, updateRoom } from '../../../api';
import './Room.css';

export function Room({ room, setRoom, setRooms, setMessages }) {
  const [isEditing, setIsEditing] = useState(false);

  const handleJoining = () => {
    setRoom(room);

    getMessages(room.id).then(res => setMessages(res.data));
  };

  const handleDeleting = async () => {
    try {
      await deleteRoom(room.id);

      setRooms(currentRooms => currentRooms.filter(currentRoom => currentRoom.id !== room.id));
    } catch (err) {
      console.log(err);
    }
  };

  const handleEditRoom = () => {
    setIsEditing(true);
  };

  const editName = (currentRooms, newName) => {
    const newRooms = [...currentRooms];
    const roomIndex = currentRooms.findIndex(currentRoom => currentRoom.id === room.id);
    const oldRoom = currentRooms[roomIndex];

    oldRoom.name = newName;
    newRooms.splice(roomIndex, 1, oldRoom);

    return newRooms;
  };

  const acceptEdit = () => {
    setIsEditing(false);

    try {
      updateRoom(room.id, room.name);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <li className="room rooms__room">
      {isEditing ? (
        <form
          className="field is-horizontal room__form"
          onSubmit={async event => {
            event.preventDefault();

            localStorage.setItem('userName', event.target.name.value);
          }}
        >
          <input
            type="text"
            className="input"
            placeholder="Enter your name"
            value={room.name}
            name="name"
            onChange={event => setRooms(currentRooms => editName(currentRooms, event.target.value))}
          />
          <button
            onClick={acceptEdit}
            className="button"
          >
            Set
          </button>
        </form>
      ) : (
        <p className="room__name">{room.name}</p>
      )}
      <div className="room__buttons buttons">
        <button
          onClick={handleJoining}
          className="button is-success"
        >
          Join
        </button>
        <button
          onClick={handleEditRoom}
          className="button is-warning"
        >
          Rename
        </button>
        <button
          onClick={handleDeleting}
          className="button is-danger"
        >
          Delete
        </button>
      </div>
    </li>
  );
}
