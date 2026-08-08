import { useState } from "react";

export function RoomsList({ rooms, onRoomId, onRoomUpdate }) {
  const [editIdRoom, setEditIdRoom] = useState(null);
  const [newRoomName, setNewRoomName] = useState("");

  async function renameRoom(roomId, newName) {
    const response = await fetch(`http://localhost:3005/rooms/${roomId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name: newName }),
    });

    if (!response.ok) {
      throw new Error("Не вдалося оновити назву кімнати");
    }

    const updatedRoom = await response.json();

    onRoomUpdate(
      rooms.map((room) => (room.id === roomId ? updatedRoom : room)),
    );
    return updatedRoom;
  }

  async function deleteRoom(roomId) {
    const response = await fetch(`http://localhost:3005/rooms/${roomId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Something went wrong!");
    }

    onRoomUpdate(
      rooms.filter((room) => (room.id !== roomId)),
    );
    onRoomId(null);
  }

  return (
    <ul className="mt-5">
      {rooms.map((room) => (
        <li key={room.id} className="box mb-4 is-flex">
          {editIdRoom !== +room.id ? (
            <button
              className="button is-fullwidth"
              type="button"
              onClick={() => onRoomId(room.id)}
            >
              {room.name}
            </button>
          ) : (
            <form
              onSubmit={(event) => {
                event.preventDefault();
                renameRoom(editIdRoom, newRoomName);
                setNewRoomName("");
                setEditIdRoom(null);
              }}
            >
              <input
                type="text"
                className="input"
                value={newRoomName}
                autoFocus
                onChange={(event) => {
                  setNewRoomName(event.target.value);
                }}
                onBlur={(event) => {
                  renameRoom(editIdRoom, newRoomName);
                  setNewRoomName("");
                  setEditIdRoom(null);
                }}
              />
            </form>
          )}
          <button
            className="button"
            onClick={(event) => {
              if (editIdRoom) {
                renameRoom(editIdRoom, newRoomName);
                setNewRoomName('');
                setEditIdRoom(null);
              }

              setEditIdRoom(+room.id);
              setNewRoomName(room.name);
            }}
          >
            rename
          </button>
          <button className="button" onClick={() => deleteRoom(+room.id)}>delete</button>
        </li>
      ))}
    </ul>
  );
}
