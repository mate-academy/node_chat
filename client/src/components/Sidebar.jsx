import { useState } from 'react';
import { RoomItem } from './RoomItem';

export function Sidebar({
  username,
  rooms,
  activeRoomId,
  onSelectRoom,
  onCreateRoom,
  onRenameRoom,
  onDeleteRoom,
  onLogout,
}) {
  const [newRoom, setNewRoom] = useState('');

  function createRoom(event) {
    event.preventDefault();
    const trimmed = newRoom.trim();
    if (trimmed) {
      onCreateRoom(trimmed);
      setNewRoom('');
    }
  }

  return (
    <aside className="flex w-72 flex-col border-r border-slate-200 bg-white">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 px-4 py-4">
        <div className="flex items-center gap-2">
          <span className="text-xl">💬</span>
          <span className="font-bold text-slate-800">Chat</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-600">
            {username}
          </span>
          <button
            onClick={onLogout}
            className="text-xs text-slate-400 hover:text-slate-600"
            title="Change username"
          >
            ⎋
          </button>
        </div>
      </div>

      {/* New room */}
      <form onSubmit={createRoom} className="flex gap-2 p-3">
        <input
          value={newRoom}
          onChange={(e) => setNewRoom(e.target.value)}
          placeholder="New room name…"
          className="min-w-0 flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
        />
        <button
          type="submit"
          disabled={!newRoom.trim()}
          className="rounded-xl bg-indigo-500 px-3 py-2 text-sm font-semibold text-white transition hover:bg-indigo-600 disabled:opacity-40"
        >
          +
        </button>
      </form>

      {/* Room list */}
      <div className="flex-1 space-y-1 overflow-y-auto px-2 pb-3">
        {rooms.length === 0 ? (
          <p className="px-3 py-6 text-center text-sm text-slate-400">
            No rooms yet.<br />Create one above
          </p>
        ) : (
          rooms.map((room) => (
            <RoomItem
              key={room.id}
              room={room}
              active={room.id === activeRoomId}
              onSelect={onSelectRoom}
              onRename={onRenameRoom}
              onDelete={onDeleteRoom}
            />
          ))
        )}
      </div>
    </aside>
  );
}
