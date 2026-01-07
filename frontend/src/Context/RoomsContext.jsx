import React from 'react';
import { useState } from 'react';
import { roomsService } from '../services/roomsService';
import { useEffect } from 'react';

export const RoomsContext = React.createContext();

export const RoomsProvider = ({ children }) => {
  const [rooms, setRooms] = useState([]);
  const [socket, setSocket] = useState(null);

  const getRooms = async () => {
    const data = await roomsService.getAll();
    setRooms(data);
  };

  const sendMessage = (type, payload) => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({ type, payload }));
    } else {
      console.warn('Error');
    }
  };

  useEffect(() => {
    getRooms();

    const ws = new WebSocket(import.meta.env.VITE_WS_URL);

    ws.onopen = () => {
      console.log('WS connected');
      setSocket(ws);
    };

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      const { type, data } = message;

      switch (type) {
        case 'ROOM_CREATED':
          setRooms((prev) => [...prev, data]);
          break;
        case 'ROOM_DELETED':
          setRooms((prev) => prev.filter((room) => room.id !== data.id));
          break;
        case 'ROOM_UPDATED':
          setRooms((prev) =>
            prev.map((room) => (room.id === data.id ? data : room)),
          );
          break;
        default:
          break;
      }
    };

    ws.onclose = () => {
      console.log('WS disconnected');
      setSocket(null);
    };

    return () => {
      if (ws) {
        ws.close();
      }
    };
  }, []);

  const value = {
    rooms,
    socket,
    sendMessage,
  };

  return (
    <RoomsContext.Provider value={value}>{children}</RoomsContext.Provider>
  );
};
