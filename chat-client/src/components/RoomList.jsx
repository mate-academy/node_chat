import { useState } from "react";

export function RoomList({ rooms, selectedRoom, setSelectedRoom, createRoomRequest }) {
  const [roomError, setRoomError] = useState('');
  const [newRoomName, setNewRoomName] = useState('');

  const handleCreateRoom = () => {
    const trimmedName = newRoomName.trim();
    if (!trimmedName) {
      setRoomError('Room name cannot be empty');
      return;
    }

    if (rooms.find((room) => room.name === trimmedName)) {
      setRoomError('Room with this name already exists');
      return;
    }
    createRoomRequest(trimmedName);

    setSelectedRoom(newRoomName);
    setNewRoomName('');


  };

  return (
    <div className="w-1/4">
      <h2 className="text-lg font-semibold mb-2">Rooms</h2>
      <ul className="space-y-4 mb-4">
        {rooms.map((r) => (
          <li key={r.id}>
            <button
              className={`block w-full text-left px-3 py-2 rounded ${
                r.name === selectedRoom
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 hover:bg-gray-200'
              }`}
              onClick={() => setSelectedRoom(r.name)}
            >
              {r.name}
            </button>
          </li>
        ))}
      </ul>
      <input
        value={newRoomName}
        onChange={(e) => {
          setRoomError('');
          setNewRoomName(e.target.value);
        }}
        className="border p-2 w-full rounded"
        placeholder="New room"
      />
      {roomError && (
        <div className="text-red-500 text-sm mt-1 mb-2">{roomError}</div>
      )}
      <button
        onClick={handleCreateRoom}
        className="w-full bg-green-500 text-white py-2 mt-2 rounded"
      >
        Create Room
      </button>
    </div>
  );
}
