import { SquarePen, X } from 'lucide-react';
import { useState } from 'react';

export const Room = ({ room, setAllRooms }) => {
  const [isEditing, setEditing] = useState(false);
  const [newRoom, setNewRoom] = useState(room.name);

  const handleEditRoom = async (e) => {
    e.preventDefault();

    if (!newRoom.trim()) {
      setEditing(false);
      handleDeleteRoom();
      return;
    }

    try {
      const response = await fetch(`http://localhost:3005/rooms/${room.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newRoom,
          user: room.user,
        }),
      });

      const updatedRoom = await response.json();
      setEditing(false);
      setNewRoom(updatedRoom.name);
      setAllRooms((prev) =>
        prev.map((r) =>
          r.id === room.id ? { ...r, name: updatedRoom.name } : r,
        ),
      );
    } catch (error) {
      console.error('Error updating room:', error);
    }
  };

  const handleDeleteRoom = async () => {
    const roomId = room.id;
    try {
      await fetch(`http://localhost:3005/rooms/${roomId}`, {
        method: 'DELETE',
      });
      setAllRooms((prev) => prev.filter((room) => room.id !== roomId));
    } catch (error) {
      console.error('Error deleting room:', error);
    }
  };

  return (
    <div className="room">
      {isEditing ? (
        <>
          <form id="editForm" onSubmit={handleEditRoom}>
            <input
              value={newRoom}
              onChange={(e) => setNewRoom(e.target.value)}
              className="input is-normal"
              type="text"
              placeholder="Enter room name"
            />
            <button className="button is-danger">
              <X
                onClick={() => {
                  setEditing(true);
                }}
              />
            </button>
          </form>
        </>
      ) : (
        <>
          <div className="room__text">
            <p className="has-text-weight-bold">{room.name}</p>
            <p className="is-size-7">by {room.user}</p>
          </div>
          <div className="room__icons">
            <span className="icon" onClick={() => setEditing(true)}>
              <SquarePen />
            </span>
            <span className="icon has-text-danger" onClick={handleDeleteRoom}>
              <X />
            </span>
          </div>
        </>
      )}
    </div>
  );
};
