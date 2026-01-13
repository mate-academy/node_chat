import React, { useEffect, useRef } from "react";

import { MessageItem } from "./MessageItem";
import { useAuth } from "../context/AuthContext";
import { useMessagesHook } from "../hooks/useMessages";
import { useRooms } from "../context/RoomsContext";

export const MessageList: React.FC = () => {
  const { currentRoomId } = useRooms();
  const { messagesByRoom } = useMessagesHook(); // note: this hook returns a new value each render; in real app put hook higher
  const boxRef = useRef<HTMLDivElement | null>(null);
  const username = useAuth().username || "anonymous";

  const msgs = currentRoomId ? messagesByRoom[currentRoomId] || [] : [];

  useEffect(() => {
    // auto scroll
    const el = boxRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [msgs.length]);

  return (
    <div ref={boxRef} className="message-list">
      {currentRoomId ? (
        msgs.map((m) => (
          <MessageItem key={m.id} message={m} isMe={m.author === username} />
        ))
      ) : (
        <div style={{ padding: 16, color: "#6b7280" }}>
          Select a room to view messages
        </div>
      )}
    </div>
  );
};
