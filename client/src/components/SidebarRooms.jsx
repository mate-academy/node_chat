import { useState } from 'react';

export const SidebarRooms = ({
  availableRooms,
  activeRoom,
  onRoomSelect,
  onCreateRoom,
}) => {
  const [inputValue, setInputValue] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const tryCreateRoom = () => {
    const name = inputValue.trim();

    if (!name) {
      setErrorMsg('Please enter a valid room name');
      return;
    }

    const duplicate = availableRooms.some(room => room.title === name);
    if (duplicate) {
      setErrorMsg('This room already exists');
      return;
    }

    onCreateRoom(name);
    onRoomSelect(name);
    setInputValue('');
  };

  return (
    <aside className="w-full max-w-xs px-4">
      <h3 className="text-md font-bold mb-3">Available Rooms</h3>

      <ul className="flex flex-col gap-2 mb-4">
        {availableRooms.map((room) => (
          <li key={room.id}>
            <button
              className={`w-full text-left px-4 py-2 rounded transition ${
                room.title === activeRoom
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 hover:bg-gray-200'
              }`}
              onClick={() => onRoomSelect(room.title)}
            >
              {room.title}
            </button>
          </li>
        ))}
      </ul>

      <input
        type="text"
        value={inputValue}
        onChange={(e) => {
          setErrorMsg('');
          setInputValue(e.target.value);
        }}
        placeholder="Create new room"
        className="w-full border border-gray-300 rounded px-3 py-2"
      />

      {errorMsg && (
        <p className="text-sm text-red-600 mt-1 mb-2">{errorMsg}</p>
      )}

      <button
        onClick={tryCreateRoom}
        className="w-full bg-emerald-500 text-white py-2 rounded hover:bg-emerald-600 transition"
      >
        Add Room
      </button>
    </aside>
  );
};
