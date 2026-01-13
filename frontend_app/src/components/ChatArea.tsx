import React from "react";
import { MessageList } from "./MessageList";
import { MessageForm } from "./MessageForm";
import { useRooms } from "../context/RoomsContext";

export const ChatArea: React.FC = () => {
  const { currentRoomId, rooms } = useRooms();
  const room = rooms.find((r) => r.id === currentRoomId) ?? null;
  return (
    <div className="chat">
      <div className="header">
        <h2 style={{ margin: 0 }}>{room ? room.name : "No room selected"}</h2>
      </div>
      <MessageList />
      <div style={{ borderTop: "1px solid #e5e7eb", padding: 12 }}>
        <MessageForm />
      </div>
    </div>
  );
};
