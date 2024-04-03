import React, { useState } from 'react';

export const Room = ({ room, setRoom, setMessages, messages }) => {
  const [rooms, setRooms] = useState(['room1', 'room2', 'room3']);

  const handleRoomChange = (event) => {
    setRoom(event.target.value);
  };

  const handleCreateRoom = () => {
    const roomName = prompt('Enter the name for the new room:');
    if (roomName) {
      setRooms([...rooms, roomName]);
    }
  };

  const handleRenameRoom = () => {
    const newRoomName = prompt('Enter the new name for the room:', room);
    if (newRoomName) {

      const updatedMessages = messages.map(message => {
        if (message.room === room) {
          message.room = newRoomName;
        }
        return message;
      })

      setMessages(updatedMessages);
      setRooms(rooms.map(r => r === room ? newRoomName : r));
      setRoom(newRoomName);
    }
  };

  const handleDeleteRoom = () => {
    const confirmDelete = window.confirm(`Are you sure you want to delete room ${room}?`);
    if (confirmDelete) {
      setRooms(rooms.filter(r => r !== room));
      setRoom(rooms[0] || '');
    }
  };

  return (
    <>
      <h2>{room}</h2>
      <select value={room} onChange={handleRoomChange}>
        {rooms.map(r => <option key={r} value={r}>{r}</option>)}
      </select>
      <button onClick={handleCreateRoom}>Create Room</button>
      <button onClick={handleRenameRoom}>Rename Room</button>
      <button onClick={handleDeleteRoom}>Delete Room</button>
    </>
  );
};
