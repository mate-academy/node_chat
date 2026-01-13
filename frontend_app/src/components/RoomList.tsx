import React from "react";
import { useRooms } from "../context/RoomsContext";

export const RoomList: React.FC = () => {
  const { rooms, currentRoomId, setCurrentRoom } = useRooms();
  return (
    <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
      {rooms.map((r) => (
        <li
          key={r.id}
          onClick={() => setCurrentRoom(r.id)}
          style={{ marginBottom: 8, cursor: "pointer" }}
        >
          <div
            className={
              r.id === currentRoomId
                ? "bg-blue-600 text-white p-3 rounded"
                : "p-3 rounded hover:bg-gray-100 cursor-pointer"
            }
          >
            {r.name}
          </div>
        </li>
      ))}
    </ul>
  );
};
