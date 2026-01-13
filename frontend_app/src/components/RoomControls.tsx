import React, { useState } from "react";
import { useRooms } from "../context/RoomsContext";

export const RoomControls: React.FC = () => {
  const { createRoom, currentRoomId, renameRoom, deleteRoom } = useRooms();
  const [value, setValue] = useState("");
  return (
    <div className="controls">
      <input
        className="input"
        placeholder="Room name"
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
      <div className="buttons">
        <button
          className="button"
          onClick={() => {
            if (value.trim()) {
              createRoom(value.trim());
              setValue("");
            }
          }}
        >
          Create
        </button>
        <button
          className="button secondary"
          onClick={() => {
            if (currentRoomId && value.trim()) {
              renameRoom(currentRoomId, value.trim());
              setValue("");
            }
          }}
        >
          Rename
        </button>
        <button
          className="button danger"
          onClick={() => {
            if (currentRoomId) deleteRoom(currentRoomId);
          }}
        >
          Delete
        </button>
      </div>
    </div>
  );
};
