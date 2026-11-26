import { useCallback, useRef, useState } from "react";

export function useChat() {
  const sendRef = useRef(null);
  const [rooms, setRooms] = useState([]);
  const [roomId, setRoomId] = useState(null);
  const [messages, setMessages] = useState([]);

  const onData = useCallback((data) => {  
    if (data.type === "rooms") {
      setRooms(data.rooms || []);
    }

    if (data.type === "joined") {
      setRoomId(data.roomId);
      setMessages(data.messages);

      if (data.rooms) {
        setRooms(data.rooms);
      }
    }

    if (data.type === "message") {
      setMessages((prev) => [...prev, data.message]);
    }
  }, []);

  const onSender = useCallback((fn) => {
    sendRef.current = fn;
  }, []);

  const send = useCallback((payload) => {
    if (sendRef.current) {
      sendRef.current(payload);
    }
  }, []);

  return {
    rooms,
    roomId,
    messages,
    onData,
    onSender,
    sendMessage: (text) => send({ type: "message", text }),
    joinRoom: (id) => send({ type: "joinRoom", roomId: id }),
    createRoom: (name) => send({ type: "createRoom", name }),
    renameRoom: (id, name) => send({ type: "renameRoom", roomId: id, name }),
    deleteRoom: (id) => send({ type: "deleteRoom", roomId: id }),
  };
}
