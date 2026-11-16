import { useCallback, useEffect, useRef, useState } from 'react';

const WS_URL = process.env.REACT_APP_WS_URL || 'ws://localhost:5000';
const RECONNECT_DELAY = 1000;

// Keeps one WebSocket connection to the chat server
// and turns server events into React state.
export function useChat() {
  const [isConnected, setIsConnected] = useState(false);
  const [rooms, setRooms] = useState([]);
  const [currentRoomId, setCurrentRoomId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const socketRef = useRef(null);
  // The socket handler is created once, so it reads the current room from a ref
  const currentRoomIdRef = useRef(null);

  const sendToServer = useCallback((data) => {
    const socket = socketRef.current;

    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify(data));
    }
  }, []);

  const join = useCallback((roomId) => {
    currentRoomIdRef.current = roomId;
    setCurrentRoomId(roomId);
    setMessages([]);
    setNotice('');
    sendToServer({ type: 'join', roomId });
  }, [sendToServer]);

  useEffect(() => {
    let reconnectTimer = null;
    let isClosedByUs = false;

    function handleServerEvent(event) {
      let data;

      try {
        data = JSON.parse(event.data);
      } catch {
        return;
      }

      switch (data.type) {
        case 'rooms':
          setRooms(data.rooms);
          break;

        case 'history':
          if (data.roomId === currentRoomIdRef.current) {
            setMessages(data.messages);
          }
          break;

        case 'message':
          if (data.message.roomId === currentRoomIdRef.current) {
            setMessages(prev => [...prev, data.message]);
          }
          break;

        case 'roomDeleted':
          if (data.roomId === currentRoomIdRef.current) {
            currentRoomIdRef.current = null;
            setCurrentRoomId(null);
            setMessages([]);
            setNotice('The room you were in has been deleted');
          }
          break;

        case 'error':
          setError(data.message);
          break;

        default:
          break;
      }
    }

    function connect() {
      const socket = new WebSocket(WS_URL);

      socketRef.current = socket;

      socket.onopen = () => {
        setIsConnected(true);
        setError('');

        // After a reconnect the server does not remember our room - join again
        if (currentRoomIdRef.current) {
          socket.send(JSON.stringify({
            type: 'join',
            roomId: currentRoomIdRef.current,
          }));
        }
      };

      socket.onmessage = handleServerEvent;

      socket.onclose = () => {
        setIsConnected(false);

        if (!isClosedByUs) {
          reconnectTimer = setTimeout(connect, RECONNECT_DELAY);
        }
      };
    }

    connect();

    return () => {
      isClosedByUs = true;
      clearTimeout(reconnectTimer);
      socketRef.current?.close();
    };
  }, []);

  // Enter the first room automatically, so the user sees a chat right away
  useEffect(() => {
    if (!currentRoomId && rooms.length > 0 && !notice) {
      join(rooms[0].id);
    }
  }, [rooms, currentRoomId, notice, join]);

  return {
    isConnected,
    rooms,
    currentRoomId,
    messages,
    error,
    notice,
    clearError: () => setError(''),
    join,
    createRoom: name => sendToServer({ type: 'createRoom', name }),
    renameRoom: (roomId, name) => sendToServer({
      type: 'renameRoom',
      roomId,
      name,
    }),
    deleteRoom: roomId => sendToServer({ type: 'deleteRoom', roomId }),
    sendMessage: (author, text) => sendToServer({
      type: 'message',
      author,
      text,
    }),
  };
}
