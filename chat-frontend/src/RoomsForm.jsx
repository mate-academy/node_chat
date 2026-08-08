import { useState } from "react";

const handleSubmit = async (event, roomName, onRoomId, onRoomCreated) => {
  event.preventDefault();

  const preparedRoomname = roomName.trim();

  if (!preparedRoomname) {
    return;
  }

  const response = await fetch("http://localhost:3005/rooms", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: preparedRoomname,
    }),
  });

  const room = await response.json();

  onRoomCreated(room);
  onRoomId(room.id);
};

export function RoomsForm({ onRoomId, onRoomCreated }) {
  const [roomName, setRoomName] = useState("");

  return (
    <form
      className="field is-horizontal"
      onSubmit={async (event) => {
        await handleSubmit(event, roomName, onRoomId, onRoomCreated);
        setRoomName("");
      }}
    >
      <input
        type="text"
        className="input"
        placeholder="Enter a name of new room"
        value={roomName}
        autoFocus
        onChange={(event) => setRoomName(event.target.value)}
      />
    </form>
  );
}
