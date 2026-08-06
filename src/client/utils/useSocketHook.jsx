import { io } from 'socket.io-client';
import { useEffect, useState } from 'react';

const socket = io('http://localhost:3005');

export const useSocketHook = () => {
  const [rooms, setRooms] = useState([]);
  const [backMessages, setBackMessages] = useState([]);
  const [currentRoom, setCurrentRoom] = useState('');

  useEffect(() => {
    socket.on('update_rooms', (backEndRooms) => {
      setRooms(backEndRooms);
    });

    socket.on('room_history', (backEndMessages) => {
      setBackMessages(backEndMessages);
    });

    socket.on('receive_message', (newMessage) => {
      setBackMessages((prev) => [...prev, newMessage]);
    });

    socket.on('room_deleted', () => {
      setCurrentRoom('');
      setBackMessages([]);
    });

    return () => {
      socket.off('update_rooms');
      socket.off('room_history');
      socket.off('receive_message');
      socket.off('room_deleted');
    };
  }, []);

  const roomCreate = (newRoom) => {
    const normalize = newRoom.trim();

    socket.emit('create_room', normalize);
  };

  const sendMessage = (author, message) => {
    const normalize = message.trim();

    socket.emit('send_message', {
      room: currentRoom,
      message: normalize,
      author,
    });
  };

  const roomSelected = (selected) => {
    socket.emit('join_room', selected);
    setCurrentRoom(selected);
  };

  const deleteRoom = (roomToDeleteId) => {
    socket.emit('delete_room', roomToDeleteId.id);
  };
  const rename = (newRoomName) => {
    socket.emit('edit_room', { roomId: currentRoom, newName: newRoomName });
  };

  return {
    rename,
    deleteRoom,
    roomCreate,
    roomSelected,
    sendMessage,
    rooms,
    backMessages,
    currentRoom,
    setCurrentRoom,
  };
};
