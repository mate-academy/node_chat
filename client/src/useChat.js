import { useCallback, useEffect, useRef, useState } from 'react';

const WS_URL = 'ws://127.0.0.1:5000';

export function useChat(username) {
  const wsRef = useRef(null);
  const [rooms, setRooms] = useState([]);
  const [roomId, setRoomId] = useState(null);
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    const ws = new WebSocket(WS_URL);
    wsRef.current = ws;

    ws.onopen = () => ws.send(JSON.stringify({ type: 'login', username }));

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.type === 'rooms') setRooms(data.rooms);
      if (data.type === 'joined') {
        setRoomId(data.roomId);
        setMessages(data.messages); // повна історія кімнати
      }
      if (data.type === 'message') {
        setMessages((prev) => [...prev, data.message]);
      }
    };

    return () => ws.close();
  }, [username]);

  const send = useCallback((payload) => {
    const ws = wsRef.current;
    if (ws?.readyState === WebSocket.OPEN) ws.send(JSON.stringify(payload));
  }, []);

  return {
    rooms,
    roomId,
    messages,
    sendMessage: (text) => send({ type: 'message', text }),
    joinRoom: (id) => send({ type: 'joinRoom', roomId: id }),
    createRoom: (name) => send({ type: 'createRoom', name }),
    renameRoom: (id, name) => send({ type: 'renameRoom', roomId: id, name }),
    deleteRoom: (id) => send({ type: 'deleteRoom', roomId: id }),
  };
}