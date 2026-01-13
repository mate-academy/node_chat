import React, { useState } from "react";
import { useRooms } from "../context/RoomsContext";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";

export const MessageForm: React.FC = () => {
  const [text, setText] = useState("");
  const { username } = useAuth();
  const { currentRoomId } = useRooms();

  const send = async () => {
    if (!currentRoomId || !username || !text.trim()) return;

    try {
      await api.post("/messages", {
        roomId: currentRoomId,
        author: username,
        text: text.trim(),
      });
      setText("");
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div style={{ display: "flex", gap: 8 }}>
      <input
        className="input"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={
          currentRoomId ? "Type a message" : "Join a room to send messages"
        }
        disabled={!currentRoomId}
      />
      <button className="button" onClick={send} disabled={!currentRoomId}>
        Send
      </button>
    </div>
  );
};
