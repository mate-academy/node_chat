import { useEffect, useRef, useState, useCallback } from 'react';

const WS_URL = 'ws://localhost:5000';
const MAX_RECONNECT_DELAY = 10000; 

export function useWebSocket() {
  const wsRef = useRef(null);
  const reconnectAttemptRef = useRef(0);
  const reconnectTimeoutRef = useRef(null);
  const activeRoomIdRef = useRef(null);
  const lastJoinRef = useRef(null); 
  const scheduleReconnectRef = useRef(() => {});

  const [rooms, setRooms] = useState([]);
  const [activeRoomId, setActiveRoomId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState(null);
  const [typingUsers, setTypingUsers] = useState([]); 

  useEffect(() => {
    activeRoomIdRef.current = activeRoomId;
  }, [activeRoomId]);

  const connect = useCallback(() => {
    const ws = new WebSocket(WS_URL);
    wsRef.current = ws;

    ws.onopen = () => {
      setIsConnected(true);
      reconnectAttemptRef.current = 0;

      if (lastJoinRef.current) {
        ws.send(
          JSON.stringify({
            type: 'join',
            username: lastJoinRef.current.username,
            roomId: activeRoomIdRef.current,
          }),
        );
      }
    };

    ws.onclose = () => {
      setIsConnected(false);
      scheduleReconnectRef.current();
    };

    ws.onerror = () => {
      ws.close();
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);

      switch (data.type) {
        case 'rooms':
          setRooms(data.rooms);
          break;

        case 'history':
          setActiveRoomId(data.roomId);
          setMessages(data.messages);
          setTypingUsers([]);
          break;

        case 'message':
          if (data.roomId === activeRoomIdRef.current) {
            setMessages((prev) => [...prev, data.message]);
          }
          break;

        case 'typing':
          if (data.roomId === activeRoomIdRef.current) {
            setTypingUsers((prev) =>
              prev.includes(data.username) ? prev : [...prev, data.username],
            );

            setTimeout(() => {
              setTypingUsers((prev) =>
                prev.filter((name) => name !== data.username),
              );
            }, 3000);
          }
          break;

        case 'typing_stop':
          setTypingUsers((prev) =>
            prev.filter((name) => name !== data.username),
          );
          break;

        case 'error':
          setError(data.message);
          break;

        default:
          break;
      }
    };
  }, []);

  const scheduleReconnect = useCallback(() => {
    clearTimeout(reconnectTimeoutRef.current);

    const attempt = reconnectAttemptRef.current;
    const delay = Math.min(1000 * 2 ** attempt, MAX_RECONNECT_DELAY);

    reconnectTimeoutRef.current = setTimeout(() => {
      reconnectAttemptRef.current += 1;
      connect();
    }, delay);
  }, [connect]);

  useEffect(() => {
    scheduleReconnectRef.current = scheduleReconnect;
  }, [scheduleReconnect]);

  useEffect(() => {
    connect();

    return () => {
      clearTimeout(reconnectTimeoutRef.current);
      wsRef.current?.close();
    };
  }, [connect]);

  const send = useCallback((data) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(data));
    }
  }, []);

  const join = useCallback(
    (username, roomId) => {
      lastJoinRef.current = { username, roomId };
      send({ type: 'join', username, roomId });
    },
    [send],
  );

  const switchRoom = useCallback(
    (roomId) => send({ type: 'switch_room', roomId }),
    [send],
  );

  const sendMessage = useCallback(
    (text) => send({ type: 'message', text }),
    [send],
  );

  const sendTyping = useCallback(() => send({ type: 'typing' }), [send]);

  const createRoom = useCallback(
    (name) => send({ type: 'create_room', name }),
    [send],
  );

  const renameRoom = useCallback(
    (roomId, name) => send({ type: 'rename_room', roomId, name }),
    [send],
  );

  const deleteRoom = useCallback(
    (roomId) => send({ type: 'delete_room', roomId }),
    [send],
  );

  return {
    isConnected,
    error,
    rooms,
    activeRoomId,
    messages,
    typingUsers,
    join,
    switchRoom,
    sendMessage,
    sendTyping,
    createRoom,
    renameRoom,
    deleteRoom,
  };
}